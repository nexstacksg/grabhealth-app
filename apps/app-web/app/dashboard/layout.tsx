import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "GrabHealth AI - Admin Dashboard",
  description: "Admin dashboard for GrabHealth AI platform",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">GrabHealth AI Admin</h1>
        </div>
      </div>
      {children}
    </div>
  )
}
