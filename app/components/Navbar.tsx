'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
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

export default function Navbar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={`bg-gray-100 shadow-md p-4`}>
      <nav className='container mx-auto flex justify-between items-center'>
        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className='px-4 py-2 text-sm font-medium hover:bg-gray-200 rounded-md'
                href='/'
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className='px-4 py-2 text-sm font-medium hover:bg-gray-200 rounded-md'
                href='/about'
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle />
        {/* Profile Avatar with Authentication */}
        <div className='flex items-center space-x-4'>
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className='cursor-pointer'>
                {session?.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || 'Profile'}
                  />
                ) : (
                  <AvatarFallback>
                    {session?.user?.name?.slice(0, 2).toUpperCase() || 'GU'}
                  </AvatarFallback>
                )}
              </Avatar>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{session ? 'Profile' : 'Sign In'}</DialogTitle>
                <DialogDescription>
                  {session ? (
                    <div className='space-y-4'>
                      <div className='flex items-center space-x-4'>
                        <Avatar className='w-16 h-16'>
                          {session.user?.image ? (
                            <AvatarImage
                              src={session.user.image}
                              alt={session.user.name || 'Profile'}
                            />
                          ) : (
                            <AvatarFallback>
                              {session.user?.name?.slice(0, 2).toUpperCase() ||
                                'GU'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className='font-medium'>{session.user?.name}</h3>
                          <p className='text-sm text-gray-500'>
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        className='w-full'
                        onClick={() => signOut()}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <p>Sign in with your account to continue.</p>
                      <Button
                        variant='outline'
                        className='w-full'
                        onClick={() => signIn('google')}
                      >
                        Sign in with Google
                      </Button>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  );
}
