"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, ZoomIn, ZoomOut, ArrowUpRight, ArrowDownRight, User, ChevronUp, ChevronDown, QrCode, Link } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ReferralLink from "./referral-link"
import { useCommission } from "./commission-provider"
// Authentication is now handled at the page level

type UserRelationship = {
  id: number
  user_id: number
  upline_id: number | null
  relationship_level: number
  created_at: string
  updated_at: string
  user_name?: string
}

type CommissionNetworkProps = {
  upline: UserRelationship | null
  downlines: UserRelationship[]
}

function CommissionNetwork({ upline, downlines }: CommissionNetworkProps) {
  const [viewMode, setViewMode] = useState("tree")
  const [zoomLevel, setZoomLevel] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const [expandedMembers, setExpandedMembers] = useState<{[key: string]: boolean}>({})
  const [showQRCode, setShowQRCode] = useState(false)
  const { referralLink } = useCommission()
  
  // Update window width on resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    // Set initial width
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const zoomIn = () => {
    if (zoomLevel < 1.5) {
      setZoomLevel(prev => prev + 0.1)
    }
  }
  
  const zoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prev => prev - 0.1)
    }
  }
  
  // Sample data for the network visualization
  const networkData = {
    currentUser: {
      id: 1,
      name: "You",
      rank: "Gold Partner",
      sales: "$5,200",
      referralLink: "https://grabhealth.com/register?ref=user1"
    },
    uplineMembers: upline ? [
      { id: upline.upline_id || 0, name: upline.user_name || "Upline Member", rank: "Platinum", sales: "$5,200" }
    ] : [],
    downlineMembers: downlines.map(d => ({
      id: d.user_id,
      name: d.user_name || `Member #${d.user_id}`,
      rank: "Silver",
      sales: "$1,800"
    })) || [
      { id: 3, name: "Team Member 1", rank: "Silver", sales: "$1,800" },
      { id: 4, name: "Team Member 2", rank: "Bronze", sales: "$950" },
      { id: 5, name: "Team Member 3", rank: "Silver", sales: "$1,650" }
    ]
  }
  
  // Determine node colors based on rank
  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'platinum': return 'bg-blue-500'
      case 'gold': return 'bg-yellow-500'
      case 'silver': return 'bg-slate-400'
      case 'bronze': return 'bg-amber-700'
      default: return 'bg-gray-500'
    }
  }
  
  // Generate tree view HTML
  const renderTreeView = () => {
    return (
      <div className="flex flex-col items-center overflow-auto py-8" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
        {/* Upline */}
        {networkData.uplineMembers.length > 0 && (
          <div className="mb-8">
            {networkData.uplineMembers.map(member => (
              <div key={member.id} className="flex flex-col items-center">
                <div className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="outline" className="mt-1">{member.rank}</Badge>
                </div>
                <ArrowDownRight className="h-10 w-10 text-gray-400 my-4" />
              </div>
            ))}
          </div>
        )}
        
        {/* Current User */}
        <div className="mb-8">
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 ${getRankColor(networkData.currentUser.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2 border-2 border-white shadow-lg`}>
              {networkData.currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-center">
              <p className="font-semibold">{networkData.currentUser.name}</p>
              <Badge variant="outline" className="mt-1">{networkData.currentUser.rank}</Badge>
              <p className="text-sm text-gray-500 mt-1">Sales: {networkData.currentUser.sales}</p>
            </div>
            {networkData.downlineMembers.length > 0 && (
              <ArrowDownRight className="h-10 w-10 text-gray-400 my-4" />
            )}
          </div>
        </div>
        
        {/* Downlines */}
        {networkData.downlineMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {networkData.downlineMembers.map(member => (
              <div key={member.id} className="flex flex-col items-center">
                <div className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="outline" className="mt-1">{member.rank}</Badge>
                  <p className="text-sm text-gray-500 mt-1">Sales: {member.sales}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Generate list view HTML
  const renderListView = () => {
    const toggleMember = (id: number | string) => {
      setExpandedMembers(prev => ({
        ...prev,
        [id]: !prev[id]
      }))
    }
    
    return (
      <div className="space-y-4">
        {/* Upline */}
        {networkData.uplineMembers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Your Upline
            </h3>
            {networkData.uplineMembers.map(member => (
              <div key={member.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline" className="mt-1">{member.rank}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleMember(member.id)}>
                    {expandedMembers[member.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                      <span>12 members</span>
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
                <div className={`w-10 h-10 ${getRankColor(networkData.currentUser.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                  {networkData.currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{networkData.currentUser.name}</p>
                  <Badge variant="outline" className="mt-1">{networkData.currentUser.rank}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
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
            {networkData.downlineMembers.map(member => (
              <div key={member.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline" className="mt-1">{member.rank}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleMember(member.id)}>
                    {expandedMembers[member.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                      <span>3 months ago</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Generate radial view HTML
  const renderRadialView = () => {
    // Calculate positions in a circle
    const calculatePosition = (index: number, total: number, radius: number) => {
      const angle = (index / total) * Math.PI * 2
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      
      return { x, y }
    }
    
    const centerX = 300
    const centerY = 300
    const radius = 150
    
    return (
      <div className="relative w-[600px] h-[600px] mx-auto" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}>
        {/* Current User (Center) */}
        <div className="absolute" style={{ left: centerX - 30, top: centerY - 30 }}>
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 ${getRankColor(networkData.currentUser.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2 border-2 border-white shadow-lg`}>
              {networkData.currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-center">
              <p className="font-semibold">{networkData.currentUser.name}</p>
              <Badge variant="outline" className="mt-1">{networkData.currentUser.rank}</Badge>
            </div>
          </div>
        </div>
        
        {/* Upline */}
        {networkData.uplineMembers.map((member, index) => {
          const position = calculatePosition(0, 1, radius)
          
          return (
            <div key={member.id} className="absolute" style={{ left: centerX + position.x - 20, top: centerY + position.y - 20 }}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-1`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{member.name}</p>
                  <Badge variant="outline" className="text-xs px-1">{member.rank}</Badge>
                </div>
              </div>
              
              {/* Line connecting to center */}
              <svg className="absolute top-0 left-0 -z-10" width="600" height="600" style={{ transform: `translate(${-centerX + position.x + 5}px, ${-centerY + position.y + 5}px)` }}>
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
          )
        })}
        
        {/* Downlines */}
        {networkData.downlineMembers.map((member, index) => {
          const position = calculatePosition(
            index, 
            networkData.downlineMembers.length, 
            radius
          )
          
          // Skip the position reserved for upline if there is one
          const adjustedPosition = networkData.uplineMembers.length > 0 && index === 0 
            ? calculatePosition(0.2, networkData.downlineMembers.length, radius)
            : position
          
          return (
            <div key={member.id} className="absolute" style={{ left: centerX + adjustedPosition.x - 20, top: centerY + adjustedPosition.y - 20 }}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-1`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{member.name}</p>
                  <Badge variant="outline" className="text-xs px-1">{member.rank}</Badge>
                </div>
              </div>
              
              {/* Line connecting to center */}
              <svg className="absolute top-0 left-0 -z-10" width="600" height="600" style={{ transform: `translate(${-centerX + adjustedPosition.x + 5}px, ${-centerY + adjustedPosition.y + 5}px)` }}>
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
          )
        })}
      </div>
    )
  }
  
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
            {viewMode === "tree" ? renderTreeView() : viewMode === "radial" ? renderRadialView() : renderListView()}
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
              <h4 className="font-semibold text-blue-700">Tier 1 (Direct Sales)</h4>
              <p className="text-sm">30% commission on all direct sales you make to customers.</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700">Tier 2 (Indirect Sales)</h4>
              <p className="text-sm">10% commission on all sales made by your direct recruits (Tier 2 members).</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700">Tier 3+ (Deep Network)</h4>
              <p className="text-sm">5% commission on deeper tiers (3, 4, etc.) with decreasing percentages for deeper levels.</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-700">Points System</h4>
              <p className="text-sm">Earn points based on your network's performance. Points can be redeemed for rewards.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    
    </div>
  )
}

// Export the component with authentication protection
// Export the component directly without authentication protection
export default CommissionNetwork
