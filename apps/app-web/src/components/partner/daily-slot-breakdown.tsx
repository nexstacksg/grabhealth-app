'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BookedSlot {
  id: string;
  time: string;
  customerName: string;
  customerEmail?: string;
  serviceName: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  duration: number;
  notes?: string;
  isFreeCheckup?: boolean;
}

interface AvailableSlot {
  time: string;
  duration: number;
  maxBookings: number;
  currentBookings: number;
}

interface DailySlotData {
  date: string;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: BookedSlot[];
  availableTimeSlots: AvailableSlot[];
}

interface DailySlotBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  partnerId: string;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'No Show',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
  },
};

export function DailySlotBreakdown({
  isOpen,
  onClose,
  selectedDate,
  partnerId,
}: DailySlotBreakdownProps) {
  const [loading, setLoading] = useState(true);
  const [slotData, setSlotData] = useState<DailySlotData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedDate && partnerId) {
      fetchDailySlotData();
    }
  }, [isOpen, selectedDate, partnerId]);

  const fetchDailySlotData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Fetch detailed slot information
      const response = await fetch(
        `http://localhost:4000/api/v1/partners/${partnerId}/available-slots/${dateStr}?detailed=true`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch slot details');
      }

      const data = await response.json();

      if (data.success) {
        setSlotData(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load slot details');
      }
    } catch (error) {
      console.error('Error fetching daily slot data:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load slot details'
      );
      toast.error('Failed to load slot details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/partner/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
        // Refresh the data
        await fetchDailySlotData();
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return time;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Schedule - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading slot details...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDailySlotData} variant="outline">
              Try Again
            </Button>
          </div>
        ) : slotData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {slotData.totalSlots}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Booked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {slotData.bookedSlots.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {slotData.availableSlots}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booked Slots */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Booked Appointments ({slotData.bookedSlots.length})
                </h3>

                {slotData.bookedSlots.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No bookings for this day
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {slotData.bookedSlots.map((booking) => {
                      const statusInfo = statusConfig[booking.status];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <Card
                          key={booking.id}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {formatTime(booking.time)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({booking.duration} min)
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'flex items-center gap-1',
                                  statusInfo.color
                                )}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <p className="font-medium">
                                {booking.customerName}
                              </p>
                              {booking.customerEmail && (
                                <p className="text-sm text-gray-600">
                                  {booking.customerEmail}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {booking.serviceName}
                              </p>
                              {booking.isFreeCheckup && (
                                <Badge variant="secondary" className="text-xs">
                                  Free Checkup
                                </Badge>
                              )}
                              {booking.notes && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Note: {booking.notes}
                                </p>
                              )}
                            </div>

                            {booking.status === 'PENDING' && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(booking.id, 'CONFIRMED')
                                  }
                                  className="text-xs"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(booking.id, 'CANCELLED')
                                  }
                                  className="text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Available Slots */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Slots ({slotData.availableTimeSlots.length})
                </h3>

                {slotData.availableTimeSlots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    No available slots
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {slotData.availableTimeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="bg-white rounded px-2 py-1.5 text-center border border-green-200 hover:border-green-300 transition-colors"
                        >
                          <div className="text-sm font-medium text-green-800">
                            {formatTime(slot.time)}
                          </div>
                          {slot.maxBookings > 1 && (
                            <div className="text-xs text-green-600">
                              {slot.currentBookings}/{slot.maxBookings}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {slotData.availableTimeSlots.length > 12 && (
                      <div className="mt-2 text-xs text-green-700 text-center">
                        Showing all {slotData.availableTimeSlots.length}{' '}
                        available time slots
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
