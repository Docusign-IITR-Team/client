'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './DarkCodeToggle';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, LogOut, User, FileText } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/count');
        const data = await response.json();
        setNotificationCount(data.count);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    if (session) {
      fetchNotificationCount();
      // Refresh count every minute
      const interval = setInterval(fetchNotificationCount, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
          Piwot
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href="/notifications" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <ModeToggle />
              <Popover>
                <PopoverTrigger>
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-3">
                    <div className="border-b pb-3">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link href="/dashboard" className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-accent rounded-md transition-colors">
                        <FileText className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-accent rounded-md transition-colors">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-accent rounded-md transition-colors">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-accent rounded-md transition-colors text-red-500 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
