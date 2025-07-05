'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { MapPin, Phone, Clock, Globe, Star, ArrowLeft } from 'lucide-react';
import { IPartner, IService } from '@app/shared-types';
import services from '@/services';
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
  const [freeCheckupStatus, setFreeCheckupStatus] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4; // Show 4 services per page (2x2 grid)

  // Filter state
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        setIsLoading(true);
        // Get partner data which already includes services
        const partnerData = await services.partners.getPartner(
          params?.id as string
        );

        setPartner(partnerData);
        // Extract services from partner data instead of making separate API call
        setPartnerServices(partnerData.services || []);

        // Fetch free checkup status if user is logged in
        if (user && user.documentId) {
          try {
            const status =
              await services.bookings.checkFreeCheckupEligibility();
            setFreeCheckupStatus(status);
          } catch (error: any) {
            if (
              !error.message?.includes('429') &&
              !error.message?.includes('401')
            ) {
              console.error('Failed to fetch free checkup status:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch partner details:', error);
        setError('Failed to load partner details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchPartnerDetails();
    }
  }, [params?.id, user]);

  // Filter and pagination calculations
  const filteredServices = partnerServices.filter((service) => {
    if (serviceFilter === 'all') return true;
    return service.category === serviceFilter;
  });

  const totalServices = filteredServices.length;
  const totalPages = Math.ceil(totalServices / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  // Get unique categories for filter
  const serviceCategories = Array.from(
    new Set(partnerServices.map((service) => service.category))
  );

  const handleServiceSelect = (service: IService) => {
    setSelectedService(service);
  };

  const handleBookingComplete = () => {
    // Handle booking completion
    router.push('/bookings');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset selected service when changing pages
    setSelectedService(null);
  };

  const handleFilterChange = (category: string) => {
    setServiceFilter(category);
    setCurrentPage(1); // Reset to first page when filter changes
    setSelectedService(null); // Reset selected service
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
            <Button onClick={() => router.push('/clinics')} className="mt-4">
              Back to Clinics
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
        onClick={() => router.push('/clinics')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Clinics
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
            <div className="flex flex-wrap items-center gap-1 mt-2 sm:mt-0">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="ml-1 font-semibold">
                  {partner.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500">
                ({partner.totalReviews} reviews)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {partner.address}, {partner.city}, {partner.state}{' '}
                {partner.postalCode}
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
              {partner.operatingHours &&
                Object.entries(partner.operatingHours).map(
                  ([day, hours]: [string, any]) => (
                    <div key={day} className="text-sm text-gray-600">
                      <span className="font-medium capitalize">{day}:</span>{' '}
                      {hours.open} - {hours.close}
                    </div>
                  )
                )}
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

      {/* Services and Booking Section */}
      <div className="grid lg:grid-cols-5 gap-6 lg:gap-0 relative">
        {/* Services Column */}
        <div className="lg:col-span-3 lg:pr-8">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Available Services</h3>
                {totalServices > 0 && (
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalServices)}{' '}
                    of {totalServices} services
                  </p>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            {serviceCategories.length > 1 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-0">
                <span className="text-sm font-medium">Filter by category:</span>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={serviceFilter}
                    onValueChange={handleFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {serviceFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('all')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {partnerServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">
                  No services available at this time.
                </p>
              </CardContent>
            </Card>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">
                  No services found for the selected category.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                  className="mt-2"
                >
                  Show all services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {currentServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelect={handleServiceSelect}
                    isSelected={selectedService?.id === service.id}
                    isEligibleForFreeCheckup={freeCheckupStatus?.eligible}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-1">
                    {totalPages <= 5 ? (
                      // Show all pages if 5 or fewer
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      )
                    ) : (
                      // Show compact pagination for many pages
                      <>
                        <Button
                          variant={currentPage === 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          className="w-8 h-8 p-0"
                        >
                          1
                        </Button>
                        {currentPage > 3 && <span className="px-2">...</span>}
                        {currentPage > 2 && currentPage < totalPages - 1 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePageChange(currentPage)}
                            className="w-8 h-8 p-0"
                          >
                            {currentPage}
                          </Button>
                        )}
                        {currentPage < totalPages - 2 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={
                            currentPage === totalPages ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Booking Column - Always visible */}
        <div
          id="booking-section"
          className="lg:col-span-2 space-y-4 lg:pl-8 lg:border-l lg:border-gray-200"
        >
          <div className="lg:sticky lg:top-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Book Appointment</h3>
              {selectedService && (
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>

            {selectedService ? (
              <>
                {/* Selected Service Summary */}
                <Card className="mb-4 bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-blue-900 text-sm">
                          {selectedService.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedService(null)}
                          className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                        <span>⏱️ {selectedService.duration}min</span>
                        <span>💰 ${selectedService.price.toFixed(2)}</span>
                      </div>
                      {selectedService.requiresApproval && (
                        <div className="text-xs text-orange-600">
                          ⚠️ Requires approval
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Calendar */}
                <div className="lg:max-h-[600px] lg:overflow-y-auto">
                  <BookingCalendar
                    partnerId={partner.id}
                    service={selectedService}
                    onBookingComplete={handleBookingComplete}
                  />
                </div>
              </>
            ) : (
              /* Placeholder when no service is selected */
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Select a service to book an appointment
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
