'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Phone, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import services from '@/services';
import { IBooking } from '@app/shared-types';

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [freeCheckupStatus, setFreeCheckupStatus] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
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
  }, [user]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await services.bookings.getMyBookings({
        page: 1,
        limit: 20
      });
      setBookings(response.bookings);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      
      // If it's a rate limit error, show a user-friendly message
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
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

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await services.bookings.cancelBooking(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
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

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterBookings = (status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (status) {
      case 'upcoming':
        return bookings.filter(b => 
          new Date(b.bookingDate) >= today && 
          !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)
        );
      case 'past':
        return bookings.filter(b => 
          new Date(b.bookingDate) < today || 
          ['COMPLETED', 'NO_SHOW'].includes(b.status)
        );
      case 'cancelled':
        return bookings.filter(b => b.status === 'CANCELLED');
      default:
        return bookings;
    }
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
                  <h3 className="text-lg font-semibold">Your Annual Free Body Checkup is Available!</h3>
                  <p className="text-gray-600">Claim your free health screening today</p>
                </div>
              </div>
              <Button onClick={handleClaimFreeCheckup} className="bg-green-600 hover:bg-green-700">
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
                <Button onClick={() => router.push('/partners')} className="mt-4">
                  Book an Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            filterBookings('upcoming').map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onCancel={() => handleCancelBooking(booking.id)}
                showActions
              />
            ))
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
            filterBookings('past').map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
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
            filterBookings('cancelled').map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({ 
  booking, 
  onCancel, 
  showActions = false 
}: { 
  booking: IBooking; 
  onCancel?: () => void;
  showActions?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.service?.name || 'Unknown Service'}</CardTitle>
            <CardDescription>{booking.partner?.name || 'Unknown Partner'}</CardDescription>
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

  const config = statusConfig[status as keyof typeof statusConfig];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}