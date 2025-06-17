'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

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

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // This would be replaced with actual API calls
      setStats({
        todayBookings: 5,
        weekBookings: 23,
        monthBookings: 87,
        upcomingToday: 3,
      });

      // Mock today's bookings
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'CONFIRMED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
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