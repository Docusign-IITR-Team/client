'use client';

import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { IconHome, IconFiles, IconSettings, IconLogin, IconLogout, IconUser, IconBell } from "@tabler/icons-react";
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

const sidebarLinks = [
  {
    label: 'Home',
    href: '/',
    icon: <IconHome className="h-4 w-4" />,
  },
  {
    label: 'Files',
    href: '/files',
    icon: <IconFiles className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <IconSettings className="h-4 w-4" />,
  },
  {
    label: 'Notifications',
    href: '/notifs',
    icon: <IconBell className="h-4 w-4" />,
  },
];

export function CustomSidebar() {
  const { data: session, status } = useSession();

  return (
    <Sidebar>
      <SidebarBody className="flex flex-col justify-between h-full">
        <div>
          {/* User Profile Section */}
          {session?.user && (
            <div className="mb-8 px-4 py-2">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <IconUser className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1 px-3">
            {sidebarLinks.map((link) => (
              <SidebarLink key={link.href} link={link} />
            ))}
          </nav>
        </div>

        {/* Auth Section */}
        <div className="px-3 py-4 border-t dark:border-gray-800">
          {status === 'loading' ? (
            <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-800 rounded" />
          ) : session ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <IconLogout className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <IconLogin className="h-4 w-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
