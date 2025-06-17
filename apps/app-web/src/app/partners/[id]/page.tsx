'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Clock, Globe, Star, ArrowLeft } from 'lucide-react';
import { IPartner, IService } from '@app/shared-types';
import services from '@/lib/services';
import { ServiceCard } from '@/components/partners/service-card';
import { BookingCalendar } from '@/components/partners/booking-calendar';
import { useAuth } from '@/contexts/AuthContext';

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [partner, setPartner] = useState<IPartner | null>(null);
  const [partnerServices, setPartnerServices] = useState<IService[]>([]);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        setIsLoading(true);
        const [partnerData, servicesData] = await Promise.all([
          services.partners.getPartner(params.id as string),
          services.partners.getPartnerServices(params.id as string)
        ]);
        
        setPartner(partnerData);
        setPartnerServices(servicesData);
      } catch (error) {
        console.error('Failed to fetch partner details:', error);
        setError('Failed to load partner details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPartnerDetails();
    }
  }, [params.id]);

  const handleServiceSelect = (service: IService) => {
    setSelectedService(service);
  };

  const handleBookingComplete = () => {
    // Handle booking completion
    router.push('/bookings');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">{error || 'Partner not found'}</p>
            <Button 
              onClick={() => router.push('/partners')} 
              className="mt-4"
            >
              Back to Partners
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/partners')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Partners
      </Button>

      {/* Partner Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{partner.name}</CardTitle>
              <CardDescription className="mt-2">
                {partner.description}
              </CardDescription>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="ml-1 font-semibold">{partner.rating.toFixed(1)}</span>
              <span className="ml-1 text-gray-500">({partner.totalReviews} reviews)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {partner.address}, {partner.city}, {partner.state} {partner.postalCode}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {partner.phone}
              </div>
              {partner.website && (
                <div className="flex items-center text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <a 
                    href={partner.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    {partner.website}
                  </a>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Operating Hours
              </h4>
              {partner.operatingHours && Object.entries(partner.operatingHours).map(([day, hours]: [string, any]) => (
                <div key={day} className="text-sm text-gray-600">
                  <span className="font-medium capitalize">{day}:</span> {hours.open} - {hours.close}
                </div>
              ))}
            </div>
          </div>
          
          {partner.specializations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {partner.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services and Booking Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="booking" disabled={!selectedService}>
            Book Appointment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Available Services</h3>
          {partnerServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No services available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {partnerServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={handleServiceSelect}
                  isSelected={selectedService?.id === service.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="booking">
          {selectedService && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Selected Service</CardTitle>
                  <CardDescription>{selectedService.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>Duration: {selectedService.duration} minutes</p>
                    <p>Price: ${selectedService.price.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <BookingCalendar
                partnerId={partner.id}
                service={selectedService}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}