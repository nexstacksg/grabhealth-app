'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: string;
  dayOfWeek: number;
  isAvailable: boolean;
  isDayOff: boolean;
  availableSlots: number;
  totalSlots: number;
}

export default function PartnerCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      const monthStr = format(currentMonth, 'yyyy-MM');
      
      // Mock calendar data
      const days = generateMockCalendarDays(currentMonth);
      setCalendarDays(days);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockCalendarDays = (month: Date): CalendarDay[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayOfWeek = getDay(day);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isDayOff = Math.random() > 0.9; // 10% chance of being a day off

      return {
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek,
        isAvailable: !isWeekend && !isDayOff,
        isDayOff,
        availableSlots: isWeekend || isDayOff ? 0 : Math.floor(Math.random() * 10) + 5,
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
  };

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);

  // Add empty cells for days before the first day of the month
  const emptyCells = Array(startingDayOfWeek).fill(null);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar Management</h1>
        <p className="text-gray-600">View and manage your availability calendar</p>
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
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-7 gap-2">
                {Array(35).fill(null).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {emptyCells.map((_, index) => (
                  <div key={`empty-${index}`} className="h-24" />
                ))}
                {calendarDays.map((day) => {
                  const date = new Date(day.date);
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === day.date;
                  
                  return (
                    <div
                      key={day.date}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "h-24 p-2 border rounded-lg cursor-pointer transition-colors",
                        day.isAvailable ? "hover:bg-gray-50" : "",
                        day.isDayOff ? "bg-red-50 border-red-200" : "",
                        !day.isAvailable && !day.isDayOff ? "bg-gray-100" : "",
                        isSelected ? "ring-2 ring-blue-500" : "",
                        isToday(date) ? "border-blue-500 border-2" : ""
                      )}
                    >
                      <div className="flex flex-col h-full">
                        <div className={cn(
                          "text-sm font-medium",
                          !isSameMonth(date, currentMonth) ? "text-gray-400" : "",
                          day.isDayOff ? "text-red-600" : ""
                        )}>
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
                                  width: `${(day.availableSlots / day.totalSlots) * 100}%`
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
            <CardTitle>Details for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button>Manage Time Slots</Button>
              <Button variant="outline">Mark as Day Off</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}