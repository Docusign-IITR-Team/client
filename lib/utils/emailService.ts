// Function to send email notifications to collaborators
export const sendEmailNotification = async (collaborators: string[], subject: string, message: string) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collaborators,
        subject,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};
