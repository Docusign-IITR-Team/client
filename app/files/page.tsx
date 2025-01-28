      "use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function FilesPage() {
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const publicKey = "0x1234...ABCD" // Replace with your actual public key

  const handleSign = async () => {
    setShowSignatureModal(true)
  }

  const handleConfirmSign = async () => {
    setShowSignatureModal(false)
    // Call your existing sign API here
    try {
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ /* your existing payload */ }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to sign")
      }
      
      // Handle successful signing
    } catch (error) {
      console.error("Error signing:", error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Files</h1>
      
      {/* Your existing files list/grid here */}
      
      <Button onClick={handleSign}>
        Sign Document
      </Button>

     
    </div>
  )
}
