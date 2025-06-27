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

// Type assertions to fix React component type issues
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const CardDescriptionComponent = CardDescription as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;
const ButtonComponent = Button as any;
const BadgeComponent = Badge as any;
const SelectComponent = Select as any;
const SelectContentComponent = SelectContent as any;
const SelectItemComponent = SelectItem as any;
const SelectTriggerComponent = SelectTrigger as any;
const SelectValueComponent = SelectValue as any;

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
      if (!params?.id) {
        setError('Partner ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get partner data which already includes services
        const partnerData = await services.partners.getPartner(
          params.id as string
        );

        setPartner(partnerData);
        // Extract services from partner data instead of making separate API call
        setPartnerServices(partnerData.services || []);

        // Fetch free checkup status if user is logged in
        if (user && user.id) {
          try {
            const status =
              await services.bookings.checkFreeCheckupEligibility();
            setFreeCheckupStatus(status);
          } catch (error: any) {
            // Ignore rate limit errors and authentication errors
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
        <CardComponent>
          <CardContentComponent className="text-center py-8">
            <p className="text-red-500">{error || 'Partner not found'}</p>
            <ButtonComponent
              onClick={() => router.push('/partners')}
              className="mt-4"
            >
              Back to Partners
            </ButtonComponent>
          </CardContentComponent>
        </CardComponent>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <ButtonComponent
        variant="ghost"
        onClick={() => router.push('/partners')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Partners
      </ButtonComponent>

      {/* Partner Header */}
      <CardComponent className="mb-6">
        <CardHeaderComponent>
          <div className="flex justify-between items-start">
            <div>
              <CardTitleComponent className="text-2xl">
                {partner.name}
              </CardTitleComponent>
              <CardDescriptionComponent className="mt-2">
                {partner.description}
              </CardDescriptionComponent>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="ml-1 font-semibold">
                {partner.rating.toFixed(1)}
              </span>
              <span className="ml-1 text-gray-500">
                ({partner.totalReviews} reviews)
              </span>
            </div>
          </div>
        </CardHeaderComponent>
        <CardContentComponent>
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
                  <BadgeComponent key={spec} variant="secondary">
                    {spec}
                  </BadgeComponent>
                ))}
              </div>
            </div>
          )}
        </CardContentComponent>
      </CardComponent>

      {/* Services and Booking Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services Column */}
        <div
          className={`${selectedService ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}
        >
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
              {!selectedService && totalServices > 0 && (
                <p className="text-sm text-gray-500">
                  Select a service to book an appointment
                </p>
              )}
            </div>

            {/* Filter Controls */}
            {serviceCategories.length > 1 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Filter by category:</span>
                <SelectComponent
                  value={serviceFilter}
                  onValueChange={handleFilterChange}
                >
                  <SelectTriggerComponent className="w-48">
                    <SelectValueComponent placeholder="All categories" />
                  </SelectTriggerComponent>
                  <SelectContentComponent>
                    <SelectItemComponent value="all">
                      All Categories
                    </SelectItemComponent>
                    {serviceCategories.map((category) => (
                      <SelectItemComponent key={category} value={category}>
                        {category}
                      </SelectItemComponent>
                    ))}
                  </SelectContentComponent>
                </SelectComponent>
                {serviceFilter !== 'all' && (
                  <ButtonComponent
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('all')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear filter
                  </ButtonComponent>
                )}
              </div>
            )}
          </div>

          {partnerServices.length === 0 ? (
            <CardComponent>
              <CardContentComponent className="text-center py-8">
                <p className="text-gray-500">
                  No services available at this time.
                </p>
              </CardContentComponent>
            </CardComponent>
          ) : filteredServices.length === 0 ? (
            <CardComponent>
              <CardContentComponent className="text-center py-8">
                <p className="text-gray-500">
                  No services found for the selected category.
                </p>
                <ButtonComponent
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                  className="mt-2"
                >
                  Show all services
                </ButtonComponent>
              </CardContentComponent>
            </CardComponent>
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
                  <ButtonComponent
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </ButtonComponent>

                  <div className="flex space-x-1">
                    {totalPages <= 5 ? (
                      // Show all pages if 5 or fewer
                      Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <ButtonComponent
                            key={page}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </ButtonComponent>
                        )
                      )
                    ) : (
                      // Show compact pagination for many pages
                      <>
                        <ButtonComponent
                          variant={currentPage === 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          className="w-8 h-8 p-0"
                        >
                          1
                        </ButtonComponent>
                        {currentPage > 3 && <span className="px-2">...</span>}
                        {currentPage > 2 && currentPage < totalPages - 1 && (
                          <ButtonComponent
                            variant="default"
                            size="sm"
                            onClick={() => handlePageChange(currentPage)}
                            className="w-8 h-8 p-0"
                          >
                            {currentPage}
                          </ButtonComponent>
                        )}
                        {currentPage < totalPages - 2 && (
                          <span className="px-2">...</span>
                        )}
                        <ButtonComponent
                          variant={
                            currentPage === totalPages ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </ButtonComponent>
                      </>
                    )}
                  </div>

                  <ButtonComponent
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </ButtonComponent>
                </div>
              )}
            </>
          )}
        </div>

        {/* Booking Column - Shows when service is selected */}
        {selectedService && (
          <div
            id="booking-section"
            className="lg:col-span-1 space-y-4 animate-in slide-in-from-right-4 lg:slide-in-from-bottom-4 duration-300"
          >
            <div className="lg:sticky lg:top-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Book Appointment</h3>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              {/* Selected Service Summary */}
              <CardComponent className="mb-4 bg-blue-50 border-blue-200">
                <CardContentComponent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-blue-900 text-sm">
                        {selectedService.name}
                      </h4>
                      <ButtonComponent
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedService(null)}
                        className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                      >
                        ✕
                      </ButtonComponent>
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
                </CardContentComponent>
              </CardComponent>

              {/* Booking Calendar */}
              <div className="lg:max-h-[600px] lg:overflow-y-auto">
                <BookingCalendar
                  partnerId={partner.id}
                  service={selectedService}
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
