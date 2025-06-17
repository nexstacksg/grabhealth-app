'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  upcomingToday: number;
}

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    upcomingToday: 0,
  });
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:4000/api/v1/partner-dashboard/stats', {
        credentials: 'include',
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Fetch today's schedule
      const scheduleResponse = await fetch('http://localhost:4000/api/v1/partner-dashboard/schedule/today', {
        credentials: 'include',
      });
      
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        if (scheduleData.success) {
          setTodayBookings(scheduleData.data.map((booking: any) => ({
            id: booking.id,
            time: booking.startTime,
            customerName: `${booking.user.firstName} ${booking.user.lastName}`,
            service: booking.service.name,
            status: booking.status,
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fall back to mock data if API fails
      setStats({
        todayBookings: 5,
        weekBookings: 23,
        monthBookings: 87,
        upcomingToday: 3,
      });
      
      setTodayBookings([
        {
          id: '1',
          time: '09:00',
          customerName: 'John Doe',
          service: 'Basic Health Screening',
          status: 'CONFIRMED',
        },
        {
          id: '2',
          time: '10:30',
          customerName: 'Jane Smith',
          service: 'Premium Health Screening',
          status: 'CONFIRMED',
        },
        {
          id: '3',
          time: '14:00',
          customerName: 'Bob Johnson',
          service: 'Vaccination Consultation',
          status: 'PENDING',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/partner-dashboard/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(`Booking ${action.toLowerCase()} successfully`);
          // Refresh the data
          await fetchDashboardData();
        } else {
          toast.error(data.error?.message || 'Failed to update booking');
        }
      } else {
        toast.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('An error occurred while updating the booking');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingToday} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekBookings}</div>
            <p className="text-xs text-muted-foreground">
              Bookings this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Slots filled today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule - {format(new Date(), 'EEEE, MMMM d')}</CardTitle>
        </CardHeader>
        <CardContent>
          {todayBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings scheduled for today</p>
          ) : (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold">{booking.time}</div>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </div>
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                          disabled={actionLoading === booking.id}
                          className="h-8"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingAction(booking.id, 'CANCELLED')}
                          disabled={actionLoading === booking.id}
                          className="h-8"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingAction(booking.id, 'COMPLETED')}
                          disabled={actionLoading === booking.id}
                          className="h-8"
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookingAction(booking.id, 'CANCELLED')}
                          disabled={actionLoading === booking.id}
                          className="h-8"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}