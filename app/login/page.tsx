"use client"

import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "password">("email")
  const router = useRouter()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.push('/dashboard')
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="p-4">
        <Image
          src="https://docucdn-a.akamaihd.net/olive/images/2.72.0/global-assets/ds-logo-default.svg"
          alt="DocuSign"
          width={120}
          height={26}
          className="h-[26px] w-auto"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[400px] p-8 border border-gray-200 rounded-lg shadow-sm mx-4">
          <div className="space-y-6">
            {step === "email" ? (
              <>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-800">Log in to Docusign</h1>
                  <p className="text-sm text-gray-500">Enter your email to log in.</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      placeholder="Enter email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md">
                    NEXT
                  </Button>
                </form>

                <div className="text-center">
                  <Link href="#" className="text-sm text-indigo-600 hover:underline">
                    Sign Up for Free
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-800">Log In</h1>
                  <button
                    onClick={() => setStep("email")}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {email}
                  </button>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-gray-800">Enter your password</h1>
                    <p className="text-sm text-gray-500">Please enter your password to continue.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200 mt-auto">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-4 w-full md:w-auto order-3 md:order-1">
            <span className="text-xs">Powered by DocuSign</span>
            <Select defaultValue="en">
              <SelectTrigger className="w-[140px] h-8 border border-gray-300">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 order-1 md:order-2">
            <Link href="#" className="hover:underline">
              Contact Us
            </Link>
            <Link href="#" className="hover:underline">
              Terms of Use
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Intellectual Property
            </Link>
            <Link href="#" className="hover:underline">
              Trust
            </Link>
          </div>
          <div className="text-xs text-gray-500 w-full md:w-auto text-center md:text-left order-2 md:order-3">
            Copyright 2024 DocuSign, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
