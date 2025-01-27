"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./DarkCodeToggle"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, LogOut, User, FileText } from "lucide-react"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"; 

export default function Navbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const [notificationCount, setNotificationCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleDocusignLogin= () => {
   console.log("docusign login")
   router.push(
    "http://localhost:3000/ds/login?auth=jwt-auth&redirect_uri=http://localhost:3001"
  )
   }
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch("/api/notifications/count")
        const data = await response.json()
        setNotificationCount(data.count)
      } catch (error) {
        console.error("Error fetching notification count:", error)
      }
    }

    
    if (session) {
      fetchNotificationCount()
      const interval = setInterval(fetchNotificationCount, 60000)
      return () => clearInterval(interval)
    }
  }, [session])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#1e40af]/80 backdrop-blur-sm border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-white hover:text-blue-200 transition-colors">Agright</span>
        </Link>

        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link href="/notifications" className="relative hover:text-blue-200 text-white transition-colors">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#1e40af] text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <ModeToggle />
              <Popover>
                <PopoverTrigger>
                  <div className="ring-2 ring-white/20 hover:ring-white rounded-full transition-all duration-300">
                    {session.user.image ? (
                      <img
                        src={session.user.image || "/placeholder.svg"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1e40af]">
                        {session.user.name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 border border-white/10 bg-[#1e40af]/95 backdrop-blur-sm" align="end">
                  <div className="space-y-3">
                    <div className="border-b border-white/10 pb-3">
                      <p className="text-sm font-medium text-white">{session.user.name}</p>
                      <p className="text-xs text-white/70">{session.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-white/10 text-white rounded-md transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-white/10 text-white rounded-md transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-white/10 text-white rounded-md transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-red-500/10 text-red-400 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <>
            <Button
              onClick={() => signIn("google")}
              className="bg-white text-[#1e40af] hover:bg-blue-50 transition-colors"
            >
              Sign in with Google
            </Button>
             <Button
             onClick={() => handleDocusignLogin()}
             className="bg-white text-[#1e40af] hover:bg-blue-50 transition-colors"
           >
             Sign in with Docusign
           </Button>
           </>

          )}
        </div>
      </nav>
    </header>
  )
}

