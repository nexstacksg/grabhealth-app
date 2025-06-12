"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, ZoomIn, ZoomOut, Users, Network, Share2 } from "lucide-react"
import { useCommission } from "@/components/commission/commission-provider"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RankVisualization() {
  const { upline, downlines, isLoading, error } = useCommission()
  const [viewMode, setViewMode] = useState("tree")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [activeTab, setActiveTab] = useState("network")
  const canvasRef = useRef<HTMLDivElement>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  
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
  
  // Network stats summary
  const networkStats = {
    totalMembers: 8,
    directReferrals: 3,
    indirectReferrals: 4,
    totalSales: "$12,650",
    teamSales: "$5,450",
    commissionEarned: "$1,875"
  }
  
  // Mock data for visualization
  const networkData = {
    currentUser: { id: 1, name: "You", rank: "Gold", sales: "$2,450" },
    uplineMembers: [
      { id: 2, name: "Alice Johnson", rank: "Platinum", sales: "$5,200" }
    ],
    downlineMembers: [
      { id: 3, name: "Bob Smith", rank: "Silver", sales: "$1,800" },
      { id: 4, name: "Carol Davis", rank: "Bronze", sales: "$950" },
      { id: 5, name: "Dave Wilson", rank: "Silver", sales: "$1,650" },
      { id: 6, name: "Eve Brown", rank: "Bronze", sales: "$750" },
      { id: 7, name: "Frank Miller", rank: "Bronze", sales: "$500" },
      { id: 8, name: "Grace Lee", rank: "Bronze", sales: "$350" }
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
                  <p className="text-xs text-muted-foreground">{member.rank}</p>
                </div>
                <div className="h-8 w-px bg-gray-300 my-2"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Current User */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2 border-4 border-primary-foreground">
            {networkData.currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-center">
            <p className="font-semibold">{networkData.currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{networkData.currentUser.rank}</p>
          </div>
          <div className="h-8 w-px bg-gray-300 my-2"></div>
        </div>
        
        {/* First level downlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {networkData.downlineMembers.slice(0, 3).map(member => (
            <div key={member.id} className="flex flex-col items-center">
              <div className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-center">
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.rank}</p>
              </div>
              
              {/* Second level for first member only */}
              {member.id === 3 && (
                <>
                  <div className="h-8 w-px bg-gray-300 my-2"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {networkData.downlineMembers.slice(3).map(subMember => (
                      <div key={subMember.id} className="flex flex-col items-center">
                        <div className={`w-12 h-12 ${getRankColor(subMember.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                          {subMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold">{subMember.name}</p>
                          <p className="text-xs text-muted-foreground">{subMember.rank}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // Generate radial view HTML
  const renderRadialView = () => {
    // Calculate positions in a circle
    const calculatePosition = (index: number, total: number, radius: number) => {
      const angle = (index / total) * 2 * Math.PI
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      return { x, y }
    }
    
    const centerX = windowWidth > 768 ? 250 : 150
    const centerY = 250
    const radius = windowWidth > 768 ? 150 : 100
    
    return (
      <div className="relative h-[500px] w-full overflow-auto" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}>
        {/* Current User at center */}
        <div 
          className="absolute flex flex-col items-center"
          style={{ left: `${centerX}px`, top: `${centerY}px`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2 border-4 border-primary-foreground">
            {networkData.currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="text-center whitespace-nowrap">
            <p className="font-semibold">{networkData.currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{networkData.currentUser.rank}</p>
          </div>
        </div>
        
        {/* Upline above */}
        {networkData.uplineMembers.map((member, index) => {
          const position = { x: centerX, y: centerY - 120 }
          
          return (
            <React.Fragment key={member.id}>
              {/* Connection line */}
              <div 
                className="absolute bg-gray-300" 
                style={{
                  left: `${centerX}px`,
                  top: `${centerY}px`,
                  width: '2px',
                  height: '120px',
                  transform: 'translateX(-50%) translateY(-100%)'
                }}
              ></div>
              
              {/* Member node */}
              <div 
                className="absolute flex flex-col items-center"
                style={{ left: `${position.x}px`, top: `${position.y}px`, transform: 'translate(-50%, -50%)' }}
              >
                <div className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center whitespace-nowrap">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.rank}</p>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        
        {/* Downlines in a circle */}
        {networkData.downlineMembers.map((member, index) => {
          const position = calculatePosition(
            index, 
            networkData.downlineMembers.length,
            radius
          )
          
          return (
            <React.Fragment key={member.id}>
              {/* Connection line */}
              <div 
                className="absolute bg-gray-300" 
                style={{
                  left: `${centerX}px`,
                  top: `${centerY}px`,
                  width: '2px',
                  height: `${Math.sqrt(position.x * position.x + position.y * position.y)}px`,
                  transform: `translateX(-50%) rotate(${Math.atan2(position.y, position.x) + (position.x < 0 ? Math.PI : 0)}rad)`,
                  transformOrigin: 'top'
                }}
              ></div>
              
              {/* Member node */}
              <div 
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${centerX + position.x}px`, 
                  top: `${centerY + position.y}px`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                <div className={`w-16 h-16 ${getRankColor(member.rank)} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center whitespace-nowrap">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.rank}</p>
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    )
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div>
            <CardTitle className="text-sm font-medium">Your Network</CardTitle>
            <CardDescription className="text-xs text-gray-500">View and manage your referral network</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-sm">
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Invite
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2">
            <TabsList className="h-8 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
              <TabsTrigger value="network" className="text-sm px-3 h-7">
                <Network className="h-3.5 w-3.5 mr-1.5" /> Network
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-sm px-3 h-7">
                <Users className="h-3.5 w-3.5 mr-1.5" /> Team Stats
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="network" className="m-0">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue placeholder="View Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tree">Tree View</SelectItem>
                    <SelectItem value="radial">Radial View</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut}>
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn}>
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 mr-2">
                  {[
                    { color: "blue-500", label: "Platinum" },
                    { color: "yellow-500", label: "Gold" },
                    { color: "slate-400", label: "Silver" },
                    { color: "amber-700", label: "Bronze" }
                  ].map((rank) => (
                    <div key={rank.label} className="flex items-center gap-1">
                      <div className={`w-2 h-2 bg-${rank.color} rounded-full`}></div>
                      <span className="text-xs text-muted-foreground">{rank.label}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="border-b border-border/50 p-3 overflow-auto h-[350px]" ref={canvasRef}>
              {viewMode === "tree" ? renderTreeView() : renderRadialView()}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="m-0">
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">Total Members</span>
                  </div>
                  <p className="text-xl font-bold mt-1 text-primary">{networkStats.totalMembers}</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium">Direct Referrals</span>
                  </div>
                  <p className="text-xl font-bold mt-1 text-blue-600">{networkStats.directReferrals}</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center space-x-1.5">
                    <Network className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-xs font-medium">Indirect Referrals</span>
                  </div>
                  <p className="text-xl font-bold mt-1 text-indigo-600">{networkStats.indirectReferrals}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Sales & Commissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-xs">Your Sales</span>
                    <span className="text-sm font-medium">{networkStats.totalSales}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-xs">Team Sales</span>
                    <span className="text-sm font-medium">{networkStats.teamSales}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-xs">Commissions</span>
                    <span className="text-sm font-medium text-[#0C99B4]">{networkStats.commissionEarned}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <Download className="h-3 w-3 mr-1.5" /> Download Full Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
