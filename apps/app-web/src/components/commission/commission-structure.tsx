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
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface CommissionStructureProps {
  products?: any[];
  achievements?: any[];
}

function CommissionStructure({
  products: serverProducts = [],
  achievements: serverAchievements = [],
}: CommissionStructureProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [volumeBonuses, setVolumeBonuses] = useState<VolumeBonus[]>([]);
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Process server-provided products data
  useEffect(() => {
    const processCommissionData = () => {
      try {
        console.log('Server products received:', serverProducts);
        console.log('Server achievements received:', serverAchievements);

        // Early return if no data
        if (!serverProducts || !Array.isArray(serverProducts)) {
          console.log('No products data available');
          setProducts([]);
          setRoleTypes([]);
          setVolumeBonuses([]);
          setGiftItems([]);
          return;
        }

        const productsList: Product[] = [];
        const allCommissionRates = new Map<string, number>();

        serverProducts.forEach((product: any) => {
          const productData = product.attributes || product;
          const productId = product.id || product.documentId;

          // Initialize commission rates for this product
          let productCommissionRates = {
            direct: 0,
            upline_1: 0,
            upline_2: 0,
          };

          // Check for commission template in the product data
          const commissionTemplate = productData.commissionTemplate;

          console.log(
            `Product ${productData.name} - Raw commission template:`,
            commissionTemplate
          );

          if (
            commissionTemplate &&
            (commissionTemplate.data || commissionTemplate.id)
          ) {
            // Handle both direct object and data wrapper formats
            const templateData = commissionTemplate.data || commissionTemplate;
            const templateAttrs = templateData.attributes || templateData;

            console.log(
              `Product ${productData.name} - Processed template:`,
              templateAttrs
            );

            // Get details from template
            const details =
              templateAttrs.details?.data || templateAttrs.details || [];

            details.forEach((detail: any) => {
              const detailData = detail.attributes || detail;
              const levelType = detailData.levelType;
              const customerType = detailData.customerType || 'all';
              const commissionValue = parseFloat(
                detailData.commissionValue || '0'
              );

              console.log(
                `  - Level: ${levelType}, Customer Type: ${customerType}, Value: ${commissionValue}%`
              );

              if (customerType === 'all' || customerType === 'regular') {
                // Map level types to our structure
                if (levelType === 'direct') {
                  productCommissionRates.direct = commissionValue;
                } else if (levelType === 'upline_1') {
                  productCommissionRates.upline_1 = commissionValue;
                } else if (levelType === 'upline_2') {
                  productCommissionRates.upline_2 = commissionValue;
                }
              }

              // Track overall rates
              if (
                !allCommissionRates.has(levelType) ||
                allCommissionRates.get(levelType)! < commissionValue
              ) {
                allCommissionRates.set(levelType, commissionValue);
              }
            });
          } else {
            console.log(
              `Product ${productData.name} - No commission template found`
            );
          }

          // Create product object with actual data
          const price = parseFloat(productData.price || '0');

          productsList.push({
            id: parseInt(productId) || 0,
            name: productData.name || 'Product',
            description: productData.description || '',
            sku: productData.sku || `SKU-${productId}`,
            customerPrice: price,
            travelPackagePrice: productData.travelPackagePrice
              ? parseFloat(productData.travelPackagePrice)
              : undefined,
            pvValue: parseFloat(
              productData.pvValue || productData.price || '0'
            ),
            commissionRates: {
              sales: productCommissionRates.direct,
              leader: productCommissionRates.upline_1,
              manager: productCommissionRates.upline_2,
            },
            commissionAmounts: {
              sales: price * (productCommissionRates.direct / 100),
              leader: price * (productCommissionRates.upline_1 / 100),
              manager: price * (productCommissionRates.upline_2 / 100),
            },
          });
        });

        console.log('Processed products:', productsList);
        setProducts(productsList);

        // Set role types based on actual commission rates found
        const roleTypesList: RoleType[] = [];

        if (allCommissionRates.has('direct')) {
          roleTypesList.push({
            id: 1,
            name: 'Direct Sales',
            commissionRate: allCommissionRates.get('direct')! / 100,
            level: 1,
          });
        }

        if (allCommissionRates.has('upline_1')) {
          roleTypesList.push({
            id: 2,
            name: 'Upline Level 1',
            commissionRate: allCommissionRates.get('upline_1')! / 100,
            level: 2,
          });
        }

        if (allCommissionRates.has('upline_2')) {
          roleTypesList.push({
            id: 3,
            name: 'Upline Level 2',
            commissionRate: allCommissionRates.get('upline_2')! / 100,
            level: 3,
          });
        }

        console.log('Role types:', roleTypesList);
        setRoleTypes(roleTypesList);

        // Process achievement rewards from Strapi
        const volumeBonusList: VolumeBonus[] = [];
        const giftItemsList: GiftItem[] = [];

        serverAchievements.forEach((achievement: any, index: number) => {
          const achievementData = achievement.attributes || achievement;

          if (
            achievementData.rewardType === 'cash' &&
            achievementData.criteriaType === 'sales_volume'
          ) {
            // This is a volume bonus
            volumeBonusList.push({
              id: achievement.id || index + 1,
              minVolume: parseFloat(achievementData.criteriaValue || '0'),
              bonusPercentage: parseFloat(achievementData.rewardValue || '0'),
            });
          } else if (achievementData.rewardType === 'gift') {
            // This is a gift reward
            giftItemsList.push({
              id: achievement.id || index + 1,
              name: achievementData.rewardName || 'Gift Reward',
              description: achievementData.description || '',
              requiredPurchases: parseInt(achievementData.criteriaValue || '1'),
            });
          }
        });

        // Sort volume bonuses by min volume
        volumeBonusList.sort((a, b) => a.minVolume - b.minVolume);

        // Add max volume for display purposes (except last item)
        for (let i = 0; i < volumeBonusList.length - 1; i++) {
          volumeBonusList[i].maxVolume = volumeBonusList[i + 1].minVolume;
        }

        setVolumeBonuses(volumeBonusList);
        setGiftItems(giftItemsList);

        console.log('Volume bonuses:', volumeBonusList);
        console.log('Gift items:', giftItemsList);
      } catch (err: any) {
        console.error('Error processing commission data:', err);
      }
    };

    processCommissionData();
  }, [serverProducts, serverAchievements]);

  // Calculate pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Commission Structure</CardTitle>
          <CardDescription>
            Commission rates for each role level across our products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead>
                  {roleTypes[0]
                    ? `${roleTypes[0].name} (${(roleTypes[0].commissionRate * 100).toFixed(0)}%)`
                    : 'Sales'}
                </TableHead>
                <TableHead>
                  {roleTypes[1]
                    ? `${roleTypes[1].name} (${(roleTypes[1].commissionRate * 100).toFixed(0)}%)`
                    : 'Leader'}
                </TableHead>
                <TableHead>
                  {roleTypes[2]
                    ? `${roleTypes[2].name} (${(roleTypes[2].commissionRate * 100).toFixed(0)}%)`
                    : 'Manager'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => {
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.sku} • {formatPrice(product.customerPrice)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.commissionRates.sales > 0 ? (
                          <div>
                            <Badge variant="outline" className="bg-green-50">
                              {formatPrice(product.commissionAmounts.sales)}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {product.commissionRates.sales}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No commission
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.commissionRates.leader > 0 ? (
                          <div>
                            <Badge variant="outline" className="bg-blue-50">
                              {formatPrice(product.commissionAmounts.leader)}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {product.commissionRates.leader}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No commission
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.commissionRates.manager > 0 ? (
                          <div>
                            <Badge variant="outline" className="bg-orange-50">
                              {formatPrice(product.commissionAmounts.manager)}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {product.commissionRates.manager}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No commission
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No products found. Please add products in Strapi admin
                    panel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, products.length)} of {products.length}{' '}
                products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? '' : ''}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {roleTypes.length > 0 && (
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
                {roleTypes.map((role) => (
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
                      {role.level === 1 &&
                        'Direct commission from personal sales'}
                      {role.level === 2 &&
                        'Override commission from direct downline'}
                      {role.level === 3 &&
                        'Override commission from second-level downline'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}

export default CommissionStructure;
