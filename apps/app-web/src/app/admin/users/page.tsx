'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResponsiveTableWrapper } from '@/components/ui/responsive-table-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IUserPublic } from '@app/shared-types';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function UsersPage() {
  const [users, setUsers] = useState<IUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole as any } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  }

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Handle page change
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 search-filter-container p-3 mb-4">
        <h2 className="text-base font-medium text-gray-700">
          Users Management
        </h2>
        <Button
          onClick={fetchUsers}
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="company">Company</SelectItem>
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
                    <TableCell colSpan={6}>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-gray-500 text-sm"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="py-2 px-3 align-middle">
                      {user.id}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      <Select
                        defaultValue={user.role || 'customer'}
                        onValueChange={(value) =>
                          updateUserRole(user.id, value)
                        }
                      >
                        <SelectTrigger className="h-7 text-sm w-full min-w-[100px] max-w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className="text-sm min-w-[120px]"
                          position="popper"
                        >
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="leader">Leader</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="py-2 px-3 align-middle">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-sm px-3 py-0 rounded-md"
                        onClick={() =>
                          (window.location.href = `/admin/users/${user.id}`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
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
