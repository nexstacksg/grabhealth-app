'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { ICommission } from '@app/shared-types';

// Extended commission type with additional display properties
type CommissionWithDetails = ICommission & {
  order_id?: number;
  user_id?: number;
  created_at?: string;
  commission_rate?: number;
  relationship_level?: number;
  buyer_name?: string;
};

type CommissionHistoryProps = {
  commissions: (ICommission | CommissionWithDetails)[];
};

export default function CommissionHistory({
  commissions,
}: CommissionHistoryProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission History</CardTitle>
        <CardDescription>
          View your earned commissions from sales in your network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => {
                const c = commission as CommissionWithDetails;
                const dateStr = c.created_at || (c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt);
                const orderId = c.order_id ?? c.orderId;
                const userId = c.user_id ?? c.userId;
                const relationshipLevel = c.relationship_level ?? c.relationshipLevel;
                const commissionRate = c.commission_rate ?? c.commissionRate;
                
                return (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">
                      {formatDate(dateStr || '')}
                    </TableCell>
                    <TableCell>#{orderId}</TableCell>
                    <TableCell>
                      {c.buyer_name || `User #${userId}`}
                    </TableCell>
                    <TableCell>Tier {relationshipLevel}</TableCell>
                    <TableCell>
                      {(commissionRate * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(commission.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(commission.status)}>
                        {commission.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No commission history found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start growing your network to earn commissions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
