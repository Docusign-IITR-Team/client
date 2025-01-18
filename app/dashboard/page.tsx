'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from "../components/Navbar";
import { FileUpload } from "@/components/ui/file-upload";
import { IconFileText, IconPlus } from '@tabler/icons-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

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

    if (!file.name.endsWith('.txt')) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Only .txt files are allowed"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'document');

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
      setIsUploading(false);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Agreement
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">Your Files</TabsTrigger>
            <TabsTrigger value="shared">Shared Files</TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <Card className="p-6">
              <FileUpload onChange={(files) => files[0] && handleFileUpload(files[0])} />
              {isLoading ? (
                <div className="space-y-4 mt-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  {ownedFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <IconFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">No files uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ownedFiles.map((file) => (
                        <Link
                          key={file._id}
                          href={`/files/${file._id}`}
                          className="block p-4 bg-card hover:bg-accent transition-colors rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{file.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(file.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div>
                  {sharedFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <IconFileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">No shared files</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sharedFiles.map((file) => (
                        <Link
                          key={file._id}
                          href={`/files/${file._id}`}
                          className="block p-4 bg-card hover:bg-accent transition-colors rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{file.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Shared by: {file.owner}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(file.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
