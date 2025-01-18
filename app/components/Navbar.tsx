'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
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

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
          Piwot
        </Link>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link href="/notifs">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
              <ModeToggle />
              <Dialog>
                <DialogTrigger asChild>
                  <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage
                      src={session.user?.image || ''}
                      alt={session.user?.name || 'User'}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      {session.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage
                              src={session.user?.image || ''}
                              alt={session.user?.name || 'User'}
                              referrerPolicy="no-referrer"
                            />
                            <AvatarFallback>
                              {session.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{session.user?.name}</h3>
                            <p className="text-sm text-gray-500">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <Link href="/dashboard">
                            <Button variant="outline">Dashboard</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => signOut()}
                          >
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <ModeToggle />
              <Button 
                onClick={() => signIn('google')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
