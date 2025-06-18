'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar as CalendarIcon, Clock, Gift } from 'lucide-react';
import { IService, IAvailableSlot, ICalendarDay } from '@app/shared-types';
import services from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface BookingCalendarProps {
  partnerId: string;
  service: IService;
  onBookingComplete: () => void;
  isFreeCheckup?: boolean;
}

export function BookingCalendar({ partnerId, service, onBookingComplete, isFreeCheckup = false }: BookingCalendarProps) {
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
  const [freeCheckupStatus, setFreeCheckupStatus] = useState<any>(null);

  // Fetch free checkup status on mount
  useEffect(() => {
    const fetchFreeCheckupStatus = async () => {
      if (user && service.category === 'Body Check') {
        try {
          const status = await services.bookings.getFreeCheckupStatus(user.id);
          setFreeCheckupStatus(status);
        } catch (error) {
          console.error('Failed to fetch free checkup status:', error);
        }
      }
    };

    fetchFreeCheckupStatus();
  }, [user, service.category]);

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
        paymentMethod: 'CREDIT_CARD',
        isFreeCheckup: isFreeCheckup || (freeCheckupStatus?.eligible && service.category === 'Body Check')
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
    <div className="space-y-3">
      {/* Combined Calendar and Time Slots */}
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Calendar Section */}
          <div>
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-sm">Select Date</h3>
              <p className="text-xs text-gray-600 mt-0.5">Choose your appointment date</p>
            </div>
            <div className="p-3">
              {isLoadingCalendar ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  onMonthChange={setCurrentMonth}
                  disabled={(date) => {
                    // Disable past dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) return true;
                    // Disable unavailable dates
                    return disabledDays.some(d => d.toDateString() === date.toDateString());
                  }}
                  className="rounded-md w-full mx-auto"
                  classNames={{
                    months: "space-y-1",
                    month: "space-y-1",
                    caption: "flex justify-center pt-1 relative items-center px-2",
                    caption_label: "text-xs font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-0",
                    nav_button_next: "absolute right-0",
                    table: "w-full border-collapse",
                    head_row: "flex justify-around",
                    head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]",
                    row: "flex justify-around w-full mt-0.5",
                    cell: "text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground font-semibold",
                    day_outside: "text-muted-foreground opacity-40",
                    day_disabled: "text-muted-foreground opacity-40 cursor-not-allowed",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              )}
            </div>
          </div>

          {/* Time Slots Section */}
          <div>
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-sm">Select Time</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Pick a date first'}
              </p>
            </div>
            <div className="p-3 min-h-[280px] flex flex-col">
              {!selectedDate ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <CalendarIcon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-xs">Select a date first</p>
                  </div>
                </div>
              ) : isLoadingSlots ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <p className="text-xs text-center">No available slots</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 max-h-[240px] overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`
                        px-1 py-1.5 text-[11px] font-medium rounded transition-all
                        ${selectedSlot === slot.time 
                          ? 'bg-emerald-500 text-white shadow-sm' 
                          : slot.available 
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Summary and Confirm */}
      {selectedDate && selectedSlot && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">Booking Summary</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{selectedSlot} ({service.duration} min)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {(freeCheckupStatus?.eligible && service.category === 'Body Check') ? (
                    <>
                      <span className="line-through text-gray-400">${service.price.toFixed(2)}</span>
                      <span className="ml-2 text-green-600">FREE</span>
                    </>
                  ) : (
                    <span>${service.price.toFixed(2)}</span>
                  )}
                </div>
                {freeCheckupStatus?.eligible && service.category === 'Body Check' && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <Gift className="h-3 w-3" />
                    <span>Annual checkup</span>
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              className="w-full h-9 text-sm" 
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