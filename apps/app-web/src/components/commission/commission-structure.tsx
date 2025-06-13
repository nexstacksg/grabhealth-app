'use client';

import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { commissionService } from '@/services/commission.service';
// Authentication is now handled at the page level

// Types for commission structure data
type ProductCommissionTier = {
  id: number;
  product_id: number;
  product_name: string;
  retail_price: number;
  trader_price: number;
  distributor_price: number;
  trader_commission_min: number;
  trader_commission_max: number;
  distributor_commission_min: number;
  distributor_commission_max: number;
  created_at: string;
  updated_at: string;
};

type UserRoleType = {
  id: number;
  role_name: string;
  description: string;
  commission_multiplier: number;
  created_at: string;
  updated_at: string;
};

type VolumeBonus = {
  id: number;
  min_volume: number;
  max_volume: number | null;
  bonus_percentage: number;
  created_at: string;
  updated_at: string;
};

// Define incentive structure
const incentiveStructure = [
  {
    name: 'Volume-based bonuses',
    description: 'Higher sales volumes unlock higher commission percentages',
  },
  {
    name: 'Referral incentives',
    description: 'Additional rewards for bringing new customers/distributors',
  },
  {
    name: 'Certification tier bonuses',
    description: 'Enhanced commissions for certified partners',
  },
];

// Format volume range for display
function formatVolumeRange(min: number, max: number | null): string {
  if (max === null) {
    return `$${min.toLocaleString()}+`;
  }
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

function CommissionStructure() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productTiers, setProductTiers] = useState<ProductCommissionTier[]>([]);
  const [roleTypes, setRoleTypes] = useState<UserRoleType[]>([]);
  const [volumeBonusTiers, setVolumeBonusTiers] = useState<VolumeBonus[]>([]);

  // Sample default data to use if API fails
  const defaultProductTiers: ProductCommissionTier[] = [
    {
      id: 1,
      product_id: 1,
      product_name: 'Health Supplement A',
      retail_price: 49.99,
      trader_price: 39.99,
      distributor_price: 29.99,
      trader_commission_min: 10,
      trader_commission_max: 15,
      distributor_commission_min: 20,
      distributor_commission_max: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      product_id: 2,
      product_name: 'Wellness Package B',
      retail_price: 99.99,
      trader_price: 79.99,
      distributor_price: 59.99,
      trader_commission_min: 12,
      trader_commission_max: 18,
      distributor_commission_min: 22,
      distributor_commission_max: 35,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultVolumeBonusTiers: VolumeBonus[] = [
    {
      id: 1,
      min_volume: 0,
      max_volume: 1000,
      bonus_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      min_volume: 1000,
      max_volume: 5000,
      bonus_percentage: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      min_volume: 5000,
      max_volume: null,
      bonus_percentage: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Fetch commission structure data
  useEffect(() => {
    const fetchCommissionStructure = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await commissionService.getCommissionStructure();

        // If we got empty data from the API, use defaults
        if (!data.productTiers || data.productTiers.length === 0) {
          setProductTiers(defaultProductTiers);
        } else {
          setProductTiers(data.productTiers);
        }

        setRoleTypes(data.roleTypes || []);

        if (!data.volumeBonusTiers || data.volumeBonusTiers.length === 0) {
          setVolumeBonusTiers(defaultVolumeBonusTiers);
        } else {
          setVolumeBonusTiers(data.volumeBonusTiers);
        }
      } catch (err) {
        console.error('Error fetching commission structure:', err);
        // Use default data on error
        setProductTiers(defaultProductTiers);
        setRoleTypes([]);
        setVolumeBonusTiers(defaultVolumeBonusTiers);
        setError('Using default commission structure data due to error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommissionStructure();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading commission structure...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <p>Using default commission structure data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Pricing & Commission Tiers</CardTitle>
          <CardDescription>
            Commission rates vary by product and distributor tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Product</TableHead>
                <TableHead>Retail Price</TableHead>
                <TableHead>Trader Price</TableHead>
                <TableHead>Distributor Price</TableHead>
                <TableHead>Trader Commission</TableHead>
                <TableHead>Distributor Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productTiers.length > 0 ? (
                productTiers.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.product_name}
                    </TableCell>
                    <TableCell>{formatPrice(product.retail_price)}</TableCell>
                    <TableCell>{formatPrice(product.trader_price)}</TableCell>
                    <TableCell>
                      {formatPrice(product.distributor_price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {product.trader_commission_min}% -{' '}
                        {product.trader_commission_max}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {product.distributor_commission_min}% -{' '}
                        {product.distributor_commission_max}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No product commission tiers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume-Based Bonus Tiers</CardTitle>
          <CardDescription>
            Higher sales volumes unlock higher commission percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Volume Range</TableHead>
                <TableHead>Bonus Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volumeBonusTiers.length > 0 ? (
                volumeBonusTiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      {formatVolumeRange(tier.min_volume, tier.max_volume)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          tier.bonus_percentage > 0 ? 'bg-blue-50' : ''
                        }
                      >
                        {tier.bonus_percentage}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    No volume bonus tiers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Incentive Structure</CardTitle>
          <CardDescription>
            Earn more through our multi-tiered incentive program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {incentiveStructure.map((incentive) => (
              <Card key={incentive.name} className="border border-muted">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{incentive.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {incentive.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CommissionStructure;
