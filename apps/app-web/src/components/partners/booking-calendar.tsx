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

export function BookingCalendar({
  partnerId,
  service,
  onBookingComplete,
  isFreeCheckup = false,
}: BookingCalendarProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<IAvailableSlot[]>([]);
  const [calendarDays, setCalendarDays] = useState<ICalendarDay[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    | 'slot_full'
    | 'slot_unavailable'
    | 'network'
    | 'validation'
    | 'generic'
    | null
  >(null);
  const [suggestedSlots, setSuggestedSlots] = useState<IAvailableSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [freeCheckupStatus, setFreeCheckupStatus] = useState<any>(null);

  // Utility function to refresh slots and handle errors
  const refreshAvailableSlots = async (date: Date) => {
    try {
      setIsLoadingSlots(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = await services.partners.getPartnerAvailability(
        partnerId,
        service.id,
        dateStr
      );
      setAvailableSlots(slots);
      return slots;
    } catch (error) {
      console.error('Failed to refresh slots:', error);
      return [];
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Function to get suggested alternative slots
  const getSuggestedSlots = async (
    originalDate: Date,
    originalTime: string
  ) => {
    const suggestions: IAvailableSlot[] = [];

    // Check same day for other available slots
    const sameDaySlots = await refreshAvailableSlots(originalDate);
    const availableSameDay = sameDaySlots
      .filter((slot) => slot.available && slot.time !== originalTime)
      .slice(0, 3);
    suggestions.push(...availableSameDay);

    // If not enough suggestions, check next few days
    if (suggestions.length < 3) {
      for (let i = 1; i <= 3 && suggestions.length < 6; i++) {
        const nextDate = new Date(originalDate);
        nextDate.setDate(nextDate.getDate() + i);

        try {
          const dateStr = format(nextDate, 'yyyy-MM-dd');
          const nextDaySlots = await services.partners.getPartnerAvailability(
            partnerId,
            service.id,
            dateStr
          );
          const availableNextDay = nextDaySlots
            .filter((slot) => slot.available)
            .slice(0, 2);
          suggestions.push(...availableNextDay);
        } catch (error) {
          console.error(`Failed to get slots for ${nextDate}:`, error);
        }
      }
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  // Enhanced error handling function
  const handleBookingError = async (
    error: any,
    selectedDate: Date,
    selectedSlot: string
  ) => {
    console.error('Booking error details:', error);

    let errorMessage = 'Failed to create booking. Please try again.';
    let errorTypeValue: typeof errorType = 'generic';

    // Check for network/connectivity issues first
    if (!error || Object.keys(error).length === 0 || !error.response) {
      errorMessage =
        'Unable to connect to server. Please check your connection and try again.';
      errorTypeValue = 'network';
      setError(errorMessage);
      setErrorType(errorTypeValue);
      return;
    }

    // Check for authentication issues
    if (error.status === 401 || error?.response?.status === 401) {
      errorMessage = 'Please log in to make a booking.';
      errorTypeValue = 'validation';
      setError(errorMessage);
      setErrorType(errorTypeValue);
      return;
    }

    // Parse error response
    const errorResponse = error?.response?.data;
    const errorCode = errorResponse?.error?.code || error?.error?.code;
    const errorMsg =
      errorResponse?.error?.message || error?.error?.message || error?.message;

    if (
      errorCode === 'CONFLICT' ||
      errorMsg?.includes('slot') ||
      errorMsg?.includes('available')
    ) {
      errorMessage =
        'This time slot is no longer available. Please select another time.';
      errorTypeValue = 'slot_unavailable';

      // Refresh slots and get suggestions
      await refreshAvailableSlots(selectedDate);
      const suggestions = await getSuggestedSlots(selectedDate, selectedSlot);
      setSuggestedSlots(suggestions);
    } else if (
      errorCode === 'SLOT_FULL' ||
      errorMsg?.includes('full') ||
      errorMsg?.includes('booked')
    ) {
      errorMessage = 'This slot is fully booked. Please choose another time.';
      errorTypeValue = 'slot_full';

      // Refresh slots and get suggestions
      await refreshAvailableSlots(selectedDate);
      const suggestions = await getSuggestedSlots(selectedDate, selectedSlot);
      setSuggestedSlots(suggestions);
    } else if (
      errorCode === 'VALIDATION_ERROR' ||
      errorMsg?.includes('validation')
    ) {
      errorMessage = 'Please check your booking details and try again.';
      errorTypeValue = 'validation';
    } else if (errorCode === 'NETWORK_ERROR' || !error?.response) {
      errorMessage =
        'Network error. Please check your connection and try again.';
      errorTypeValue = 'network';
    }

    setError(errorMessage);
    setErrorType(errorTypeValue);
  };

  // Fetch free checkup status on mount
  useEffect(() => {
    const fetchFreeCheckupStatus = async () => {
      if (user && service.category === 'Body Check') {
        try {
          const status = await services.bookings.checkFreeCheckupEligibility();
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
        // For now, just create an empty calendar until the backend method is available
        const calendar: any[] = [];
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
    if (selectedDate) {
      refreshAvailableSlots(selectedDate);
      setSelectedSlot(null);
      setError(null);
    }
  }, [partnerId, selectedDate]);

  // Auto-refresh slots every 30 seconds for real-time updates
  useEffect(() => {
    if (!selectedDate) return;

    const interval = setInterval(() => {
      refreshAvailableSlots(selectedDate);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !user) return;

    try {
      setIsBooking(true);
      setError(null);
      setErrorType(null);
      setSuggestedSlots([]);

      // Real-time slot validation before booking
      const currentSlots = await refreshAvailableSlots(selectedDate);
      const selectedSlotData = currentSlots.find(
        (slot) => slot.time === selectedSlot
      );

      if (!selectedSlotData || !selectedSlotData.available) {
        throw new Error('This time slot is no longer available');
      }

      await services.bookings.createBooking({
        partnerId,
        serviceId: service.id,
        bookingDate: selectedDate.toISOString(),
        startTime: selectedSlot,
        notes: `Booking for ${service.name}`,
        isFreeCheckup:
          isFreeCheckup ||
          (freeCheckupStatus?.eligible && service.category === 'Body Check'),
      });

      onBookingComplete();
    } catch (error) {
      // Handle the case where error is an empty object or undefined
      const errorToHandle = error || { message: 'Unknown error occurred' };
      await handleBookingError(errorToHandle, selectedDate, selectedSlot);
    } finally {
      setIsBooking(false);
    }
  };

  // Disable dates that are not available
  const disabledDays = calendarDays
    .filter((day) => !day.isAvailable || day.availableSlots === 0)
    .map((day) => new Date(day.date));

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please{' '}
          <a href="/auth/login" className="underline">
            login
          </a>{' '}
          to book an appointment.
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
              <p className="text-xs text-gray-600 mt-0.5">
                Choose your appointment date
              </p>
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
                    return disabledDays.some(
                      (d) => d.toDateString() === date.toDateString()
                    );
                  }}
                  className="rounded-md w-full mx-auto"
                  classNames={{
                    months: 'space-y-1',
                    month: 'space-y-1',
                    caption:
                      'flex justify-center pt-1 relative items-center px-2',
                    caption_label: 'text-xs font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button:
                      'h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100',
                    nav_button_previous: 'absolute left-0',
                    nav_button_next: 'absolute right-0',
                    table: 'w-full border-collapse',
                    head_row: 'flex justify-around',
                    head_cell:
                      'text-muted-foreground rounded-md w-7 font-normal text-[0.7rem]',
                    row: 'flex justify-around w-full mt-0.5',
                    cell: 'text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md',
                    day_selected:
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                    day_today: 'bg-accent text-accent-foreground font-semibold',
                    day_outside: 'text-muted-foreground opacity-40',
                    day_disabled:
                      'text-muted-foreground opacity-40 cursor-not-allowed',
                    day_range_middle:
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    day_hidden: 'invisible',
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
                {selectedDate
                  ? format(selectedDate, 'EEE, MMM d')
                  : 'Pick a date first'}
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
                        px-1 py-1.5 text-[11px] font-medium rounded transition-all relative
                        ${
                          selectedSlot === slot.time
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : slot.available
                              ? 'bg-gray-100 hover:bg-emerald-50 text-gray-700 border border-gray-200 hover:border-emerald-200'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200'
                        }
                      `}
                      title={
                        slot.available
                          ? `Available (${slot.maxBookings - slot.currentBookings}/${slot.maxBookings} slots)`
                          : 'Fully booked'
                      }
                    >
                      <div>{slot.time}</div>
                      {slot.available && slot.maxBookings > 1 && (
                        <div className="text-[9px] opacity-70">
                          {slot.maxBookings - slot.currentBookings}/
                          {slot.maxBookings}
                        </div>
                      )}
                      {!slot.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-gray-400"></div>
                        </div>
                      )}
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
                    <span>
                      {selectedSlot} ({service.duration} min)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {freeCheckupStatus?.eligible &&
                  service.category === 'Body Check' ? (
                    <>
                      <span className="line-through text-gray-400">
                        ${service.price.toFixed(2)}
                      </span>
                      <span className="ml-2 text-green-600">FREE</span>
                    </>
                  ) : (
                    <span>${service.price.toFixed(2)}</span>
                  )}
                </div>
                {freeCheckupStatus?.eligible &&
                  service.category === 'Body Check' && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <Gift className="h-3 w-3" />
                      <span>Annual checkup</span>
                    </div>
                  )}
              </div>
            </div>

            {error && (
              <div className="mb-3 space-y-3">
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>

                {/* Show suggested alternative slots */}
                {(errorType === 'slot_full' ||
                  errorType === 'slot_unavailable') &&
                  suggestedSlots.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-blue-900 mb-2">
                        Suggested alternative times:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestedSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const slotDate = new Date(slot.date);
                              setSelectedDate(slotDate);
                              setSelectedSlot(slot.time);
                              setError(null);
                              setErrorType(null);
                              setSuggestedSlots([]);
                            }}
                            className="text-xs bg-white border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition-colors"
                          >
                            <div className="font-medium">{slot.time}</div>
                            <div className="text-blue-600">
                              {format(new Date(slot.date), 'MMM d')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Retry button for network errors */}
                {errorType === 'network' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setErrorType(null);
                      if (selectedDate) {
                        refreshAvailableSlots(selectedDate);
                      }
                    }}
                    className="w-full text-xs"
                  >
                    Retry
                  </Button>
                )}
              </div>
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
