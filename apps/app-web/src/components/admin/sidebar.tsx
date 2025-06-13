'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Network,
  ClipboardList,
  Settings,
  Home,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

type SubMenuItem = {
  title: string;
  href: string;
  exactPath?: boolean;
};

type NavItem = {
  title: string;
  href: string;
  icon: any;
  submenu?: SubMenuItem[];
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Users Management',
    href: '/admin/users',
    icon: Users,
    submenu: [
      {
        title: 'All Users',
        href: '/admin/users',
        exactPath: true,
      },
      {
        title: 'Account Requests',
        href: '/admin/users/requests',
      },
    ],
  },
  {
    title: 'Networks',
    href: '/admin/networks',
    icon: Network,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

export function Sidebar({
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Check if a submenu item is active
  const isSubmenuItemActive = (submenuItems: SubMenuItem[]) => {
    return submenuItems.some((subitem) => {
      return (
        pathname === subitem.href || pathname?.startsWith(`${subitem.href}/`)
      );
    });
  };

  // Auto-open submenu for active items on initial load
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.submenu && isSubmenuItemActive(item.submenu)) {
        setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
      }
    });
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path: string, exactPath = false) => {
    // For the dashboard or items marked with exactPath, only exact match should be active
    if (path === '/admin' || exactPath) {
      return pathname === path;
    }

    // For regular items, check exact match or if it's a child path
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Determine if a parent menu item should be highlighted
  const isParentActive = (item: NavItem) => {
    // If it has submenu, it's active if any child is active
    if (item.submenu) {
      return isSubmenuItemActive(item.submenu);
    }
    // Otherwise use regular isActive logic
    return isActive(item.href);
  };

  return (
    <div className="h-full">
      {/* Mobile menu toggle button - only visible on small screens */}
      <button
        onClick={() => {
          const toggleMobileMenu = () => {
            if (setIsMobileMenuOpen) {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }
          };
          toggleMobileMenu();
        }}
        className="md:hidden fixed top-3 left-3 z-[100] bg-[#0A87A0] text-white p-2 rounded-md shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar container with improved styling */}
      <div
        className={`h-full w-full text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo/Header area */}
        <div className="p-4 border-b border-[#0C99B4]/50 bg-[#097A8F] flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-wide">
            GrabHealth Admin
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
            className="md:hidden text-[#B3E8F3] hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.title}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`flex items-center w-full px-3 py-2.5 rounded-md text-left text-sm transition-all ${
                        isParentActive(item)
                          ? 'bg-white text-[#0C99B4] font-medium shadow-sm'
                          : 'text-white hover:bg-[#0A87A0] hover:text-white hover:translate-x-1'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="ml-auto">
                        {openMenus[item.title] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    </button>

                    {openMenus[item.title] && (
                      <ul className="mt-1 pl-4 space-y-1">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.title}>
                            <Link
                              href={subitem.href}
                              onClick={() =>
                                setIsMobileMenuOpen &&
                                setIsMobileMenuOpen(false)
                              }
                              className={`flex items-center px-3 py-2 text-sm rounded-md transition-all ${
                                isActive(subitem.href, subitem.exactPath)
                                  ? 'bg-[#E6F7FA] text-[#0C99B4] font-medium shadow-sm translate-x-1'
                                  : 'text-[#E6F7FA] hover:bg-[#0A87A0]/40 hover:text-white hover:translate-x-1'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                              <span>{subitem.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() =>
                      setIsMobileMenuOpen && setIsMobileMenuOpen(false)
                    }
                    className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-all ${
                      isParentActive(item)
                        ? 'bg-white text-[#0C99B4] font-medium shadow-sm'
                        : 'text-white hover:bg-[#0A87A0] hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
