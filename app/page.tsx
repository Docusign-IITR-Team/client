'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from "./components/Navbar";
import { FileUpload } from "@/components/ui/file-upload";
import { IconFileText } from '@tabler/icons-react';
import { Skeleton } from "@/components/ui/skeleton";

interface FileItem {
  _id: string;
  name: string;
  updatedAt: string;
  size: number;
  owner: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Fetch files on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchFiles();
    }
  }, [status]);
  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your files');
          return;
        }
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to upload files');
          return;
        }
        const data = await response.json();
        setError(data.error || 'Failed to upload file');
        return;
      }

      await fetchFiles();
    } catch (err) {
      setError('Failed to upload file. Please try again later.');
    } finally {
      setUploading(false);
    }
  };
  const ownedFiles = files.filter(file => file.owner === session?.user?.email);
  const sharedFiles = files.filter(file => file.owner !== session?.user?.email);
  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Piwot</h2>
            <p className="text-gray-600">
              Click the profile icon to sign in and start managing your files.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Text File</h2>
            <FileUpload 
              onChange={(files) => {
                if (files.length > 0) {
                  const file = files[0];
                  if (!file.name.endsWith('.txt')) {
                    setError('Only .txt files are allowed');
                    return;
                  }
                  handleFileUpload(file);
                }
              }}
            />
          </div>

          {/* Your Files Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Files</h2>
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
              ownedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <IconFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownedFiles.map((file) => (
                    <Link
                      key={file._id}
                      href={`/files/${file._id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(file.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Shared With You Section */}
          {sharedFiles.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shared With You</h2>
              <div className="space-y-4">
                {sharedFiles.map((file) => (
                  <Link
                    key={file._id}
                    href={`/files/${file._id}`}
                    className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <span className="text-sm text-gray-400">•</span>
                          <p className="text-sm text-blue-600">
                            Shared by {file.owner}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
