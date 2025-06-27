'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  ZoomIn,
  ZoomOut,
  ArrowUpRight,
  ArrowDownRight,
  User,
  ChevronUp,
  ChevronDown,
  QrCode,
  Link,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import ReferralLink from './referral-link';
import { useCommission } from './commission-provider';
import { apiClient } from '@/services/api-client';
import { useAuth } from '@/contexts/AuthContext';
// Authentication is now handled at the page level

type UserRelationship = {
  id: number;
  user_id: number;
  upline_id: number | null;
  relationship_level: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  name?: string;
  email?: string;
  rank?: string;
  sales?: number;
  memberSince?: string;
};

type CommissionNetworkProps = {
  upline: UserRelationship | null;
  downlines: UserRelationship[];
};

function CommissionNetwork({ upline, downlines }: CommissionNetworkProps) {
  const [viewMode, setViewMode] = useState('tree');
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [expandedMembers, setExpandedMembers] = useState<{
    [key: string]: boolean;
  }>({});
  const [showQRCode, setShowQRCode] = useState(false);
  const { referralLink } = useCommission();
  const { user } = useAuth();
  const [memberDetails, setMemberDetails] = useState<{[key: string]: any}>({});
  const [commissionRates, setCommissionRates] = useState<{tier1: number; tier2: number; tier3: number}>({
    tier1: 30,
    tier2: 10,
    tier3: 5
  });
  const [currentUserSales, setCurrentUserSales] = useState<number>(0);
  const [currentUserRank, setCurrentUserRank] = useState<string>('Bronze');
  const [rankThresholds, setRankThresholds] = useState<{platinum: number; gold: number; silver: number}>({
    platinum: 10000,
    gold: 5000,
    silver: 2000
  });

  // Update window width on resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch member sales data when component mounts
  useEffect(() => {
    const fetchMemberSalesData = async () => {
      try {
        // Fetch sales data for all members in the network
        const memberIds = [...downlines.map(d => d.user_id), upline?.user_id].filter(Boolean);
        
        if (memberIds.length > 0) {
          // Fetch actual sales data for each member
          const salesData: {[key: string]: number} = {};
          
          // For now, skip fetching individual member sales to avoid server errors
          // This would need a custom Strapi endpoint to efficiently fetch sales for multiple users
          // Just use the sales data if it's already provided in the relationship data
          memberIds.forEach(memberId => {
            salesData[memberId || ''] = 0; // Default to 0
          });
          
          setMemberDetails(prev => ({ ...prev, ...salesData }));
        }
      } catch (error: any) {
        if (error?.status !== 404 && error?.status !== 403) {
          console.error('Error fetching member sales data:', error.message || error);
        }
      }
    };

    fetchMemberSalesData();
  }, [downlines, upline]);

  // Fetch commission rates from Strapi
  useEffect(() => {
    const fetchCommissionRates = async () => {
      try {
        const response = await apiClient.get<{ data: any[] }>('/commission-tiers?sort=tierLevel:asc');
        if (response.data && response.data.length > 0) {
          const rates: any = {};
          response.data.forEach((tier: any) => {
            const tierData = tier.attributes || tier;
            const level = tierData.tierLevel || tier.tierLevel;
            rates[`tier${level}`] = parseFloat(tierData.directCommissionRate || tier.directCommissionRate || 0);
          });
          setCommissionRates(prev => ({ ...prev, ...rates }));
        }
      } catch (error: any) {
        if (error?.status !== 404 && error?.status !== 403) {
          console.error('Error fetching commission rates:', error.message || error);
        }
      }
    };

    fetchCommissionRates();
  }, []);

  // Fetch current user's sales data
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      try {
        // Try to get user ID from auth context first
        let userId: string | null = user?.id || null;
        
        // If not in context, try to fetch from API
        if (!userId) {
          try {
            const userResponse = await apiClient.get<any>('/users/me');
            if (userResponse) {
              userId = userResponse.id;
              // Check if user has a rank field
              if (userResponse.rank) {
                setCurrentUserRank(userResponse.rank);
              }
            }
          } catch (error) {
            // If we can't get user info, use defaults
            console.log('Using default values - unable to fetch user info');
            return;
          }
        }

        // If we have a user ID, fetch their orders
        if (userId) {
          try {
            // Use proper Strapi filter syntax
            const ordersResponse = await apiClient.get<{ data: any[] }>(
              `/orders?filters[user][id][$eq]=${userId}&filters[status][$eq]=COMPLETED&populate=*`
            );
            
            if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
              // Calculate total sales from completed orders
              const totalSales = ordersResponse.data.reduce((sum, order) => {
                const orderData = order.attributes || order;
                return sum + parseFloat(orderData.totalAmount || orderData.total || 0);
              }, 0);
              
              setCurrentUserSales(totalSales);
              // Only update rank if not already set from user profile
              if (currentUserRank === 'Bronze') {
                setCurrentUserRank(determineRank(totalSales));
              }
            }
          } catch (orderError: any) {
            // Orders might not exist, which is fine
            if (orderError?.status !== 404) {
              console.log('Unable to fetch orders:', orderError.message);
            }
          }
        }
      } catch (error: any) {
        if (error?.status !== 404 && error?.status !== 403 && error?.status !== 500) {
          console.error('Error in fetchCurrentUserData:', error.message || error);
        }
        // Keep default values on error
      }
    };

    fetchCurrentUserData();
  }, [user]);

  // Fetch rank thresholds from Strapi
  useEffect(() => {
    const fetchRankThresholds = async () => {
      try {
        // Try to fetch user role types which might contain sales thresholds
        const response = await apiClient.get<{ data: any[] }>('/user-role-types?populate=*');
        if (response.data && response.data.length > 0) {
          // For now, use default thresholds since user-role-types doesn't have sales thresholds
          // You might need to add a new content type in Strapi for rank thresholds
          console.log('User role types fetched:', response.data.length);
        }
      } catch (error: any) {
        // Silently handle if endpoint doesn't exist or user doesn't have permission
        if (error?.status !== 404 && error?.status !== 403) {
          console.error('Error fetching role types:', error.message || error);
        }
        // Keep default thresholds
      }
    };

    fetchRankThresholds();
  }, []);

  const zoomIn = () => {
    if (zoomLevel < 1.5) {
      setZoomLevel((prev) => prev + 0.1);
    }
  };

  const zoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel((prev) => prev - 0.1);
    }
  };

  // Helper function to determine rank based on sales or level
  const determineRank = (sales?: number, level?: number): string => {
    if (sales !== undefined && sales !== null) {
      if (sales >= rankThresholds.platinum) return 'Platinum';
      if (sales >= rankThresholds.gold) return 'Gold';
      if (sales >= rankThresholds.silver) return 'Silver';
      return 'Bronze';
    }
    // Fallback based on relationship level
    if (level === 1) return 'Gold';
    if (level === 2) return 'Silver';
    return 'Bronze';
  };

  // Helper function to format sales amount
  const formatSales = (amount?: number): string => {
    if (!amount) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  // Process the actual data from Strapi
  const networkData = {
    currentUser: {
      id: 'current',
      name: 'You',
      rank: currentUserRank,
      sales: formatSales(currentUserSales),
      referralLink: referralLink,
    },
    uplineMembers: upline
      ? [
          {
            id: upline.id || upline.upline_id || 0,
            name: upline.name || upline.user_name || upline.email || 'Upline Member',
            rank: upline.rank || determineRank(upline.sales || memberDetails[upline.user_id] || 0, 0),
            sales: formatSales(upline.sales || memberDetails[upline.user_id] || 0),
          },
        ]
      : [],
    downlineMembers: downlines.map((d) => ({
      id: d.id || d.user_id,
      name: d.name || d.user_name || d.email || `Member #${d.user_id}`,
      rank: d.rank || determineRank(d.sales || memberDetails[d.user_id] || 0, d.relationship_level),
      sales: formatSales(d.sales || memberDetails[d.user_id] || 0),
      joinedDate: d.created_at,
      relationshipLevel: d.relationship_level,
    })),
  };

  // Determine node colors based on rank
  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'platinum':
        return 'bg-blue-500';
      case 'gold':
        return 'bg-yellow-500';
      case 'silver':
        return 'bg-slate-400';
      case 'bronze':
        return 'bg-amber-700';
      default:
        return 'bg-gray-500';
    }
  };

  // Generate tree view HTML
  const renderTreeView = () => {
    return (
      <div
        className="flex flex-col items-center overflow-auto py-8"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Upline */}
        {networkData.uplineMembers.length > 0 && (
          <div className="mb-8">
            {networkData.uplineMembers.map((member) => (
              <div key={member.id} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}
                >
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {member.rank}
                  </Badge>
                </div>
                <ArrowDownRight className="h-10 w-10 text-gray-400 my-4" />
              </div>
            ))}
          </div>
        )}

        {/* Current User */}
        <div className="mb-8">
          <div className="flex flex-col items-center">
            <div
              className={`w-20 h-20 ${getRankColor(networkData.currentUser.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2 border-2 border-white shadow-lg`}
            >
              {networkData.currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="text-center">
              <p className="font-semibold">{networkData.currentUser.name}</p>
              <Badge variant="outline" className="mt-1">
                {networkData.currentUser.rank}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                Sales: {networkData.currentUser.sales}
              </p>
            </div>
            {networkData.downlineMembers.length > 0 && (
              <ArrowDownRight className="h-10 w-10 text-gray-400 my-4" />
            )}
          </div>
        </div>

        {/* Downlines */}
        {networkData.downlineMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {networkData.downlineMembers.map((member) => (
              <div key={member.id} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}
                >
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {member.rank}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Sales: {member.sales}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Generate list view HTML
  const renderListView = () => {
    const toggleMember = (id: number | string) => {
      setExpandedMembers((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    return (
      <div className="space-y-4">
        {/* Upline */}
        {networkData.uplineMembers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Your Upline
            </h3>
            {networkData.uplineMembers.map((member) => (
              <div key={member.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold`}
                    >
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {member.rank}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMember(member.id)}
                  >
                    {expandedMembers[member.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedMembers[member.id] && (
                  <div className="mt-3 pt-3 border-t text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Sales Volume:</span>
                      <span>{member.sales}</span>
                    </p>
                    <p className="flex justify-between mt-1">
                      <span className="text-gray-500">Rank:</span>
                      <span>{member.rank}</span>
                    </p>
                    <p className="flex justify-between mt-1">
                      <span className="text-gray-500">Team Size:</span>
                      <span>{downlines.length} members</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Current User */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <User className="h-4 w-4 mr-1" />
            You
          </h3>
          <div className="border rounded-md p-3 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 ${getRankColor(networkData.currentUser.rank)} rounded-full flex items-center justify-center text-white font-bold`}
                >
                  {networkData.currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="font-medium">{networkData.currentUser.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {networkData.currentUser.rank}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Your Referral Link</DialogTitle>
                      <DialogDescription>
                        Share this link with potential team members
                      </DialogDescription>
                    </DialogHeader>
                    <ReferralLink referralLink={referralLink} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t text-sm">
              <p className="flex justify-between">
                <span className="text-gray-600">Sales Volume:</span>
                <span>{networkData.currentUser.sales}</span>
              </p>
              <p className="flex justify-between mt-1">
                <span className="text-gray-600">Team Size:</span>
                <span>{networkData.downlineMembers.length} direct members</span>
              </p>
            </div>
          </div>
        </div>

        {/* Downlines */}
        {networkData.downlineMembers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              Your Downlines ({networkData.downlineMembers.length})
            </h3>
            {networkData.downlineMembers.map((member) => (
              <div key={member.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold`}
                    >
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {member.rank}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMember(member.id)}
                  >
                    {expandedMembers[member.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedMembers[member.id] && (
                  <div className="mt-3 pt-3 border-t text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Sales Volume:</span>
                      <span>{member.sales}</span>
                    </p>
                    <p className="flex justify-between mt-1">
                      <span className="text-gray-500">Joined:</span>
                      <span>{member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : 'N/A'}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Generate radial view HTML
  const renderRadialView = () => {
    // Calculate positions in a circle
    const calculatePosition = (
      index: number,
      total: number,
      radius: number
    ) => {
      const angle = (index / total) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      return { x, y };
    };

    const centerX = 300;
    const centerY = 300;
    const radius = 150;

    return (
      <div
        className="relative w-[600px] h-[600px] mx-auto"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Current User (Center) */}
        <div
          className="absolute"
          style={{ left: centerX - 30, top: centerY - 30 }}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 ${getRankColor(networkData.currentUser.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2 border-2 border-white shadow-lg`}
            >
              {networkData.currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="text-center">
              <p className="font-semibold">{networkData.currentUser.name}</p>
              <Badge variant="outline" className="mt-1">
                {networkData.currentUser.rank}
              </Badge>
            </div>
          </div>
        </div>

        {/* Upline */}
        {networkData.uplineMembers.map((member, index) => {
          const position = calculatePosition(0, 1, radius);

          return (
            <div
              key={member.id}
              className="absolute"
              style={{
                left: centerX + position.x - 20,
                top: centerY + position.y - 20,
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-1`}
                >
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{member.name}</p>
                  <Badge variant="outline" className="text-xs px-1">
                    {member.rank}
                  </Badge>
                </div>
              </div>

              {/* Line connecting to center */}
              <svg
                className="absolute top-0 left-0 -z-10"
                width="600"
                height="600"
                style={{
                  transform: `translate(${-centerX + position.x + 5}px, ${-centerY + position.y + 5}px)`,
                }}
              >
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + position.x + 5}
                  y2={centerY + position.y + 5}
                  stroke="#CBD5E1"
                  strokeWidth="2"
                />
              </svg>
            </div>
          );
        })}

        {/* Downlines */}
        {networkData.downlineMembers.map((member, index) => {
          const position = calculatePosition(
            index,
            networkData.downlineMembers.length,
            radius
          );

          // Skip the position reserved for upline if there is one
          const adjustedPosition =
            networkData.uplineMembers.length > 0 && index === 0
              ? calculatePosition(
                  0.2,
                  networkData.downlineMembers.length,
                  radius
                )
              : position;

          return (
            <div
              key={member.id}
              className="absolute"
              style={{
                left: centerX + adjustedPosition.x - 20,
                top: centerY + adjustedPosition.y - 20,
              }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-1`}
                >
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{member.name}</p>
                  <Badge variant="outline" className="text-xs px-1">
                    {member.rank}
                  </Badge>
                </div>
              </div>

              {/* Line connecting to center */}
              <svg
                className="absolute top-0 left-0 -z-10"
                width="600"
                height="600"
                style={{
                  transform: `translate(${-centerX + adjustedPosition.x + 5}px, ${-centerY + adjustedPosition.y + 5}px)`,
                }}
              >
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + adjustedPosition.x + 5}
                  y2={centerY + adjustedPosition.y + 5}
                  stroke="#CBD5E1"
                  strokeWidth="2"
                />
              </svg>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle className="py-2">Your Network</CardTitle>
            <CardDescription>
              Visualize your commission network structure
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[140px] md:w-[120px]">
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="tree">Tree View</SelectItem>
                <SelectItem value="radial">Radial View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-b pb-2 mb-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <button
                className={`pb-2 px-2 font-medium text-sm ${viewMode === 'list' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
              <button
                className={`pb-2 px-2 font-medium text-sm ${viewMode === 'tree' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('tree')}
              >
                Tree View
              </button>
              <button
                className={`pb-2 px-2 font-medium text-sm ${viewMode === 'radial' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setViewMode('radial')}
              >
                Radial View
              </button>
            </div>
          </div>
          <div className="border rounded-md p-4 overflow-auto" ref={canvasRef}>
            {viewMode === 'tree'
              ? renderTreeView()
              : viewMode === 'radial'
                ? renderRadialView()
                : renderListView()}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Platinum</span>
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Gold</span>
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                <span className="text-sm">Silver</span>
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-amber-700 rounded-full"></div>
                <span className="text-sm">Bronze</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>
            How the multi-level commission system works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-700">
                Tier 1 (Direct Sales)
              </h4>
              <p className="text-sm">
                {commissionRates.tier1}% commission on all direct sales you make to customers.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700">
                Tier 2 (Indirect Sales)
              </h4>
              <p className="text-sm">
                {commissionRates.tier2}% commission on all sales made by your direct recruits (Tier 2
                members).
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700">
                Tier 3+ (Deep Network)
              </h4>
              <p className="text-sm">
                {commissionRates.tier3}% commission on deeper tiers (3, 4, etc.) with decreasing
                percentages for deeper levels.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-700">Network Growth</h4>
              <p className="text-sm">
                Build your network by recruiting new members. Your earnings grow as your network expands.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export the component with authentication protection
// Export the component directly without authentication protection
export default CommissionNetwork;
