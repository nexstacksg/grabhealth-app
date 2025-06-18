'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PartnerAuthService } from '@app/shared-services';

interface CalendarDay {
  date: string;
  dayOfWeek: number;
  isAvailable: boolean;
  isDayOff: boolean;
  availableSlots: number;
  totalSlots: number;
}

export default function PartnerCalendarPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const partnerAuthService = new PartnerAuthService();

  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const result = await partnerAuthService.checkPartnerAuth();
      if (result.success && result.partnerInfo) {
        setIsPartner(true);
        setPartnerInfo(result.partnerInfo);
        setPartnerId(result.partnerInfo.id);
      } else {
        setIsPartner(false);
        if (result.shouldRedirect && result.redirectPath) {
          window.location.href = result.redirectPath;
        }
        if (result.error) {
          toast.error(result.error);
        }
      }
      setAuthLoading(false);
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (isPartner && partnerInfo) {
      setPartnerId(partnerInfo.id);
      fetchCalendarData();
    }
  }, [isPartner, partnerInfo, currentMonth]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // Clear existing calendar days to ensure fresh data
      setCalendarDays([]);

      const monthStr = format(currentMonth, 'yyyy-MM');
      let fetchedSuccessfully = false;

      // Fetch partner info first to get partner ID
      const profileResponse = await fetch(
        'http://localhost:4000/api/v1/partner/profile',
        {
          credentials: 'include',
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          const partnerIdValue = profileData.data.id;
          setPartnerId(partnerIdValue);

          // Fetch calendar data using public API endpoint
          const calendarResponse = await fetch(
            `http://localhost:4000/api/v1/partners/${partnerIdValue}/calendar/${monthStr}`,
            {
              credentials: 'include',
            }
          );

          if (calendarResponse.ok) {
            const calendarData = await calendarResponse.json();
            if (calendarData.success && calendarData.data) {
              console.log('Calendar data fetched:', calendarData.data);
              setCalendarDays(calendarData.data);
              fetchedSuccessfully = true;
            }
          }
        }
      }

      // Only fall back to mock data if we failed to fetch real data
      if (!fetchedSuccessfully) {
        console.log('Using mock data as fallback');
        const days = generateMockCalendarDays(currentMonth);
        setCalendarDays(days);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      // Use mock data as fallback
      const days = generateMockCalendarDays(currentMonth);
      setCalendarDays(days);
    } finally {
      setLoading(false);
    }
  };

  const generateMockCalendarDays = (month: Date): CalendarDay[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayOfWeek = getDay(day);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isDayOff = Math.random() > 0.9; // 10% chance of being a day off

      return {
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek,
        isAvailable: !isWeekend && !isDayOff,
        isDayOff,
        availableSlots:
          isWeekend || isDayOff ? 0 : Math.floor(Math.random() * 10) + 5,
        totalSlots: isWeekend ? 0 : 15,
      };
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(new Date(day.date));
    setErrorMessage(null); // Clear any error messages when a date is selected
  };

  const handleManageTimeSlots = () => {
    if (selectedDate) {
      // Navigate to time slots management page
      window.location.href = `/partner/availability?date=${format(selectedDate, 'yyyy-MM-dd')}`;
    }
  };

  const handleMarkDayOff = async () => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }

    setActionLoading(true);

    try {
      // If partnerId is not set yet, try to fetch it
      let currentPartnerId = partnerId;
      if (!currentPartnerId) {
        const profileResponse = await fetch(
          'http://localhost:4000/api/v1/partner/profile',
          {
            credentials: 'include',
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            currentPartnerId = profileData.data.id;
            setPartnerId(currentPartnerId);
          } else {
            toast.error('Unable to fetch partner information');
            setActionLoading(false);
            return;
          }
        } else {
          toast.error('Please login as a partner to use this feature');
          setActionLoading(false);
          return;
        }
      }

      const selectedDay = calendarDays.find(
        (d) => d.date === format(selectedDate, 'yyyy-MM-dd')
      );

      if (selectedDay?.isDayOff) {
        toast.info('This day is already marked as a day off');
        setActionLoading(false);
        return;
      }

      // Create a day off via API
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log(
        'Marking day off for date:',
        dateString,
        'Partner ID:',
        currentPartnerId
      );

      const response = await fetch(
        'http://localhost:4000/api/v1/partner/days-off',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            date: dateString,
            reason: 'Day off',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Day marked as off successfully');
          // Refresh calendar data
          await fetchCalendarData();
        } else {
          console.error('API Error:', data.error);
          toast.error(data.error?.message || 'Failed to mark day as off');
        }
      } else if (response.status === 409) {
        // Handle conflict - day is already marked as off
        const errorData = await response.json();
        console.log('Day already marked as off');
        toast.info('This day is already marked as off');
        // Still refresh calendar data to ensure UI is in sync
        await fetchCalendarData();
      } else {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        toast.error(`Failed to mark day as off (${response.status})`);
      }
    } catch (error) {
      console.error('Error marking day off:', error);
      toast.error('An error occurred while marking day as off');
    } finally {
      setActionLoading(false);
    }
  };

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);

  // Add empty cells for days before the first day of the month
  const emptyCells = Array(startingDayOfWeek).fill(null);

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isPartner) {
    return null; // Will redirect via hook
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Calendar Management
        </h1>
        <p className="text-gray-600">
          View and manage your availability calendar
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-7 gap-2">
                {Array(35)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-700 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {emptyCells.map((_, index) => (
                  <div key={`empty-${index}`} className="h-24" />
                ))}
                {calendarDays.map((day) => {
                  const date = new Date(day.date);
                  const isSelected =
                    selectedDate &&
                    format(selectedDate, 'yyyy-MM-dd') === day.date;

                  return (
                    <div
                      key={day.date}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        'h-24 p-2 border rounded-lg cursor-pointer transition-colors',
                        day.isAvailable ? 'hover:bg-gray-50' : '',
                        day.isDayOff ? 'bg-red-50 border-red-200' : '',
                        !day.isAvailable && !day.isDayOff ? 'bg-gray-100' : '',
                        isSelected ? 'ring-2 ring-blue-500' : '',
                        isToday(date) ? 'border-blue-500 border-2' : ''
                      )}
                    >
                      <div className="flex flex-col h-full">
                        <div
                          className={cn(
                            'text-sm font-medium',
                            !isSameMonth(date, currentMonth)
                              ? 'text-gray-400'
                              : '',
                            day.isDayOff ? 'text-red-600' : ''
                          )}
                        >
                          {format(date, 'd')}
                        </div>
                        {day.isAvailable && (
                          <div className="mt-auto">
                            <div className="text-xs text-gray-600">
                              {day.availableSlots}/{day.totalSlots} slots
                            </div>
                            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${(day.availableSlots / day.totalSlots) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {day.isDayOff && (
                          <div className="mt-auto text-xs text-red-600 font-medium">
                            Day Off
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Weekend/Closed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border-red-200 border rounded"></div>
                  <span>Day Off</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Details for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleManageTimeSlots}
                disabled={actionLoading}
                className="flex-1"
              >
                Manage Time Slots
              </Button>
              <Button
                variant="outline"
                onClick={handleMarkDayOff}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : 'Mark as Day Off'}
              </Button>
            </div>
            {calendarDays.find(
              (d) => d.date === format(selectedDate, 'yyyy-MM-dd')
            )?.isDayOff && (
              <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                This day is already marked as a day off.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
