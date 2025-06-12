import { CommissionStatus, CommissionType, RoleType } from '../enums/commission';

export interface ICommission {
  id: number;
  orderId: number;
  userId: number;
  recipientId: number;
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
  userId: number;
  uplineId?: number;
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
  userId: number;
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
  userId: number;
  recipientId: number;
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
  userId: number;
  userName: string;
  userEmail: string;
  uplineId?: number;
  level: number;
  totalSales: number;
  totalCommissions: number;
  downlines: INetworkNode[];
}