'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TourTrigger } from '@/components/GuidedTour';
import { Home, Calendar, Bookmark, LogOut, User } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Planner', href: '/planner', icon: Calendar },
  { name: 'Saved Meals', href: '/saved', icon: Bookmark },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav
      className="bg-background border-b border-border shadow-sm"
      data-tour="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Superhuman Nutrition
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav
            className="hidden md:flex items-center space-x-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`px-4 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <TourTrigger />
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline-block">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground border-border hover:border-border/80"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <div
          className="px-2 pt-2 pb-3 space-y-1"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
