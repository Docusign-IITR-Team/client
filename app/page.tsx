'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface FileItem {
  _id: string;
  name: string;
  uploadedAt: string;
}
import Navbar from "./components/Navbar";

export default function Home() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (response.ok) {
        setFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setError('Only .txt files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('File uploaded successfully!');
        setError('');
        fetchFiles(); // Refresh the file list
      } else {
        setError(data.error || 'Failed to upload file');
        setMessage('');
      }
    } catch (err) {
      setError('Failed to upload file');
      setMessage('');
    }
  };

  return (
    <>
    {/* Navbar  */}
   <Navbar/>
   <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-8">Text File Upload</h1>
          <label className="block mb-4">
            <span className="text-gray-700">Choose a .txt file:</span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </label>

          {message && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Files</h2>
            {files.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file._id} className="py-4">
                    <Link 
                      href={`/files/${file._id}`}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded"
                    >
                      <span className="font-medium text-blue-600">{file.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
    </>
  );
}
