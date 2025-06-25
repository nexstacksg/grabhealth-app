'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export default function PartnerHeader() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Return a consistent structure during SSR and initial client render
  if (!isMounted) {
    return (
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 md:h-14">
            <div className="flex items-center">
              <div className="pl-0 md:pl-4">
                <Link href="/partner" className="flex items-center">
                  <Image
                    src="/freepik__background__83849 2.svg"
                    alt="GrabHealth AI Logo"
                    width={100}
                    height={40}
                    priority
                    className="h-8 md:h-10 w-auto"
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 md:h-14">
          <div className="flex items-center">
            <div className="pl-0 md:pl-4">
              <Link href="/partner" className="flex items-center">
                <Image
                  src="/freepik__background__83849 2.svg"
                  alt="GrabHealth AI Logo"
                  width={100}
                  height={40}
                  priority
                  className="h-8 md:h-10 w-auto"
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {isMounted && !isLoading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {user.firstName || user.email.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium text-sm">
                      {user.firstName || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    {user.partner && (
                      <p className="text-xs text-emerald-600 font-medium">
                        {user.partner.name}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/partner/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" className="text-sm font-medium">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
