'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from "./components/Navbar";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { LampContainer } from "@/components/ui/lamp";

const words = [
  {
    text: "Build",
  },
  {
    text: "your",
  },
  {
    text: "legal",
  },
  {
    text: "agreements",
    className: "text-blue-500 dark:text-blue-500",
  },
  {
    text: "with",
  },
  {
    text: "AI",
    className: "text-blue-500 dark:text-blue-500",
  },
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center px-4 py-32 md:py-40">
          <div className="space-y-12 text-center">
            <div className="flex flex-col items-center justify-center h-40">
              <TypewriterEffect words={words} />
            </div>
            
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Create, manage, and share legal documents effortlessly. Powered by AI for accuracy and efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <Link href="/api/auth/signin">
                  <Button 
                    size="lg"
                    className={cn(
                      "relative w-full sm:w-auto min-w-[200px] group",
                      "bg-gradient-to-r from-blue-600 to-blue-700",
                      "hover:from-blue-700 hover:to-blue-800",
                      "text-white font-medium",
                      "transition-all duration-200 ease-in-out",
                      "before:absolute before:inset-0 before:p-[2px]",
                      "before:bg-gradient-to-r before:from-blue-400 before:to-blue-600",
                      "before:content-[''] before:rounded-lg",
                      "before:opacity-0 before:transition-opacity",
                      "hover:before:opacity-100",
                      "isolate overflow-hidden",
                      "[&>span]:relative [&>span]:z-10",
                      "hover:shadow-lg hover:shadow-blue-500/20"
                    )}
                  >
                    <span>Get Started</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button 
                    size="lg"
                    className={cn(
                      "relative w-full sm:w-auto min-w-[200px] group",
                      "bg-gradient-to-r from-blue-600 to-blue-700",
                      "hover:from-blue-700 hover:to-blue-800",
                      "text-white font-medium",
                      "transition-all duration-200 ease-in-out",
                      "before:absolute before:inset-0 before:p-[2px]",
                      "before:bg-gradient-to-r before:from-blue-400 before:to-blue-600",
                      "before:content-[''] before:rounded-lg",
                      "before:opacity-0 before:transition-opacity",
                      "hover:before:opacity-100",
                      "isolate overflow-hidden",
                      "[&>span]:relative [&>span]:z-10",
                      "hover:shadow-lg hover:shadow-blue-500/20"
                    )}
                  >
                    <span>Go to Dashboard</span>
                  </Button>
                </Link>
              )}
              
              <Link href="/about">
                <Button 
                  variant="outline" 
                  size="lg"
                  className={cn(
                    "relative w-full sm:w-auto min-w-[200px] group",
                    "border-2 border-transparent",
                    "hover:border-gray-300 dark:hover:border-gray-700",
                    "transition-all duration-200 ease-in-out",
                    "before:absolute before:inset-0 before:p-[2px]",
                    "before:bg-gradient-to-r before:from-gray-400 before:to-gray-600",
                    "before:content-[''] before:rounded-lg",
                    "before:opacity-0 before:transition-opacity",
                    "hover:before:opacity-100",
                    "isolate overflow-hidden",
                    "[&>span]:relative [&>span]:z-10",
                    "hover:shadow-lg"
                  )}
                >
                  <span>Learn More</span>
                </Button>
              </Link>
            </div>
          </div>

        <div className="mt-24 text-center max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Streamline Your Legal Workflow
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI-powered platform helps you create professional agreements, collaborate with team members, 
            and manage all your legal documents in one secure place.
          </p>
        </div>
      </main>
    </div>
  );
}
