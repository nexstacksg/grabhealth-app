'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Phone,
  Clock,
  Gift,
  Star,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IPartner } from '@app/shared-types';
import services from '@/services';
import { apiClient } from '@/services/api-client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Gift items interface
interface GiftItem {
  id: number;
  name: string;
  description: string;
  required_purchases: number;
  tier_name: string;
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [giftItemsLoading, setGiftItemsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
    fetchGiftItems();
  }, [searchTerm, selectedCity]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const response = await services.partners.getPartners({
        search: searchTerm,
        location: selectedCity,
        page: 1,
        limit: 20,
      });
      setPartners(response.partners);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGiftItems = async () => {
    try {
      setGiftItemsLoading(true);
      // Fetch gift items from Strapi
      const response = await apiClient.get<{ data: any[] }>('/gift-items?sort=requiredPurchases:asc');
      
      if (response.data && response.data.length > 0) {
        // Transform Strapi data to match our interface
        const transformedGiftItems = response.data.map((item: any) => {
          const itemData = item.attributes || item;
          return {
            id: item.id,
            name: itemData.name,
            description: itemData.description || '',
            required_purchases: itemData.requiredPurchases,
            tier_name: `${itemData.requiredPurchases} purchases`,
          };
        });
        setGiftItems(transformedGiftItems);
      } else {
        setGiftItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch gift items:', error);
      setGiftItems([]);
    } finally {
      setGiftItemsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-16 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
          Healthcare Partners
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Book appointments with our trusted healthcare partners for checkups,
          consultations, and wellness services.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search partners by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              No partners found matching your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner) => (
            <Card
              key={partner.id}
              className="h-full hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{partner.name}</CardTitle>
                  {partner.rating > 0 && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm">
                        {partner.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <CardDescription className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {partner.address}, {partner.city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {partner.phone}
                  </div>
                  {partner?.operatingHours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Open Now</span>
                    </div>
                  )}
                  {partner?.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {partner.specializations.slice(0, 3).map((spec) => (
                        <Badge
                          key={spec}
                          variant="secondary"
                          className="text-xs"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/partners/${partner.id}`)}
                >
                  View Details & Book
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Gift Items Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            Available Gifts
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Claim these exclusive gifts when you visit our partner locations.
            Requirements vary by membership tier.
          </p>
        </div>

        {giftItemsLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading gift items...</p>
          </div>
        ) : giftItems.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No gift items available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giftItems.map((gift) => (
              <Card key={gift.id} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{gift.name}</CardTitle>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {gift.tier_name}
                    </span>
                  </div>
                  <CardDescription>{gift.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <strong>Required:</strong>{' '}
                    {gift.required_purchases === 0
                      ? 'Free for new members'
                      : `${gift.required_purchases} purchase(s)`}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
