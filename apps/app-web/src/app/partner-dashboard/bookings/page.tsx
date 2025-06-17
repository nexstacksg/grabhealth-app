'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  isFreeCheckup: boolean;
  totalAmount: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockBookings: Booking[] = [
        {
          id: '1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          service: 'Basic Health Screening',
          bookingDate: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          status: 'CONFIRMED',
          totalAmount: 80,
          isFreeCheckup: false,
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          service: 'Premium Health Screening',
          bookingDate: new Date(),
          startTime: '10:30',
          endTime: '12:00',
          status: 'PENDING',
          totalAmount: 150,
          isFreeCheckup: false,
        },
        {
          id: '3',
          customerName: 'Bob Johnson',
          customerEmail: 'bob@example.com',
          service: 'Basic Health Screening',
          bookingDate: new Date(Date.now() + 86400000), // Tomorrow
          startTime: '14:00',
          endTime: '15:00',
          status: 'CONFIRMED',
          totalAmount: 0,
          isFreeCheckup: true,
          notes: 'Annual free checkup',
        },
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter((booking) => {
          const bookingDate = new Date(booking.bookingDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        filtered = filtered.filter((booking) => new Date(booking.bookingDate) > today);
        break;
      case 'past':
        filtered = filtered.filter((booking) => new Date(booking.bookingDate) < today);
        break;
    }

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      // This would be replaced with actual API call
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus as Booking['status'] }
            : booking
        )
      );
      toast.success('Booking status updated');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmed' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
      COMPLETED: { variant: 'outline' as const, label: 'Completed' },
      NO_SHOW: { variant: 'destructive' as const, label: 'No Show' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600">Manage and track all your appointments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(booking.bookingDate, 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{booking.service}</div>
                          {booking.isFreeCheckup && (
                            <Badge variant="outline" className="mt-1">
                              Free Checkup
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ${booking.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={booking.status !== 'PENDING'}
                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={booking.status === 'CANCELLED' || booking.status === 'COMPLETED'}
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}