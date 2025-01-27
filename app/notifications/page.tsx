'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Notification } from '@/lib/utils/notification';
import { formatDistanceToNow } from 'date-fns';
import clientPromise from '@/lib/utils/db';
import Navbar from '@/app/components/Navbar';
import { DarkBlueBackground } from '../components/dark-blue-background';

const NotifsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/notifications?userId=${session.user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt)
        })));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [session]);

  return (
    <>
        <DarkBlueBackground className="min-h-screen">

      <Navbar />
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6 text-white">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications available.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li key={notif.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="text-gray-800 mb-2">{notif.message}</p>
              <div className="flex justify-between items-center">
                <a 
                  href={notif.fileLink} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View File
                </a>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </DarkBlueBackground>
    </>

  );
};

export default NotifsPage;
