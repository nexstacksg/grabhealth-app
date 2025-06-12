"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, ChevronRight, Users, User, Network, ArrowLeft, ArrowRight } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NetworkUser {
  id: number
  name: string
  email: string
  role: string
  parent_id: number | null
  level: number
  downline_count: number
}

// Helper function to render downline members with pagination
function renderDownlineMembers(users: NetworkUser[], page: number, setPage: (page: number) => void) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No members found</p>
      </div>
    );
  }
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
    <div>
      <div className="table-container" style={{ width: '100%', overflowX: 'auto', display: 'block', position: 'relative', maxWidth: 'calc(100vw - 32px)' }}>
        <Table className="text-sm" style={{ minWidth: '450px', width: '100%' }}>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2 px-3 bg-gray-50 font-medium">Name</TableHead>
              <TableHead className="py-2 px-3 bg-gray-50 font-medium">Email</TableHead>
              <TableHead className="py-2 px-3 bg-gray-50 font-medium">Role</TableHead>
              <TableHead className="py-2 px-3 bg-gray-50 font-medium">Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="py-2 px-3 align-middle">
                  <div className="font-medium">{user.name}</div>
                </TableCell>
                <TableCell className="py-2 px-3 align-middle">{user.email}</TableCell>
                <TableCell className="py-2 px-3 align-middle capitalize">{user.role}</TableCell>
                <TableCell className="py-2 px-3 align-middle">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Level {user.level}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {users.length > itemsPerPage && (
        <div className="p-2 border-t bg-gray-50 flex justify-between items-center text-sm">
          <div className="text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} members
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NetworksPage() {
  const [networks, setNetworks] = useState<NetworkUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null)
  const [downlineUsers, setDownlineUsers] = useState<NetworkUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [allMembersPage, setAllMembersPage] = useState(1)
  const [level1Page, setLevel1Page] = useState(1)
  const [level2Page, setLevel2Page] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNetworks()
  }, [])

  async function fetchNetworks() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/networks")
      
      if (!response.ok) {
        throw new Error("Failed to fetch networks")
      }
      
      const data = await response.json()
      setNetworks(data.networks)
    } catch (error) {
      console.error("Error fetching networks:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate pagination for networks
  const totalPages = Math.ceil(networks.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = networks.slice(indexOfFirstItem, indexOfLastItem)
  
  // Handle page change
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  
  // Reset tab pages when selecting a new user
  const resetTabPages = () => {
    setAllMembersPage(1)
    setLevel1Page(1)
    setLevel2Page(1)
  }
  
  async function fetchUserDownline(userId: number) {
    try {
      const response = await fetch(`/api/admin/networks/${userId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch user downline")
      }
      
      const data = await response.json()
      setDownlineUsers(data.downline || [])
      resetTabPages() // Reset all tab pages when loading new downline
      
      // Find and set the selected user
      const user = networks.find(u => u.id === userId) || null
      setSelectedUser(user)
    } catch (error) {
      console.error("Error fetching user downline:", error)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 search-filter-container p-3">
        <h1 className="text-2xl font-bold">Network Structure</h1>
        <Button
          onClick={fetchNetworks}
          variant="outline"
          className="flex items-center w-full sm:w-auto"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm font-medium">Network Leaders</CardTitle>
          </CardHeader>
          <CardContent className="card-content-fix">
              <div className="table-container" style={{ width: '100%', overflowX: 'auto', display: 'block', position: 'relative', maxWidth: 'calc(100vw - 32px)' }}>
                <Table className="text-sm" style={{ minWidth: '450px', width: '100%' }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2 px-3 bg-gray-50 font-medium">ID</TableHead>
                      <TableHead className="py-2 px-3 bg-gray-50 font-medium">Name</TableHead>
                      <TableHead className="py-2 px-3 bg-gray-50 font-medium">Email</TableHead>
                      <TableHead className="py-2 px-3 bg-gray-50 font-medium">Role</TableHead>
                      <TableHead className="py-2 px-3 bg-gray-50 font-medium">Downline</TableHead>
                      <TableHead className="py-2 px-3 bg-gray-50 font-medium">Actions</TableHead>
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
                    ) : networks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500 text-sm">
                          No network leaders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((user) => (
                        <TableRow key={user.id} className={selectedUser?.id === user.id ? "bg-emerald-50" : "hover:bg-gray-50"}>
                          <TableCell className="py-2 px-3 align-middle">{user.id}</TableCell>
                          <TableCell className="py-2 px-3 align-middle">
                            <div>
                              <div className="font-medium">{user.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3 align-middle">{user.email}</TableCell>
                          <TableCell className="py-2 px-3 align-middle">{user.role}</TableCell>
                          <TableCell className="py-2 px-3 align-middle">{user.downline_count}</TableCell>
                          <TableCell className="py-2 px-3 align-middle">
                            <Button
                              onClick={() => fetchUserDownline(user.id)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-sm px-3 py-0 rounded-md w-full sm:w-auto"
                            >
                              View Downline
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination for networks */}
                {!loading && networks.length > 0 && (
                  <div className="py-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => paginate(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {/* First page */}
                        {currentPage > 2 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => paginate(1)}>1</PaginationLink>
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
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        {selectedUser && (
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle>
                  {selectedUser.name}'s Network
                </CardTitle>
                <CardDescription className="mt-1">
                  {selectedUser.downline_count} total members in network
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-2 sm:space-y-0 search-filter-container w-full sm:w-auto p-3">
                <Input 
                  placeholder="Search members..." 
                  className="w-full sm:max-w-[200px] h-8 text-sm" 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const term = e.target.value.toLowerCase();
                    if (term === "") {
                      // Reset to original data
                      if (selectedUser) fetchUserDownline(selectedUser.id);
                    } else {
                      // Filter existing data
                      const filtered = downlineUsers.filter(user => 
                        user.name.toLowerCase().includes(term) || 
                        user.email.toLowerCase().includes(term)
                      );
                      setDownlineUsers(filtered);
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-full sm:w-auto"
                  onClick={() => {
                    if (selectedUser) {
                      setSearchTerm("");
                      fetchUserDownline(selectedUser.id);
                    }
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0C99B4] flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-base">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="mr-0 sm:mr-4">
                      <span className="text-xs text-gray-500">Role</span>
                      <p className="font-medium capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Network Size</span>
                      <p className="font-medium">{selectedUser.downline_count}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 w-full flex flex-wrap gap-1">
                      <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm px-2 py-1">All Members</TabsTrigger>
                      <TabsTrigger value="level1" className="flex-1 text-xs sm:text-sm px-2 py-1">Level 1</TabsTrigger>
                      <TabsTrigger value="level2" className="flex-1 text-xs sm:text-sm px-2 py-1">Level 2+</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="mt-0">
                      {renderDownlineMembers(downlineUsers, allMembersPage, setAllMembersPage)}
                    </TabsContent>
                    
                    <TabsContent value="level1" className="mt-0">
                      {renderDownlineMembers(downlineUsers.filter(user => user.level === 1), level1Page, setLevel1Page)}
                    </TabsContent>
                    
                    <TabsContent value="level2" className="mt-0">
                      {renderDownlineMembers(downlineUsers.filter(user => user.level > 1), level2Page, setLevel2Page)}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
