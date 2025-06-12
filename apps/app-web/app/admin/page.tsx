"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Users } from "lucide-react"
import { User } from "@/types/user"

interface DashboardStats {
  totalUsers: number
  pendingRequests: number
  usersByRole: Record<string, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingRequests: 0,
    usersByRole: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch("/api/admin/dashboard/stats")
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-gray-700">Dashboard Overview</h2>
      
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse shadow-sm">
              <CardHeader className="py-2 px-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="py-2 px-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Card className="shadow-sm overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="py-2 px-3 bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                <Users className="w-3 h-3 mr-1 text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-medium">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">Active accounts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm overflow-hidden border-l-4 border-l-amber-500">
            <CardHeader className="py-2 px-3 bg-gradient-to-r from-amber-50 to-white">
              <CardTitle className="text-sm font-medium text-amber-800 flex items-center">
                <RefreshCw className="w-3 h-3 mr-1 text-amber-600" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <RefreshCw className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-base font-medium">{stats.pendingRequests}</p>
                <p className="text-sm text-gray-500">Awaiting approval</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
            <CardHeader className="py-2 px-3 bg-gradient-to-r from-emerald-50 to-white">
              <CardTitle className="text-sm font-medium text-emerald-800 flex items-center">
                <Users className="w-3 h-3 mr-1 text-emerald-600" />
                User Networks
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-medium">{stats.usersByRole.leader || 0}</p>
                <p className="text-sm text-gray-500">Leader Networks</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center">
              <Users className="w-3 h-3 mr-1 text-emerald-600" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.usersByRole).map(([role, count]) => {
                  // Determine color based on role
                  let colorClass = "";
                  switch(role) {
                    case "admin": colorClass = "text-purple-500"; break;
                    case "customer": colorClass = "text-blue-500"; break;
                    case "leader": colorClass = "text-emerald-500"; break;
                    case "sales": colorClass = "text-amber-500"; break;
                    case "manager": colorClass = "text-indigo-500"; break;
                    case "company": colorClass = "text-rose-500"; break;
                    default: colorClass = "text-gray-500";
                  }
                  
                  return (
                    <div key={role} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <div className="capitalize text-sm font-medium">{role}</div>
                      <div className={`font-medium text-sm ${colorClass}`}>{count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
              <RefreshCw className="w-3 h-3 mr-1 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-3">
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2 animate-pulse">
                    <div className="w-2 h-2 mt-1 rounded-full bg-gray-200"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-1 rounded-full bg-green-500"></div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm">New user registration</p>
                      <p className="text-xs text-gray-500">Today, 10:45 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-1 rounded-full bg-amber-500"></div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm">Account request pending</p>
                      <p className="text-xs text-gray-500">Today, 09:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-1 rounded-full bg-blue-500"></div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm">Network leader added</p>
                      <p className="text-xs text-gray-500">Yesterday, 4:15 PM</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
