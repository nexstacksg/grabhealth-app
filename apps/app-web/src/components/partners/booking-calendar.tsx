'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { IService, IAvailableSlot, ICalendarDay } from '@app/shared-types';
import services from '@/lib/services';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface BookingCalendarProps {
  partnerId: string;
  service: IService;
  onBookingComplete: () => void;
}

export function BookingCalendar({ partnerId, service, onBookingComplete }: BookingCalendarProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<IAvailableSlot[]>([]);
  const [calendarDays, setCalendarDays] = useState<ICalendarDay[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch calendar data for the current month
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setIsLoadingCalendar(true);
        const monthStr = format(currentMonth, 'yyyy-MM');
        const calendar = await services.partners.getPartnerCalendar(partnerId, monthStr);
        setCalendarDays(calendar);
      } catch (error) {
        console.error('Failed to fetch calendar:', error);
        setError('Failed to load calendar data');
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    fetchCalendar();
  }, [partnerId, currentMonth]);

  // Fetch available slots when a date is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return;

      try {
        setIsLoadingSlots(true);
        setError(null);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const slots = await services.partners.getAvailableSlots(partnerId, dateStr);
        setAvailableSlots(slots);
        setSelectedSlot(null);
      } catch (error) {
        console.error('Failed to fetch available slots:', error);
        setError('Failed to load available time slots');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [partnerId, selectedDate]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !user) return;

    try {
      setIsBooking(true);
      setError(null);

      await services.bookings.createBooking({
        partnerId,
        serviceId: service.id,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot,
        notes: `Booking for ${service.name}`,
        paymentMethod: 'CREDIT_CARD'
      });

      onBookingComplete();
    } catch (error) {
      console.error('Failed to create booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Disable dates that are not available
  const disabledDays = calendarDays
    .filter(day => !day.isAvailable || day.availableSlots === 0)
    .map(day => new Date(day.date));

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please <a href="/auth/login" className="underline">login</a> to book an appointment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
          <CardDescription>Choose your preferred appointment date</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCalendar ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={setCurrentMonth}
              disabled={(date) => {
                // Disable past dates
                if (date < new Date()) return true;
                // Disable unavailable dates
                return disabledDays.some(d => d.toDateString() === date.toDateString());
              }}
              className="rounded-md border"
            />
          )}
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Time</CardTitle>
            <CardDescription>
              Available time slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No available time slots for this date.
              </p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedSlot === slot.time ? 'default' : 'outline'}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className="w-full"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Summary and Confirm */}
      {selectedDate && selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Service:</strong> {service.name}</p>
            <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> {selectedSlot}</p>
            <p><strong>Duration:</strong> {service.duration} minutes</p>
            <p><strong>Price:</strong> ${service.price.toFixed(2)}</p>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              className="w-full mt-4" 
              onClick={handleBooking}
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}