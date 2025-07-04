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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchPartners();
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
      setPartners(response.data);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setIsLoading(false);
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
                  onClick={() => router.push(`/clinics/${partner.id}`)}
                >
                  View Details & Book
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
