'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResponsiveTableWrapper } from '@/components/ui/responsive-table-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { IAccountRequest } from '@app/shared-types';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function AccountRequestsPage() {
  const [requests, setRequests] = useState<IAccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequestsCallback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAccountRequests();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error fetching account requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequestsCallback();
  }, [fetchRequestsCallback]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const data = await adminService.getAccountRequests();
      setRequests(data.requests);
    } catch (error) {
      console.error('Error fetching account requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRequestStatus(
    requestId: number,
    status: 'approved' | 'rejected'
  ) {
    try {
      await adminService.updateAccountRequest(requestId, status);

      // Update the local state
      setRequests(
        requests.map((request) =>
          request.id === requestId ? { ...request, status } : request
        ) as any
      );
    } catch (error) {
      console.error(`Error ${status} account request:`, error);
      alert(`Failed to ${status} account request`);
    }
  }

  // Filter requests based on search term and status filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchTerm === '' ||
      request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.requestDetails && request.requestDetails.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Handle page change
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 search-filter-container p-3">
        <h2 className="text-base font-medium text-gray-700">
          Account Requests
        </h2>
        <Button
          onClick={fetchRequestsCallback}
          variant="outline"
          size="sm"
          className="h-8 text-sm px-2 py-0 w-full sm:w-auto"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="mb-4 search-filter-container p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 text-xs"
            />
          </div>
          <div className="w-full sm:w-1/2 md:w-1/3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <div
          className="table-container"
          style={{
            width: '100%',
            overflowX: 'auto',
            display: 'block',
            position: 'relative',
            maxWidth: '100%',
          }}
        >
          <Table
            className="text-sm"
            style={{ minWidth: '600px', width: '100%' }}
          >
            <TableHeader>
              <TableRow>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  ID
                </TableHead>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  Name
                </TableHead>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  Email
                </TableHead>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  Role
                </TableHead>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  Status
                </TableHead>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  Created
                </TableHead>
                <TableHead className="py-2 px-3 bg-gray-50 font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-gray-500 text-sm"
                  >
                    No account requests found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50">
                    <TableCell className="py-2 px-3 align-middle">
                      {request.id}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      <div>
                        <div className="font-medium">User {request.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {request.requestDetails || 'N/A'}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {request.requestType}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {request.status === 'pending' && (
                        <div className="flex flex-col xs:flex-row gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50 h-7 text-sm px-3 py-0 rounded-md"
                            onClick={() =>
                              updateRequestStatus(request.id, 'approved')
                            }
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-sm px-3 py-0 rounded-md"
                            onClick={() =>
                              updateRequestStatus(request.id, 'rejected')
                            }
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && requests.length > 0 && (
          <div className="py-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => paginate(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* First page */}
                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => paginate(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Ellipsis */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Previous page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => paginate(currentPage - 1)}>
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Current page */}
                <PaginationItem>
                  <PaginationLink isActive>{currentPage}</PaginationLink>
                </PaginationItem>

                {/* Next page */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => paginate(currentPage + 1)}>
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Ellipsis */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                {currentPage < totalPages - 1 && totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => paginate(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => paginate(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
