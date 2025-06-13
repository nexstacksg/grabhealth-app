'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Phone,
  MapPin,
  Shield,
  RefreshCw,
  X,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { IUserPublic } from '@app/shared-types';

// Extend the User type to include user_points and other fields
interface ExtendedUser extends IUserPublic {
  user_points?: number;
  name?: string; // For compatibility with form
}
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    user_points: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
    user_points: '0',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setEditFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'customer',
        user_points: user.user_points?.toString() || '0',
      });
    }
  }, [user]);

  async function fetchUserDetails() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load user details'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUser() {
    setIsSaving(true);
    setSaveError(null);

    try {
      console.log('Sending update with data:', {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        role: editFormData.role,
        user_points: editFormData.user_points,
      });

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          role: editFormData.role,
          user_points: parseInt(editFormData.user_points) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(
          errorData.error || `Failed to update user: ${response.statusText}`
        );
      }

      // Update the user data in state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstName: editFormData.firstName,
              lastName: editFormData.lastName,
              email: editFormData.email,
              role: editFormData.role as any,
              user_points: parseInt(editFormData.user_points),
            }
          : null
      );

      // Close the modal
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setSaveError(
        err instanceof Error ? err.message : 'Failed to update user'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin mb-4">
          <RefreshCw size={32} className="text-[#0C99B4]" />
        </div>
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-red-500 mb-4">
          <Shield size={32} />
        </div>
        <p className="text-red-500 font-medium mb-2">Error loading user</p>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchUserDetails}>Try Again</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 mb-4">
          <User size={32} />
        </div>
        <p className="text-gray-500 mb-4">User not found</p>
        <Link href="/admin/users">
          <Button>Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Edit User</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                  {saveError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      lastName: e.target.value,
                    })
                  }
                  placeholder="Last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, role: value })
                  }
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_points">User Points</Label>
                <Input
                  id="user_points"
                  type="number"
                  min="0"
                  value={editFormData.user_points}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      user_points: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="bg-[#0C99B4] hover:bg-[#0A87A0] text-white"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Back button and header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="flex items-center text-sm text-gray-600 hover:text-[#0C99B4] transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Users
        </Link>
      </div>

      {/* User profile header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="h-20 w-20 rounded-full bg-[#E6F7FA] text-[#0C99B4] flex items-center justify-center text-2xl font-medium flex-shrink-0">
            {(
              user?.firstName?.charAt(0) ||
              user?.email?.charAt(0) ||
              'U'
            ).toUpperCase()}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Mail size={14} className="mr-1.5" />
                {user.email}
              </div>
              {/* Phone number would go here if available in the User type */}
              {user.createdAt && (
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1.5" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 mt-4 md:mt-0">
            <div className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-[#E6F7FA] text-[#0C99B4]">
              {user.role || 'Customer'}
            </div>
          </div>
        </div>
      </div>

      {/* User details tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  User's personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </p>
                    <p>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </p>
                    <p>Not available</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </p>
                    <p>Not available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  User's account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      User ID
                    </p>
                    <p>{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Role
                    </p>
                    <p className="capitalize">{user.role || 'Customer'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Account Created
                    </p>
                    <p>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </p>
                    <p className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Points
                    </p>
                    <p className="flex items-center">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[#E6F7FA] text-[#0C99B4] mr-2">
                        {user.user_points || 0}
                      </span>
                      points
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit User
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                User's recent orders and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar size={48} />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Orders Found
                </h3>
                <p className="text-gray-500 max-w-md">
                  This user hasn't placed any orders yet. Orders will appear
                  here once they make a purchase.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                User's recent actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <RefreshCw size={48} />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Recent Activity
                </h3>
                <p className="text-gray-500 max-w-md">
                  There is no recent activity for this user. Activity logs will
                  appear here as the user interacts with the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
