export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COMPANY: "COMPANY",
  MANAGER: "MANAGER",
  LEADER: "LEADER",
  SALES: "SALES",
  USER: "USER",
} as const;

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];