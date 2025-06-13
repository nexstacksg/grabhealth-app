// Dashboard and Network Visualization Types

export interface INetworkNode {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  level: number;
  totalSales: number;
  commissionEarned: number;
  isActive: boolean;
  joinedAt: string;
  children?: INetworkNode[];
}

export interface INetwork {
  rootUser: INetworkNode;
  totalLevels: number;
  totalMembers: number;
  maxLevels?: number;
}