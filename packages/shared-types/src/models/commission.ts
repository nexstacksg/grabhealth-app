import { CommissionStatus, CommissionType, RoleType } from '../enums/commission';

export interface ICommission {
  documentId: string; 
  orderId: string; 
  userId: string; 
  recipientId: string; 
  amount: number;
  commissionRate: number;
  relationshipLevel: number;
  type?: CommissionType;
  status: CommissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRelationship {
  documentId: string; // Strapi 5 document ID
  userId: string; 
  uplineId?: string; 
  relationshipLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionTier {
  documentId: string; // Strapi 5 document ID
  tierLevel: number;
  tierName: string;
  directCommissionRate: number;
  indirectCommissionRate: number;
  pointsRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPoints {
  documentId: string; // Strapi 5 document ID
  userId: string; // Changed to string to match backend User model
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRoleType {
  documentId: string; // Strapi 5 document ID
  roleName: RoleType;
  description?: string;
  commissionMultiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionCreate {
  orderId: string; 
  userId: string; 
  recipientId: string; 
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

export interface ICommissionNetworkNode {
  userId: string; 
  userName: string;
  userEmail: string;
  uplineId?: string; 
  level: number;
  totalSales: number;
  totalCommissions: number;
  downlines: ICommissionNetworkNode[];
}