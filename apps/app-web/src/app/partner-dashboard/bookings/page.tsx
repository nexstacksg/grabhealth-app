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
import {
  Calendar,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PartnerAuthService } from '@app/shared-services';

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
  const [authLoading, setAuthLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);
  const partnerAuthService = new PartnerAuthService();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const result = await partnerAuthService.checkPartnerAuth();
      if (result.success) {
        setIsPartner(true);
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
    if (isPartner) {
      fetchBookings();
    }
  }, [isPartner, statusFilter, dateFilter, pagination.page]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Add date filters
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        params.append('fromDate', today.toISOString());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        params.append('toDate', tomorrow.toISOString());
      } else if (dateFilter === 'upcoming') {
        params.append('fromDate', new Date().toISOString());
      } else if (dateFilter === 'past') {
        params.append('toDate', today.toISOString());
      }

      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      // Fetch bookings from API
      const response = await fetch(
        `http://localhost:4000/api/v1/partner-dashboard/bookings?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in as a partner to access this page');
          window.location.href = '/auth/login';
          return;
        }
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Transform API data to match our Booking interface
        const transformedBookings: Booking[] = data.data.bookings.map(
          (booking: any) => ({
            id: booking.id,
            customerName: booking.user?.name || 'Unknown Customer',
            customerEmail: booking.user?.email || 'No email',
            service: booking.service?.name || 'Unknown Service',
            bookingDate: new Date(booking.bookingDate),
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            notes: booking.notes,
            isFreeCheckup: booking.isFreeCheckup || false,
            totalAmount: booking.totalAmount || 0,
          })
        );

        setBookings(transformedBookings);

        // Update pagination info
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination?.total || transformedBookings.length,
          totalPages: data.data.pagination?.totalPages || 1,
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      // Set empty array instead of keeping old data
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter (client-side only)
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.customerEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status and date filtering is now handled server-side

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/partner-dashboard/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update booking status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update local state optimistically
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus as Booking['status'] }
              : booking
          )
        );
        toast.success('Booking status updated');
      } else {
        toast.error(data.error?.message || 'Failed to update booking status');
      }
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
          Bookings Management
        </h1>
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
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
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
              <Select
                value={dateFilter}
                onValueChange={(value) => {
                  setDateFilter(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
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
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
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
                          <div className="font-medium">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.customerEmail}
                          </div>
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
                      <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={booking.status !== 'PENDING'}
                            onClick={() =>
                              handleStatusUpdate(booking.id, 'CONFIRMED')
                            }
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              booking.status === 'CANCELLED' ||
                              booking.status === 'COMPLETED'
                            }
                            onClick={() =>
                              handleStatusUpdate(booking.id, 'CANCELLED')
                            }
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

          {/* Pagination Controls */}
          {(pagination.totalPages > 1 || pagination.total > 0) && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span>{' '}
                  bookings
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pageSize" className="text-sm text-gray-700">
                    Per page:
                  </Label>
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => {
                      setPagination((prev) => ({
                        ...prev,
                        limit: parseInt(value),
                        page: 1,
                        totalPages: Math.ceil(prev.total / parseInt(value)),
                      }));
                    }}
                  >
                    <SelectTrigger id="pageSize" className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="hidden sm:flex"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {/* Show page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      if (pageNum < 1 || pageNum > pagination.totalPages)
                        return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.totalPages,
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="hidden sm:flex"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
