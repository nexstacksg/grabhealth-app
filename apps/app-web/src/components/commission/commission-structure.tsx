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
import services from '@/services';
// Authentication is now handled at the page level

// Types for the new 4-product commission structure
type Product = {
  id: number;
  name: string;
  description: string;
  sku: string;
  customerPrice: number;
  travelPackagePrice?: number;
  pvValue: number;
  commissionRates: {
    sales: number;
    leader: number;
    manager: number;
  };
  commissionAmounts: {
    sales: number;
    leader: number;
    manager: number;
  };
};

type RoleType = {
  id: number;
  name: string;
  commissionRate: number;
  level: number;
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

function CommissionStructure() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);

  // Default data for the 4-product commission model
  const defaultProducts: Product[] = [
    {
      id: 1,
      name: 'Real Man',
      description: 'Premium health supplement for men',
      sku: 'REAL_MAN_001',
      customerPrice: 3600,
      travelPackagePrice: 799,
      pvValue: 600,
      commissionRates: { sales: 0.3, leader: 0.1, manager: 0.05 },
      commissionAmounts: { sales: 1080, leader: 360, manager: 180 },
    },
    {
      id: 2,
      name: 'Wild Ginseng Honey',
      description: 'Premium wild ginseng honey blend',
      sku: 'GINSENG_HONEY_001',
      customerPrice: 1000,
      pvValue: 700,
      commissionRates: { sales: 0.3, leader: 0.1, manager: 0.05 },
      commissionAmounts: { sales: 300, leader: 100, manager: 50 },
    },
    {
      id: 3,
      name: 'Golden Ginseng Water',
      description: 'Premium golden ginseng infused water',
      sku: 'GOLDEN_WATER_001',
      customerPrice: 18.9,
      pvValue: 2000,
      commissionRates: { sales: 0.3, leader: 0.1, manager: 0.05 },
      commissionAmounts: { sales: 5.67, leader: 1.89, manager: 0.95 },
    },
    {
      id: 4,
      name: 'Travel Package',
      description: 'Complete health and wellness travel package',
      sku: 'TRAVEL_PKG_001',
      customerPrice: 799,
      pvValue: 500,
      commissionRates: { sales: 0.3, leader: 0.1, manager: 0.05 },
      commissionAmounts: { sales: 239.7, leader: 79.9, manager: 39.95 },
    },
  ];

  const defaultRoleTypes: RoleType[] = [
    { id: 1, name: 'Sales', commissionRate: 0.3, level: 1 },
    { id: 2, name: 'Leader', commissionRate: 0.1, level: 2 },
    { id: 3, name: 'Manager', commissionRate: 0.05, level: 3 },
  ];

  // Fetch commission structure data
  useEffect(() => {
    const fetchCommissionStructure = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await services.commission.getCommissionStructure();

        // The API returns the structure directly, not wrapped in success/data
        if (data && typeof data === 'object') {
          // Check if data has the expected structure
          if ('products' in data && Array.isArray(data.products)) {
            setProducts(data.products || defaultProducts);
          } else {
            setProducts(defaultProducts);
          }

          if ('roleTypes' in data && Array.isArray(data.roleTypes)) {
            setRoleTypes(data.roleTypes || defaultRoleTypes);
          } else {
            setRoleTypes(defaultRoleTypes);
          }
        } else {
          // Use default data if API response is not in expected format
          setProducts(defaultProducts);
          setRoleTypes(defaultRoleTypes);
        }
      } catch (err) {
        console.error('Error fetching commission structure:', err);
        // Use default data on error
        setProducts(defaultProducts);
        setRoleTypes(defaultRoleTypes);
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
          <CardTitle>GrabHealth 4-Product Commission Structure</CardTitle>
          <CardDescription>
            Fixed commission amounts for each role level across our 4 core
            products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead>Customer Price</TableHead>
                <TableHead>Sales (30%)</TableHead>
                <TableHead>Leader (10%)</TableHead>
                <TableHead>Manager (5%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.sku}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(product.customerPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {formatPrice(product.commissionAmounts.sales)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {formatPrice(product.commissionAmounts.leader)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-50">
                        {formatPrice(product.commissionAmounts.manager)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Role Structure</CardTitle>
          <CardDescription>
            Stepwise commission distribution across the upline hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Level</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleTypes.length > 0 ? (
                roleTypes.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      Level {role.level} - {role.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {(role.commissionRate * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {role.name === 'Sales' &&
                        'Direct commission from personal sales'}
                      {role.name === 'Leader' &&
                        'Override commission from Sales level'}
                      {role.name === 'Manager' &&
                        'Override commission from Leader level'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No role types found
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
