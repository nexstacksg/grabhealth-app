'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarOff, Plus, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DayOff {
  id: string;
  date: Date;
  reason?: string;
  isRecurring: boolean;
}

export default function DaysOffPage() {
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchDaysOff();
  }, []);

  const fetchDaysOff = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setDaysOff([
        {
          id: '1',
          date: new Date('2024-12-25'),
          reason: 'Christmas',
          isRecurring: true,
        },
        {
          id: '2',
          date: new Date('2024-12-31'),
          reason: 'New Year\'s Eve',
          isRecurring: true,
        },
        {
          id: '3',
          date: new Date('2024-06-15'),
          reason: 'Personal Leave',
          isRecurring: false,
        },
      ]);
    } catch (error) {
      console.error('Error fetching days off:', error);
      toast.error('Failed to load days off');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDaysOff = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    try {
      // This would be replaced with actual API call
      const newDaysOff = selectedDates.map((date, index) => ({
        id: `new-${Date.now()}-${index}`,
        date,
        reason,
        isRecurring,
      }));

      setDaysOff([...daysOff, ...newDaysOff]);
      setSelectedDates([]);
      setReason('');
      setIsRecurring(false);
      setDialogOpen(false);
      toast.success('Days off added successfully');
    } catch (error) {
      console.error('Error adding days off:', error);
      toast.error('Failed to add days off');
    }
  };

  const handleDeleteDayOff = async (id: string) => {
    try {
      // This would be replaced with actual API call
      setDaysOff(daysOff.filter(day => day.id !== id));
      toast.success('Day off removed successfully');
    } catch (error) {
      console.error('Error deleting day off:', error);
      toast.error('Failed to remove day off');
    }
  };

  const handleQuickAddHoliday = (holiday: string) => {
    const holidayDates: Record<string, Date[]> = {
      'singapore': [
        new Date('2024-01-01'), // New Year
        new Date('2024-02-10'), // Chinese New Year
        new Date('2024-02-11'), // Chinese New Year
        new Date('2024-03-29'), // Good Friday
        new Date('2024-05-01'), // Labour Day
        new Date('2024-05-22'), // Vesak Day
        new Date('2024-06-17'), // Hari Raya Haji
        new Date('2024-08-09'), // National Day
        new Date('2024-11-11'), // Deepavali
        new Date('2024-12-25'), // Christmas
      ],
    };

    const dates = holidayDates[holiday] || [];
    setSelectedDates(dates);
    setReason(`${holiday.charAt(0).toUpperCase() + holiday.slice(1)} Public Holidays`);
    setIsRecurring(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Days Off Management</h1>
        <p className="text-gray-600">Manage your days off and holidays</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Days Off Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Days Off</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Days Off
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Days Off</DialogTitle>
                    <DialogDescription>
                      Choose the dates you want to mark as days off
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Quick Add Holidays</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAddHoliday('singapore')}
                        >
                          Singapore Holidays
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Select Dates</Label>
                      <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates || [])}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Input
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Personal Leave, Holiday"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                      />
                      <Label htmlFor="recurring">
                        Recurring annually
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDaysOff}>
                      Add Days Off
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar View */}
            <Calendar
              mode="multiple"
              selected={daysOff.map(d => d.date)}
              className="rounded-md border"
              disabled
            />
          </CardContent>
        </Card>

        {/* Days Off List */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Days Off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {daysOff.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No days off scheduled</p>
              ) : (
                daysOff.map((dayOff) => (
                  <div
                    key={dayOff.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {format(dayOff.date, 'EEEE, MMMM d, yyyy')}
                      </div>
                      {dayOff.reason && (
                        <div className="text-sm text-gray-600">{dayOff.reason}</div>
                      )}
                      {dayOff.isRecurring && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <RefreshCw className="h-3 w-3" />
                          Recurring annually
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDayOff(dayOff.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}