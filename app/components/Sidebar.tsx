'use client';

import { useSession } from "next-auth/react";
import { IconHome, IconFiles, IconSettings, IconLogout } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

const navigation = [
  { name: 'Home', href: '/', icon: IconHome },
  { name: 'Files', href: '/files', icon: IconFiles },
  { name: 'Settings', href: '/settings', icon: IconSettings },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col justify-between border-r bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm w-64 fixed left-0 top-0">
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold">{session?.user?.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  pathname === item.href ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
        >
          <IconLogout className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
