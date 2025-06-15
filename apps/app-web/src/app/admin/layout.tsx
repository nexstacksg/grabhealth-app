'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IUserPublic } from '@app/shared-types';
import { Sidebar } from '@/components/admin/sidebar';
import authService from '@/services/auth.service';
import { Menu, X } from 'lucide-react';
import './styles/admin-styles.css';
import './styles/mobile-table.css';
import './styles/force-table.css';
import './styles/direct-fix.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    async function checkAdmin() {
      try {
        const userData = await authService.getProfile();

        // Check if we have a user and if they have admin role

        if (!userData || userData.role !== 'SUPER_ADMIN') {
          console.log('Not an admin user:', userData);
          // Not an admin, redirect to home
          router.push('/');
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout bg-gray-50">
      {/* Sidebar component with fixed positioning */}
      <div
        className={`admin-sidebar bg-[#0C99B4] ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      {/* Mobile menu toggle button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-3 left-3 z-[101] bg-[#0A87A0] text-white p-2 rounded-md shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main content area - separate from sidebar for mobile */}
      <div className="admin-content">
        {/* Header - visible on all screen sizes */}
        <header className="admin-header">
          <h1 className="text-lg font-medium text-gray-800 ml-10 md:ml-0">
            Admin Dashboard
          </h1>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#E6F7FA] text-[#0C99B4] flex items-center justify-center font-medium">
                  {(user.firstName || user.email)?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await authService.logout();
                    // Redirect to homepage after successful logout
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        {/* Main content with proper padding and scrolling */}
        <main className="admin-main">
          <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
