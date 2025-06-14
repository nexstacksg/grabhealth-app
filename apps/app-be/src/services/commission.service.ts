import { PrismaClient, Commission, UserRelationship } from '@prisma/client';
import {
  CommissionStatus,
  CommissionType,
  INetworkNode,
} from '@app/shared-types';
import { AppError } from '../middleware/error/errorHandler';

export class CommissionService {
  constructor(private prisma: PrismaClient) {}

  async processOrderCommission(orderId: number): Promise<Commission[]> {
    try {
      // Get order with user and items
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              relationships: {
                include: {
                  upline: true,
                },
              },
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const commissions: Commission[] = [];

      // Get upline chain (up to 4 levels)
      const uplineChain = await this.getUplineChain(order.userId, 4);

      // Calculate commission for each upline level
      for (const [level, uplineUserId] of uplineChain.entries()) {
        const commissionRate = this.getCommissionRateByLevel(level + 1);
        const commissionAmount = order.total * commissionRate;

        if (commissionAmount > 0) {
          const commission = await this.prisma.commission.create({
            data: {
              orderId: order.id,
              userId: order.userId,
              recipientId: uplineUserId,
              amount: commissionAmount,
              commissionRate,
              relationshipLevel: level + 1,
              type:
                level === 0 ? CommissionType.DIRECT : CommissionType.INDIRECT,
              status: CommissionStatus.PENDING,
            },
          });
          commissions.push(commission);
        }
      }

      return commissions;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to process commission', 500);
    }
  }

  private getCommissionRateByLevel(level: number): number {
    // Commission structure based on commission.md
    const rates: { [key: number]: number } = {
      1: 0.3, // 30% for Level 1 (Sales)
      2: 0.1, // 10% for Level 2 (Leader)
      3: 0.05, // 5% for Level 3 (Manager)
      4: 0.05, // 5% for Level 4 (Company)
    };
    return rates[level] || 0;
  }

  async getUplineChain(userId: string, maxLevels: number): Promise<string[]> {
    const uplineChain: string[] = [];
    let currentUserId = userId;

    for (let i = 0; i < maxLevels; i++) {
      const relationship = await this.prisma.userRelationship.findFirst({
        where: { userId: currentUserId },
        include: { upline: true },
      });

      if (!relationship || !relationship.uplineId) {
        break;
      }

      uplineChain.push(relationship.uplineId);
      currentUserId = relationship.uplineId;
    }

    return uplineChain;
  }

