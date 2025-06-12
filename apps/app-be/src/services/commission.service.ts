import { PrismaClient, Commission, UserRelationship } from "@prisma/client";
import {
  CommissionStatus,
  CommissionType,
  INetworkNode,
} from "@app/shared-types";
import { AppError } from "../middleware/error/errorHandler";

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
        throw new AppError("Order not found", 404);
      }

      const commissions: Commission[] = [];

      // Get upline chain (up to 5 levels)
      const uplineChain = await this.getUplineChain(order.userId, 5);

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
      throw new AppError("Failed to process commission", 500);
    }
  }

  private getCommissionRateByLevel(level: number): number {
    // Default commission structure - should be configurable
    const rates: { [key: number]: number } = {
      1: 0.1, // 10% for direct referral
      2: 0.07, // 7% for level 2
      3: 0.05, // 5% for level 3
      4: 0.03, // 3% for level 4
      5: 0.02, // 2% for level 5
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
    type: "earned" | "generated" = "earned"
  ): Promise<Commission[]> {
    try {
      const where = type === "earned" ? { recipientId: userId } : { userId };

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
        orderBy: { createdAt: "desc" },
      });
    } catch (_error) {
      throw new AppError("Failed to get user commissions", 500);
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
      throw new AppError("Failed to get commission stats", 500);
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
        throw new AppError("User not found", 404);
      }

      const network = await this.buildNetworkTree(userId, 1, 5);

      return {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        level: 0,
        totalSales: user.orders.reduce((sum, order) => sum + order.total, 0),
        totalCommissions: user.commissionsReceived.reduce(
          (sum, c) => sum + c.amount,
          0
        ),
        downlines: network,
      };
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError("Failed to get user network", 500);
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
        userId: rel.user.id,
        userName: `${rel.user.firstName} ${rel.user.lastName}`,
        userEmail: rel.user.email,
        uplineId,
        level: currentLevel,
        totalSales: rel.user.orders.reduce(
          (sum, order) => sum + order.total,
          0
        ),
        totalCommissions: rel.user.commissionsReceived.reduce(
          (sum, c) => sum + c.amount,
          0
        ),
        downlines,
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
        throw new AppError("Relationship already exists", 400);
      }

      // Check for circular reference
      const uplineChain = await this.getUplineChain(uplineId, 10);
      if (uplineChain.includes(userId)) {
        throw new AppError("Circular reference detected", 400);
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
      throw new AppError("Failed to create relationship", 500);
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
      throw new AppError("Failed to update commission status", 500);
    }
  }
}
