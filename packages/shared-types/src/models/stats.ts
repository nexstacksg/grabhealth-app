export interface ICommissionStats {
  totalEarned: number;
  totalPending: number;
  totalPaid: number;
  thisMonth: number;
  lastMonth: number;
}

export interface IOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders?: number;
  averageOrderValue?: number;
}

export interface INetworkStats {
  totalMembers: number;
  activeMembers: number;
  totalSales: number;
  totalCommissions: number;
  levels: Array<{
    level: number;
    memberCount: number;
    totalSales: number;
  }>;
}

export interface ICommissionSummary {
  totalPaid: number;
  totalPending: number;
  totalEarned: number;
  periodSummary: {
    startDate: string;
    endDate: string;
    totalCommissions: number;
    totalOrders: number;
  };
  topEarners: Array<{
    userId: number;
    username: string;
    totalEarned: number;
    rank: number;
  }>;
}