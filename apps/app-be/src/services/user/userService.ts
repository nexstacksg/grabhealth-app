import prisma from "../../database/client";
import { ApiError } from "../../middleware/error/errorHandler";
import { hashPassword, verifyPassword } from "../../utils/auth";
import { HttpStatus, ErrorCode, UserRole, UserStatus } from "@app/shared-types";

export class UserService {
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<any> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(
        "User with this email already exists",
        HttpStatus.BAD_REQUEST,
        ErrorCode.USER_EXISTS
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  async getUserList(
    filters: {
      role?: UserRole;
      status?: UserStatus;
      search?: string;
    },
    pagination: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      status?: UserStatus;
    }
  ): Promise<any> {
    // Check user exists
    await this.getUserById(id);

    // If updating email, check for duplicates
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ApiError(
          "User with this email already exists",
          HttpStatus.BAD_REQUEST,
          ErrorCode.USER_EXISTS
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Check user exists
    await this.getUserById(id);

    // Delete user and related data
    await prisma.$transaction([
      // Delete user's personal data
      prisma.auditLog.deleteMany({ where: { userId: id } }),
      // Finally delete the user
      prisma.user.delete({ where: { id } }),
    ]);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<any> {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    // Verify old password
    const isValidPassword = await verifyPassword(oldPassword, user.password);

    if (!isValidPassword) {
      throw new ApiError(
        "Invalid current password",
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async getUserPermissions(id: string): Promise<string[]> {
    const user = await this.getUserById(id);

    // Define permissions based on role
    const permissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: [
        "user:manage",
        "user:create",
        "user:delete",
        "user:update",
        "role:manage",
        "audit:view",
        "settings:manage",
        "commission:manage",
        "order:manage",
        "product:manage",
      ],
      [UserRole.COMPANY]: [
        "user:view",
        "user:create",
        "user:update",
        "audit:view",
        "commission:view",
        "commission:manage",
        "order:view",
        "order:update",
        "product:view",
        "network:view",
      ],
      [UserRole.MANAGER]: [
        "user:view",
        "user:create",
        "user:update",
        "audit:view",
        "commission:view",
        "order:view",
        "product:view",
        "network:view",
      ],
      [UserRole.LEADER]: [
        "profile:view",
        "profile:update",
        "commission:view",
        "order:view",
        "order:create",
        "product:view",
        "network:view",
      ],
      [UserRole.SALES]: [
        "profile:view",
        "profile:update",
        "commission:view",
        "order:view",
        "order:create",
        "product:view",
        "downline:view",
      ],
      [UserRole.USER]: [
        "profile:view",
        "profile:update",
        "order:view",
        "order:create",
        "product:view",
      ],
    };

    return permissions[user.role as UserRole] || [];
  }
}

export default new UserService();
