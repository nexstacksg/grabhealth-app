'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

interface DayAvailability {
  dayOfWeek: number;
  dayName: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxBookingsPerSlot: number;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAvailability: DayAvailability[] = DAYS_OF_WEEK.map((day, index) => ({
        dayOfWeek: index,
        dayName: day,
        isAvailable: index > 0 && index < 6, // Monday to Friday
        startTime: index === 0 ? '10:00' : '09:00',
        endTime: index === 0 ? '18:00' : (index === 6 ? '18:00' : '20:00'),
        slotDuration: 30,
        maxBookingsPerSlot: 2,
      }));
      setAvailability(mockAvailability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Availability settings saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setAvailability(
      availability.map((day) =>
        day.dayOfWeek === dayIndex
          ? { ...day, isAvailable: !day.isAvailable }
          : day
      )
    );
  };

  const handleTimeChange = (
    dayIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setAvailability(
      availability.map((day) =>
        day.dayOfWeek === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSlotSettingChange = (
    dayIndex: number,
    field: 'slotDuration' | 'maxBookingsPerSlot',
    value: string
  ) => {
    setAvailability(
      availability.map((day) =>
        day.dayOfWeek === dayIndex
          ? { ...day, [field]: parseInt(value) || 0 }
          : day
      )
    );
  };

  const applyToAllDays = (sourceDay: DayAvailability) => {
    setAvailability(
      availability.map((day) => ({
        ...day,
        startTime: sourceDay.startTime,
        endTime: sourceDay.endTime,
        slotDuration: sourceDay.slotDuration,
        maxBookingsPerSlot: sourceDay.maxBookingsPerSlot,
      }))
    );
    toast.success('Settings applied to all days');
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
        <h1 className="text-2xl font-bold text-gray-900">Availability Settings</h1>
        <p className="text-gray-600">Configure your regular weekly availability</p>
      </div>

      <div className="space-y-6">
        {availability.map((day) => (
          <Card key={day.dayOfWeek}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{day.dayName}</CardTitle>
                <Switch
                  checked={day.isAvailable}
                  onCheckedChange={() => handleDayToggle(day.dayOfWeek)}
                />
              </div>
            </CardHeader>
            {day.isAvailable && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor={`start-${day.dayOfWeek}`}>Start Time</Label>
                    <Input
                      id={`start-${day.dayOfWeek}`}
                      type="time"
                      value={day.startTime}
                      onChange={(e) =>
                        handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${day.dayOfWeek}`}>End Time</Label>
                    <Input
                      id={`end-${day.dayOfWeek}`}
                      type="time"
                      value={day.endTime}
                      onChange={(e) =>
                        handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`slot-${day.dayOfWeek}`}>Slot Duration</Label>
                    <Select
                      value={day.slotDuration.toString()}
                      onValueChange={(value) =>
                        handleSlotSettingChange(day.dayOfWeek, 'slotDuration', value)
                      }
                    >
                      <SelectTrigger id={`slot-${day.dayOfWeek}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`max-${day.dayOfWeek}`}>Max Bookings/Slot</Label>
                    <Select
                      value={day.maxBookingsPerSlot.toString()}
                      onValueChange={(value) =>
                        handleSlotSettingChange(day.dayOfWeek, 'maxBookingsPerSlot', value)
                      }
                    >
                      <SelectTrigger id={`max-${day.dayOfWeek}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 booking</SelectItem>
                        <SelectItem value="2">2 bookings</SelectItem>
                        <SelectItem value="3">3 bookings</SelectItem>
                        <SelectItem value="4">4 bookings</SelectItem>
                        <SelectItem value="5">5 bookings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyToAllDays(day)}
                    >
                      Apply to All
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSaveAvailability} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}