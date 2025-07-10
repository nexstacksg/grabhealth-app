'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Phone, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import services from '@/services';
import { IBooking } from '@app/shared-types';
import { useToast } from '@/components/ui/use-toast';

export default function BookingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [freeCheckupStatus, setFreeCheckupStatus] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    upcoming: 1,
    past: 1,
    cancelled: 1,
  });
  const itemsPerPage = 3;

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (isAuthLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Add a small delay to avoid rate limiting issues when navigating quickly
    const timer = setTimeout(() => {
      fetchBookings();
      fetchFreeCheckupStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isAuthLoading]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await services.bookings.getMyBookings({
        page: 1,
        limit: 20,
      });
      console.log('Fetched bookings:', response.bookings);
      // Log cancelled bookings specifically
      const cancelledBookings = response.bookings.filter(b => b.status === 'CANCELLED');
      console.log('Cancelled bookings:', cancelledBookings);
      setBookings(response.bookings);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);

      // If it's a rate limit error, show a user-friendly message
      if (
        error.message?.includes('429') ||
        error.message?.includes('Too Many Requests')
      ) {
        setIsRetrying(true);
        // Retry after a delay
        setTimeout(() => {
          setIsRetrying(false);
          fetchBookings();
        }, 5000); // Retry after 5 seconds
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFreeCheckupStatus = async () => {
    try {
      const status = await services.bookings.checkFreeCheckupEligibility();
      setFreeCheckupStatus(status);
    } catch (error) {
      console.error('Failed to fetch free checkup status:', error);
    }
  };

  const { toast } = useToast();

  const handleCancelBooking = async (bookingId: string) => {
    try {
      console.debug('Attempting to cancel booking:', bookingId);
      const result = await services.bookings.cancelBooking(bookingId);
      console.debug('Booking cancellation successful:', result);
      fetchBookings();
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been successfully cancelled.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      console.error('Error details:', {
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
        name: error.name,
      });

      // Check if it's an authentication error
      if (error.status === 401 || error.code === 'NETWORK_ERROR') {
        alert('Your session has expired. Please log in again.');
        router.push('/auth/login');
        return;
      }

      // You could add an error toast here if you have a toast system
      alert(error.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const handleClaimFreeCheckup = async () => {
    try {
      // For now, just redirect to partners page to book a free checkup
      router.push('/partners');
    } catch (error) {
      console.error('Failed to redirect:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
      COMPLETED: { variant: 'outline' as const, label: 'Completed' },
      NO_SHOW: { variant: 'destructive' as const, label: 'No Show' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline' as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterBookings = (status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredBookings: IBooking[] = [];

    switch (status) {
      case 'upcoming':
        filteredBookings = bookings?.filter(
          (b) =>
            new Date(b.bookingDate) >= today &&
            !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)
        );
        break;
      case 'past':
        filteredBookings = bookings.filter(
          (b) =>
            new Date(b.bookingDate) < today ||
            ['COMPLETED', 'NO_SHOW'].includes(b.status)
        );
        break;
      case 'cancelled':
        filteredBookings = bookings.filter((b) => b.status === 'CANCELLED');
        break;
      default:
        filteredBookings = bookings;
    }

    return filteredBookings;
  };

  const getPaginatedBookings = (status: string) => {
    const filteredBookings = filterBookings(status);
    const page = currentPage[status];
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      bookings: filteredBookings.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredBookings.length / itemsPerPage),
      totalItems: filteredBookings.length,
    };
  };

  if (isLoading || isRetrying) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          {isRetrying && (
            <div className="mt-4 text-center text-gray-600">
              <p>Rate limit reached. Retrying in a moment...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your appointments and bookings</p>
      </div>

      {/* Free Checkup Banner */}
      {freeCheckupStatus?.eligible && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Gift className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Your Annual Free Body Checkup is Available!
                  </h3>
                  <p className="text-gray-600">
                    Claim your free health screening today
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClaimFreeCheckup}
                className="bg-green-600 hover:bg-green-700"
              >
                Claim Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filterBookings('upcoming').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No upcoming bookings</p>
                <Button
                  onClick={() => router.push('/clinics')}
                  className="mt-4"
                >
                  Book an Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {getPaginatedBookings('upcoming').bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={() => handleCancelBooking(booking.id)}
                  showActions
                />
              ))}

              {/* Pagination */}
              {getPaginatedBookings('upcoming').totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => ({
                          ...prev,
                          upcoming: Math.max(prev.upcoming - 1, 1),
                        }))
                      }
                      disabled={currentPage.upcoming === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center justify-center px-4 py-1 bg-gray-100 rounded-md">
                      <span className="text-sm">
                        {currentPage.upcoming} of{' '}
                        {getPaginatedBookings('upcoming').totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => ({
                          ...prev,
                          upcoming: Math.min(
                            prev.upcoming + 1,
                            getPaginatedBookings('upcoming').totalPages
                          ),
                        }))
                      }
                      disabled={
                        currentPage.upcoming ===
                        getPaginatedBookings('upcoming').totalPages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filterBookings('past').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No past bookings</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {getPaginatedBookings('past').bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}

              {/* Pagination */}
              {getPaginatedBookings('past').totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => ({
                          ...prev,
                          past: Math.max(prev.past - 1, 1),
                        }))
                      }
                      disabled={currentPage.past === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center justify-center px-4 py-1 bg-gray-100 rounded-md">
                      <span className="text-sm">
                        {currentPage.past} of{' '}
                        {getPaginatedBookings('past').totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => ({
                          ...prev,
                          past: Math.min(
                            prev.past + 1,
                            getPaginatedBookings('past').totalPages
                          ),
                        }))
                      }
                      disabled={
                        currentPage.past ===
                        getPaginatedBookings('past').totalPages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterBookings('cancelled').length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No cancelled bookings</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {getPaginatedBookings('cancelled').bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}

              {/* Pagination */}
              {getPaginatedBookings('cancelled').totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => ({
                          ...prev,
                          cancelled: Math.max(prev.cancelled - 1, 1),
                        }))
                      }
                      disabled={currentPage.cancelled === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center justify-center px-4 py-1 bg-gray-100 rounded-md">
                      <span className="text-sm">
                        {currentPage.cancelled} of{' '}
                        {getPaginatedBookings('cancelled').totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => ({
                          ...prev,
                          cancelled: Math.min(
                            prev.cancelled + 1,
                            getPaginatedBookings('cancelled').totalPages
                          ),
                        }))
                      }
                      disabled={
                        currentPage.cancelled ===
                        getPaginatedBookings('cancelled').totalPages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  showActions = false,
}: {
  booking: IBooking;
  onCancel?: () => void;
  showActions?: boolean;
}) {
  // Extract service name from notes if service object is missing
  const extractServiceFromNotes = (notes: string | null | undefined): string => {
    if (!notes) return 'Service';
    // Pattern: "Booking for [Service Name]"
    const match = notes.match(/Booking for (.+)/i);
    return match ? match[1] : 'Service';
  };

  const serviceName = booking.service?.name || extractServiceFromNotes(booking.notes);
  const partnerName = booking.partner?.name || 'Partner';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {serviceName}
            </CardTitle>
            <CardDescription>
              {partnerName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {booking.isFreeCheckup && (
              <Badge variant="outline" className="bg-green-50">
                <Gift className="h-3 w-3 mr-1" />
                Free Checkup
              </Badge>
            )}
            {getStatusBadge(booking.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(booking.bookingDate), 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {booking.startTime} - {booking.endTime}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {booking.partner?.address || 'Address not available'}
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {booking.partner?.phone || 'Phone not available'}
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}

        {showActions && booking.status === 'PENDING' && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: { variant: 'secondary' as const, label: 'Pending' },
    CONFIRMED: { variant: 'default' as const, label: 'Confirmed' },
    CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    COMPLETED: { variant: 'outline' as const, label: 'Completed' },
    NO_SHOW: { variant: 'destructive' as const, label: 'No Show' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: 'outline' as const,
    label: status,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
