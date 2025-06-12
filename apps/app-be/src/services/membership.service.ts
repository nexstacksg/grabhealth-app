import { PrismaClient, UserMembership, MembershipTier } from "@prisma/client";
import {
  IMembershipCreate,
  MembershipStatus,
  MembershipTier as MembershipTierEnum,
} from "@app/shared-types";
import { AppError } from "../middleware/error/errorHandler";

export class MembershipService {
  constructor(private prisma: PrismaClient) {}

  // Create or update membership tier
  async createMembershipTier(data: IMembershipCreate): Promise<MembershipTier> {
    try {
      return await this.prisma.membershipTier.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price, // Should be 0 for free membership
          benefits: data.benefits,
        },
      });
    } catch (_error) {
      throw new AppError("Failed to create membership tier", 500);
    }
  }

  // Get all membership tiers
  async getMembershipTiers(): Promise<MembershipTier[]> {
    try {
      return await this.prisma.membershipTier.findMany({
        orderBy: { price: "asc" },
      });
    } catch (_error) {
      throw new AppError("Failed to get membership tiers", 500);
    }
  }

  // Get membership tier by ID
  async getMembershipTier(id: number): Promise<MembershipTier | null> {
    try {
      return await this.prisma.membershipTier.findUnique({
        where: { id },
      });
    } catch (_error) {
      throw new AppError("Failed to get membership tier", 500);
    }
  }

  // Update membership tier
  async updateMembershipTier(
    id: number,
    data: Partial<IMembershipCreate>
  ): Promise<MembershipTier> {
    try {
      return await this.prisma.membershipTier.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.benefits !== undefined && { benefits: data.benefits }),
        },
      });
    } catch (_error) {
      throw new AppError("Failed to update membership tier", 500);
    }
  }

  // Create user membership
  async createUserMembership(
    userId: string,
    tierId: number
  ): Promise<UserMembership> {
    try {
      // Verify tier exists
      const tier = await this.prisma.membershipTier.findUnique({
        where: { id: tierId },
      });

      if (!tier) {
        throw new AppError("Membership tier not found", 404);
      }

      // Check if user already has active membership
      const existingMembership = await this.prisma.userMembership.findFirst({
        where: {
          userId,
          status: MembershipStatus.ACTIVE,
        },
      });

      if (existingMembership) {
        // Update existing membership
        return await this.prisma.userMembership.update({
          where: { id: existingMembership.id },
          data: {
            tierId,
            startDate: new Date(),
            endDate: this.calculateEndDate(tier.name),
          },
        });
      }

      // Create new membership
      return await this.prisma.userMembership.create({
        data: {
          userId,
          tierId,
          status: MembershipStatus.ACTIVE,
          startDate: new Date(),
          endDate: this.calculateEndDate(tier.name),
          autoRenew: true,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError("Failed to create user membership", 500);
    }
  }

  // Get user membership
  async getUserMembership(userId: string): Promise<UserMembership | null> {
    try {
      const membership = await this.prisma.userMembership.findFirst({
        where: {
          userId,
          status: MembershipStatus.ACTIVE,
        },
        include: {
          tier: true,
        },
      });

      // Check if membership has expired
      if (membership && membership.endDate && membership.endDate < new Date()) {
        await this.prisma.userMembership.update({
          where: { id: membership.id },
          data: { status: MembershipStatus.EXPIRED },
        });
        return null;
      }

      return membership;
    } catch (_error) {
      throw new AppError("Failed to get user membership", 500);
    }
  }

  // Cancel user membership
  async cancelUserMembership(userId: string): Promise<UserMembership> {
    try {
      const membership = await this.prisma.userMembership.findFirst({
        where: {
          userId,
          status: MembershipStatus.ACTIVE,
        },
      });

      if (!membership) {
        throw new AppError("No active membership found", 404);
      }

      return await this.prisma.userMembership.update({
        where: { id: membership.id },
        data: {
          status: MembershipStatus.CANCELLED,
          autoRenew: false,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError("Failed to cancel membership", 500);
    }
  }

  // Update membership auto-renewal
  async updateAutoRenew(
    userId: string,
    autoRenew: boolean
  ): Promise<UserMembership> {
    try {
      const membership = await this.prisma.userMembership.findFirst({
        where: {
          userId,
          status: MembershipStatus.ACTIVE,
        },
      });

      if (!membership) {
        throw new AppError("No active membership found", 404);
      }

      return await this.prisma.userMembership.update({
        where: { id: membership.id },
        data: { autoRenew },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError("Failed to update auto-renewal", 500);
    }
  }

  // Get all user memberships (admin)
  async getAllUserMemberships(filters: {
    status?: MembershipStatus;
    tierId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    memberships: UserMembership[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { status, tierId, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (tierId) where.tierId = tierId;

      const [memberships, total] = await Promise.all([
        this.prisma.userMembership.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            tier: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.userMembership.count({ where }),
      ]);

      return {
        memberships,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (_error) {
      throw new AppError("Failed to get user memberships", 500);
    }
  }

  // Process expired memberships
  async processExpiredMemberships(): Promise<number> {
    try {
      const expiredMemberships = await this.prisma.userMembership.updateMany({
        where: {
          status: MembershipStatus.ACTIVE,
          endDate: { lt: new Date() },
        },
        data: { status: MembershipStatus.EXPIRED },
      });

      return expiredMemberships.count;
    } catch (_error) {
      throw new AppError("Failed to process expired memberships", 500);
    }
  }

  // Get membership statistics
  async getMembershipStats(): Promise<{
    totalActive: number;
    totalExpired: number;
    totalCancelled: number;
    revenueByTier: any[];
  }> {
    try {
      const [totalActive, totalExpired, totalCancelled, revenueByTier] =
        await Promise.all([
          this.prisma.userMembership.count({
            where: { status: MembershipStatus.ACTIVE },
          }),
          this.prisma.userMembership.count({
            where: { status: MembershipStatus.EXPIRED },
          }),
          this.prisma.userMembership.count({
            where: { status: MembershipStatus.CANCELLED },
          }),
          this.prisma.userMembership.groupBy({
            by: ["tierId"],
            where: { status: MembershipStatus.ACTIVE },
            _count: true,
          }),
        ]);

      // Get tier details for revenue calculation
      const revenueDetails = await Promise.all(
        revenueByTier.map(async (item) => {
          const tier = await this.prisma.membershipTier.findUnique({
            where: { id: item.tierId },
          });
          return {
            tier: tier?.name || "Unknown",
            count: item._count,
            revenue: tier ? tier.price * item._count : 0,
          };
        })
      );

      return {
        totalActive,
        totalExpired,
        totalCancelled,
        revenueByTier: revenueDetails,
      };
    } catch (_error) {
      throw new AppError("Failed to get membership stats", 500);
    }
  }

  // Helper method to calculate end date based on tier
  private calculateEndDate(tierName: string): Date {
    const now = new Date();
    const endDate = new Date(now);

    switch (tierName) {
      case MembershipTierEnum.FREE:
      case MembershipTierEnum.BASIC:
        endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    return endDate;
  }
}
