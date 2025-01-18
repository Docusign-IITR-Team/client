import clientPromise from './db';

// Notification Schema
export interface Notification {
  id: string;
  userId: string;
  message: string;
  fileLink: string;
  createdAt: Date;
}

// Function to save a notification via API
export const saveNotification = async (userId: string, message: string, fileLink: string) => {
  const response = await fetch('/api/notifications/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      message,
      fileLink,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save notification');
  }

  return response.json();
};
