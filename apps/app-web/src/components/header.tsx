'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CartDropdown } from '@/components/cart-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // This will be set to true only on the client side
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Promotions', href: '/promotions' },
    { label: 'Partners', href: '/partners' },
    { label: 'Membership', href: '/membership' },
    { label: 'Commission', href: '/commission' },
    { label: 'Rank & Rewards', href: '/rank-rewards' },
  ];

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="w-8"></div>
          <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
          <div className="w-8"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-20">
          <div className="flex items-center">
            <div className="pl-0 md:pl-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/freepik__background__83849 2.svg"
                  alt="GrabHealth AI Logo"
                  width={120}
                  height={50}
                  priority
                  className="h-10 md:h-12 w-auto"
                />
              </Link>
            </div>
          </div>

          {!isMobile ? (
            <>
              <nav className="hidden md:flex items-center space-x-6 mx-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-emerald-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                {!isLoading &&
                  (user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <User className="h-4 w-4" />
                          <span>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders">Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="text-red-500 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <Button variant="ghost" className="text-sm font-medium">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button
                          variant="outline"
                          className="text-sm font-medium border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                        >
                          Register
                        </Button>
                      </Link>
                    </>
                  ))}
                <CartDropdown />
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-1 md:space-x-2">
              <CartDropdown />
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-3 mt-6">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className="text-base font-medium text-gray-700 hover:text-emerald-500 transition-colors"
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                    <div className="h-px bg-gray-200 my-2"></div>
                    {!isLoading &&
                      (user ? (
                        <>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <SheetClose asChild>
                            <Link href="/profile">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-base font-medium"
                              >
                                Profile
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/orders">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-base font-medium"
                              >
                                Orders
                              </Button>
                            </Link>
                          </SheetClose>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-base font-medium text-red-500 border-red-200 hover:bg-red-50 mt-2"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild>
                            <Link href="/auth/login">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-base font-medium"
                              >
                                Login
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/auth/register">
                              <Button
                                variant="outline"
                                className="w-full justify-start text-base font-medium border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                              >
                                Register
                              </Button>
                            </Link>
                          </SheetClose>
                        </>
                      ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
