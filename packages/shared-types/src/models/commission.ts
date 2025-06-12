import { CommissionStatus, CommissionType, RoleType } from '../enums/commission';

export interface ICommission {
  id: number;
  orderId: number;
  userId: string; // Changed to string to match backend User model
  recipientId: string; // Changed to string to match backend User model
  amount: number;
  commissionRate: number;
  relationshipLevel: number;
  type?: CommissionType;
  status: CommissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRelationship {
  id: number;
  userId: string; // Changed to string to match backend User model
  uplineId?: string; // Changed to string to match backend User model
  relationshipLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionTier {
  id: number;
  tierLevel: number;
  tierName: string;
  directCommissionRate: number;
  indirectCommissionRate: number;
  pointsRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPoints {
  id: number;
  userId: string; // Changed to string to match backend User model
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRoleType {
  id: number;
  roleName: RoleType;
  description?: string;
  commissionMultiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionCreate {
  orderId: number;
  userId: string; // Changed to string to match backend User model
  recipientId: string; // Changed to string to match backend User model
  amount: number;
  commissionRate: number;
  relationshipLevel: number;
  type?: CommissionType;
  status?: CommissionStatus;
}

export interface ICommissionStructure {
  roleType: RoleType;
  commissionRate: number;
  priceMultiplier: number;
  level: number;
}

export interface INetworkNode {
  userId: string; // Changed to string to match backend User model
  userName: string;
  userEmail: string;
  uplineId?: string; // Changed to string to match backend User model
  level: number;
  totalSales: number;
  totalCommissions: number;
  downlines: INetworkNode[];
}