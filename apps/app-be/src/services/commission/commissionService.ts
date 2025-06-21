import { PrismaClient } from '@prisma/client';
import type { Commission, UserRelationship } from '@prisma/client';
import {
  CommissionStatus,
  CommissionType,
  INetworkNode,
  INetwork,
} from '@app/shared-types';
import { AppError } from '../../middleware/error/errorHandler';

export class CommissionService {
  constructor(private prisma: PrismaClient) {}

  async processOrderCommission(orderId: number): Promise<Commission[]> {
    try {
      // Get order with user and items, including product pricing and commission tiers
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
              product: {
                include: {
                  productPricing: true,
                  productCommissions: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const commissions: Commission[] = [];

      // Get upline chain (up to 3 levels: Sales, Leader, Manager)
      const uplineChain = await this.getUplineChain(order.userId, 3);

      // Process commission for each order item
      for (const orderItem of order.items) {
        const product = orderItem.product;
        const productCommission = product.productCommissions;
        const productPricing = product.productPricing;

        if (!productCommission || !productPricing) {
          console.warn(
            `No commission structure found for product: ${product.name}`
          );
          continue;
        }

        // Calculate total PV points for this item
        const totalPvPoints = productPricing.pvValue * orderItem.quantity;

        // Update order item with PV points
        await this.prisma.orderItem.update({
          where: { id: orderItem.id },
          data: { pvPoints: totalPvPoints },
        });

        // Calculate commission for each upline level
        for (const [level, uplineUserId] of uplineChain.entries()) {
          const { commissionAmount, commissionRate, recipientRole } =
            this.getCommissionByLevel(
              level + 1,
              productCommission,
              orderItem.quantity
            );

          if (commissionAmount > 0) {
            const commission = await this.prisma.commission.create({
              data: {
                orderId: order.id,
                orderItemId: orderItem.id,
                productId: product.id,
                userId: order.userId,
                recipientId: uplineUserId,
                amount: commissionAmount,
                commissionRate,
                relationshipLevel: level + 1,
                recipientRole,
                type:
                  level === 0 ? CommissionType.DIRECT : CommissionType.INDIRECT,
                status: CommissionStatus.PENDING,
                pvPoints: totalPvPoints,
              },
            });
            commissions.push(commission);
          }
        }
      }

      return commissions;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to process commission', 500);
    }
  }

  private getCommissionByLevel(
    level: number,
    productCommission: any,
    quantity: number
  ): {
    commissionAmount: number;
    commissionRate: number;
    recipientRole: string;
  } {
    // Role-based commission structure for the 4-product model
    switch (level) {
      case 1: // Sales level
        return {
          commissionAmount: productCommission.salesCommissionAmount * quantity,
          commissionRate: productCommission.salesCommissionRate,
          recipientRole: 'SALES',
        };
      case 2: // Leader level
        return {
          commissionAmount: productCommission.leaderCommissionAmount * quantity,
          commissionRate: productCommission.leaderCommissionRate,
          recipientRole: 'LEADER',
        };
      case 3: // Manager level
        return {
          commissionAmount:
            productCommission.managerCommissionAmount * quantity,
          commissionRate: productCommission.managerCommissionRate,
          recipientRole: 'MANAGER',
        };
      default:
        return {
          commissionAmount: 0,
          commissionRate: 0,
          recipientRole: 'UNKNOWN',
        };
    }
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

  async getUserNetwork(userId: string): Promise<INetwork> {
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

      const rootUser: INetworkNode = {
        id: parseInt(user.id), // Convert string ID to number for INetworkNode
        username: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        level: 0,
        totalSales: user.orders.reduce((sum: number, order: any) => sum + order.total, 0),
        commissionEarned: user.commissionsReceived.reduce(
          (sum: number, c: any) => sum + c.amount,
          0
        ),
        isActive: user.status === 'ACTIVE',
        joinedAt: user.createdAt.toISOString(),
        children: network,
      };

      // Calculate total members and levels
      let totalMembers = 1; // Include root user
      let maxLevel = 0;

      const countMembersAndLevels = (
        node: INetworkNode,
        currentLevel: number
      ) => {
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            totalMembers++;
            maxLevel = Math.max(maxLevel, currentLevel);
            countMembersAndLevels(child, currentLevel + 1);
          }
        }
      };

      countMembersAndLevels(rootUser, 1);

      return {
        rootUser,
        totalLevels: maxLevel,
        totalMembers,
        maxLevels: 5, // We're limiting to 5 levels in buildNetworkTree
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
          (sum: number, order: any) => sum + order.total,
          0
        ),
        commissionEarned: rel.user.commissionsReceived.reduce(
          (sum: number, c: any) => sum + c.amount,
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

      collectMembers(network.rootUser, 1);
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
        topEarners.map(async (earner: any) => {
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

  // Get the 4-product commission structure for frontend display
  async getProductCommissionStructure(): Promise<any> {
    try {
      const products = await this.prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: {
          productPricing: true,
          productCommissions: true,
        },
        orderBy: { name: 'asc' },
      });

      return {
        products: products.map((product: any) => {
          const commission = product.productCommissions[0]; // Get first commission tier
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            customerPrice: product.productPricing?.customerPrice || 0,
            travelPackagePrice: product.productPricing?.travelPackagePrice,
            pvValue: product.productPricing?.pvValue || 0,
            commissionRates: {
              sales: commission?.salesCommissionRate || 0,
              leader: commission?.leaderCommissionRate || 0,
              manager: commission?.managerCommissionRate || 0,
            },
            commissionAmounts: {
              sales: commission?.salesCommissionAmount || 0,
              leader: commission?.leaderCommissionAmount || 0,
              manager: commission?.managerCommissionAmount || 0,
            },
          };
        }),
        roleTypes: [
          { id: 1, name: 'Sales', commissionRate: 0.3, level: 1 },
          { id: 2, name: 'Leader', commissionRate: 0.1, level: 2 },
          { id: 3, name: 'Manager', commissionRate: 0.05, level: 3 },
        ],
      };
    } catch (_error) {
      throw new AppError('Failed to get product commission structure', 500);
    }
  }
}