  async getUserCommissions(
    userId: string,
    type: 'earned' | 'generated' = 'earned'
  ): Promise<Commission[]> {
    try {
      const where = type === 'earned' ? { recipientId: userId } : { userId };

      return await this.prisma.commission.findMany({
        where,
        include: {
          order: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          recipient: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (_error) {
      throw new AppError('Failed to get user commissions', 500);
    }
  }

  async getCommissionStats(userId: string): Promise<{
    totalEarned: number;
    totalPending: number;
    totalPaid: number;
    thisMonth: number;
    lastMonth: number;
  }> {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [totalEarned, totalPending, totalPaid, thisMonth, lastMonth] =
        await Promise.all([
          this.prisma.commission.aggregate({
            where: { recipientId: userId },
            _sum: { amount: true },
          }),
          this.prisma.commission.aggregate({
            where: { recipientId: userId, status: CommissionStatus.PENDING },
            _sum: { amount: true },
          }),
          this.prisma.commission.aggregate({
            where: { recipientId: userId, status: CommissionStatus.PAID },
            _sum: { amount: true },
          }),
          this.prisma.commission.aggregate({
            where: {
              recipientId: userId,
              createdAt: { gte: thisMonthStart },
            },
            _sum: { amount: true },
          }),
          this.prisma.commission.aggregate({
            where: {
              recipientId: userId,
              createdAt: {
                gte: lastMonthStart,
                lte: lastMonthEnd,
              },
            },
            _sum: { amount: true },
          }),
        ]);

      return {
        totalEarned: totalEarned._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        totalPaid: totalPaid._sum.amount || 0,
        thisMonth: thisMonth._sum.amount || 0,
        lastMonth: lastMonth._sum.amount || 0,
      };
    } catch (_error) {
      throw new AppError('Failed to get commission stats', 500);
    }
  }

  async getUserNetwork(userId: string): Promise<INetworkNode> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: true,
          commissionsReceived: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const network = await this.buildNetworkTree(userId, 1, 5);

      return {
        id: parseInt(user.id), // Convert string ID to number for INetworkNode
        username: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        level: 0,
        totalSales: user.orders.reduce((sum, order) => sum + order.total, 0),
        commissionEarned: user.commissionsReceived.reduce(
          (sum, c) => sum + c.amount,
          0
        ),
        isActive: user.status === 'ACTIVE',
        joinedAt: user.createdAt.toISOString(),
        children: network,
      };
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to get user network', 500);
    }
  }

  private async buildNetworkTree(
    uplineId: string,
    currentLevel: number,
    maxLevel: number
  ): Promise<INetworkNode[]> {
    if (currentLevel > maxLevel) {
      return [];
    }

    const relationships = await this.prisma.userRelationship.findMany({
      where: { uplineId },
      include: {
        user: {
          include: {
            orders: true,
            commissionsReceived: true,
          },
        },
      },
    });

    const nodes: INetworkNode[] = [];

    for (const rel of relationships) {
      const downlines = await this.buildNetworkTree(
        rel.userId,
        currentLevel + 1,
        maxLevel
      );

      nodes.push({
        id: parseInt(rel.user.id),
        username: rel.user.email,
        firstName: rel.user.firstName,
        lastName: rel.user.lastName,
        email: rel.user.email,
        role: rel.user.role,
        level: currentLevel,
        totalSales: rel.user.orders.reduce(
          (sum, order) => sum + order.total,
          0
        ),
        commissionEarned: rel.user.commissionsReceived.reduce(
          (sum, c) => sum + c.amount,
          0
        ),
        isActive: rel.user.status === 'ACTIVE',
        joinedAt: rel.user.createdAt.toISOString(),
        children: downlines,
      });
    }

    return nodes;
  }

  async createUserRelationship(
    userId: string,
    uplineId: string
  ): Promise<UserRelationship> {
    try {
      // Check if relationship already exists
      const existing = await this.prisma.userRelationship.findUnique({
        where: {
          userId_uplineId: {
            userId,
            uplineId,
          },
        },
      });

      if (existing) {
        throw new AppError('Relationship already exists', 400);
      }

      // Check for circular reference
      const uplineChain = await this.getUplineChain(uplineId, 10);
      if (uplineChain.includes(userId)) {
        throw new AppError('Circular reference detected', 400);
      }

      return await this.prisma.userRelationship.create({
        data: {
          userId,
          uplineId,
          relationshipLevel: 1,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to create relationship', 500);
    }
  }

  async updateCommissionStatus(
    commissionId: number,
    status: CommissionStatus
  ): Promise<Commission> {
    try {
      return await this.prisma.commission.update({
        where: { id: commissionId },
        data: { status },
      });
    } catch (_error) {
      throw new AppError('Failed to update commission status', 500);
    }
  }

  async getCommissionDetails(commissionId: number): Promise<Commission | null> {
    try {
      return await this.prisma.commission.findUnique({
        where: { id: commissionId },
        include: {
          recipient: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          order: {
            select: {
              id: true,
              total: true,
              createdAt: true,
            },
          },
        },
      });
    } catch (_error) {
      throw new AppError('Failed to get commission details', 500);
    }
  }

  async getNetworkStats(userId: string): Promise<any> {
    try {
      const network = await this.getUserNetwork(userId);

      let totalMembers = 0;
      let totalSales = 0;
      const levelStats: any[] = [];

      // Calculate stats for network
      const allMembers = new Set<string>();

      // Collect all members from downlines recursively
      const collectMembers = (node: INetworkNode, level: number) => {
        allMembers.add(node.id.toString());
        if (node.children && node.children.length > 0) {
          for (const downline of node.children) {
            collectMembers(downline, level + 1);
          }
        }
      };

      collectMembers(network, 1);
      totalMembers = allMembers.size;

      // Get total sales
      const salesData = await this.prisma.order.aggregate({
        where: {
          userId: { in: Array.from(allMembers) },
          status: 'COMPLETED',
        },
        _sum: { total: true },
      });

      totalSales = salesData._sum.total || 0;

      return {
        totalMembers,
        totalSales,
        levels: levelStats,
      };
    } catch (_error) {
      throw new AppError('Failed to get network stats', 500);
    }
  }

  async processPendingCommissions(
    commissionIds: number[]
  ): Promise<Commission[]> {
    try {
      const results = [];

      for (const id of commissionIds) {
        const commission = await this.prisma.commission.update({
          where: { id },
          data: {
            status: CommissionStatus.PAID,
          },
        });
        results.push(commission);
      }

      return results;
    } catch (_error) {
      throw new AppError('Failed to process commissions', 500);
    }
  }

  async getCommissionSummary(filters: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const where: any = {};

      if (filters.startDate && filters.endDate) {
        where.createdAt = {
          gte: filters.startDate,
          lte: filters.endDate,
        };
      }

      const [totalPaid, totalPending, totalCommissions, topEarners] =
        await Promise.all([
          this.prisma.commission.aggregate({
            where: { ...where, status: CommissionStatus.PAID },
            _sum: { amount: true },
          }),
          this.prisma.commission.aggregate({
            where: { ...where, status: CommissionStatus.PENDING },
            _sum: { amount: true },
          }),
          this.prisma.commission.count({ where }),
          this.prisma.commission.groupBy({
            by: ['recipientId'],
            where,
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 10,
          }),
        ]);

      // Get user details for top earners
      const topEarnersWithDetails = await Promise.all(
        topEarners.map(async (earner) => {
          const user = await this.prisma.user.findUnique({
            where: { id: earner.recipientId },
            select: { id: true, email: true, firstName: true, lastName: true },
          });
          return {
            user,
            totalEarned: earner._sum?.amount || 0,
          };
        })
      );

      return {
        totalPaid: totalPaid._sum.amount || 0,
        totalPending: totalPending._sum.amount || 0,
        totalCommissions,
        topEarners: topEarnersWithDetails,
      };
    } catch (_error) {
      throw new AppError('Failed to get commission summary', 500);
    }
  }
}
