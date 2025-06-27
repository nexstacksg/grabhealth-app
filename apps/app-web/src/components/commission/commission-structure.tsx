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
import { apiClient } from '@/services/api-client';
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

type VolumeBonus = {
  id: number;
  minVolume: number;
  maxVolume?: number;
  bonusPercentage: number;
};

type GiftItem = {
  id: number;
  name: string;
  description?: string;
  requiredPurchases: number;
};

function CommissionStructure() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [volumeBonuses, setVolumeBonuses] = useState<VolumeBonus[]>([]);
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);

  // Fetch commission structure data from Strapi
  useEffect(() => {
    const fetchCommissionStructure = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data from Strapi in parallel
        const [structureData, productCommissionTiers, volumeBonusData, giftItemsData] = await Promise.all([
          services.commission.getCommissionStructure(),
          apiClient.get<{ data: any[] }>('/product-commission-tiers?populate=product&sort=id:asc').catch(() => ({ data: [] })),
          apiClient.get<{ data: any[] }>('/volume-bonus-tiers?sort=minVolume:asc').catch(() => ({ data: [] })),
          apiClient.get<{ data: any[] }>('/gift-items?sort=requiredPurchases:asc').catch(() => ({ data: [] }))
        ]);

        // Process commission structure - transform levels to roleTypes
        if (structureData && structureData.levels) {
          const transformedRoleTypes = structureData.levels.map((level: any, index: number) => ({
            id: index + 1,
            name: level.name,
            commissionRate: level.rate,
            level: level.level
          }));
          setRoleTypes(transformedRoleTypes);
        }

        // Process product commission tiers from Strapi
        if (productCommissionTiers.data && productCommissionTiers.data.length > 0) {
          const transformedProducts = productCommissionTiers.data.map((tier: any) => {
            const tierData = tier.attributes || tier;
            const product = tierData.product?.data?.attributes || tierData.product || {};
            return {
              id: tier.id,
              name: tierData.productName || product.name || 'Unknown Product',
              description: product.description || '',
              sku: product.sku || '',
              customerPrice: parseFloat(product.price || 0),
              pvValue: product.pvValue || 0,
              commissionRates: {
                sales: parseFloat(tierData.salesCommissionRate || 0),
                leader: parseFloat(tierData.leaderCommissionRate || 0),
                manager: parseFloat(tierData.managerCommissionRate || 0)
              },
              commissionAmounts: {
                sales: parseFloat(tierData.salesCommissionAmount || 0),
                leader: parseFloat(tierData.leaderCommissionAmount || 0),
                manager: parseFloat(tierData.managerCommissionAmount || 0)
              }
            };
          });
          setProducts(transformedProducts);
        }

        // Process volume bonuses
        if (volumeBonusData.data && Array.isArray(volumeBonusData.data)) {
          const transformedVolumeBonuses = volumeBonusData.data.map((bonus: any) => {
            const bonusData = bonus.attributes || bonus;
            return {
              id: bonus.id || bonusData.id,
              minVolume: parseFloat(bonusData.minVolume || 0),
              maxVolume: bonusData.maxVolume ? parseFloat(bonusData.maxVolume) : undefined,
              bonusPercentage: parseFloat(bonusData.bonusPercentage || 0)
            };
          });
          setVolumeBonuses(transformedVolumeBonuses);
        }

        // Process gift items
        if (giftItemsData.data && Array.isArray(giftItemsData.data)) {
          const transformedGiftItems = giftItemsData.data.map((item: any) => {
            const itemData = item.attributes || item;
            return {
              id: item.id || itemData.id,
              name: itemData.name || 'Unknown Gift',
              description: itemData.description || undefined,
              requiredPurchases: parseInt(itemData.requiredPurchases || 0)
            };
          });
          setGiftItems(transformedGiftItems);
        }

      } catch (err) {
        console.error('Error fetching data from Strapi:', err);
        setError('Failed to load commission structure from server');
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
        <p>Please check server connection and try again</p>
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
                <TableHead>
                  {(() => {
                    const role = roleTypes.find(r => r.level === 1);
                    return role ? `${role.name} (${(role.commissionRate * 100).toFixed(0)}%)` : 'Sales (-)';
                  })()}
                </TableHead>
                <TableHead>
                  {(() => {
                    const role = roleTypes.find(r => r.level === 2);
                    return role ? `${role.name} (${(role.commissionRate * 100).toFixed(0)}%)` : 'Leader (-)';
                  })()}
                </TableHead>
                <TableHead>
                  {(() => {
                    const role = roleTypes.find(r => r.level === 3);
                    return role ? `${role.name} (${(role.commissionRate * 100).toFixed(0)}%)` : 'Manager (-)';
                  })()}
                </TableHead>
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
                      {role.level === 1 && 'Direct commission from personal sales'}
                      {role.level === 2 && 'Override commission from Sales level'}
                      {role.level === 3 && 'Override commission from Leader level'}
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

      {/* Volume Bonus Tiers - only show if data exists */}
      {volumeBonuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Volume Bonus Tiers</CardTitle>
            <CardDescription>
              Earn additional bonuses based on your sales volume
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
                {volumeBonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell className="font-medium">
                      {formatPrice(bonus.minVolume)}
                      {bonus.maxVolume && ` - ${formatPrice(bonus.maxVolume)}`}
                      {!bonus.maxVolume && '+'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        +{bonus.bonusPercentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Gift Items - only show if data exists */}
      {giftItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Gift Rewards</CardTitle>
            <CardDescription>
              Unlock exclusive gifts based on your purchase milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {giftItems.map((item) => (
                <Card key={item.id} className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                    )}
                    <Badge variant="secondary">
                      {item.requiredPurchases} purchases required
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional Incentive Structure</CardTitle>
          <CardDescription>
            Earn more through our multi-tiered incentive program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Dynamic incentives based on loaded data */}
            {volumeBonuses.length > 0 && (
              <Card className="border border-muted">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Volume-based bonuses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Earn up to {volumeBonuses.length > 0 ? Math.max(...volumeBonuses.map(b => b.bonusPercentage)) : 0}% bonus based on sales volume
                  </p>
                </CardContent>
              </Card>
            )}
            
            {giftItems.length > 0 && (
              <Card className="border border-muted">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Loyalty rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Unlock {giftItems.length} exclusive gift items based on purchase milestones
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Card className="border border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Referral incentives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Additional rewards for bringing new customers/distributors
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CommissionStructure;
