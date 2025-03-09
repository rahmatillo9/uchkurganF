"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { ModeToggle } from "./darck-mode"
import { Button } from "./ui/button"
import API from "@/lib/axios"

export default function Navbar() {
  const router = useRouter()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [userId, setUserId] = useState(null)

  // Get userId from localStorage when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!userId) return

      try {
        const response = await API.get(`/notifications/${userId}/unread`)
        setUnreadNotifications(response.data) // Assuming the endpoint returns a number
      } catch (error) {
        console.error("Unread notifications olishda xatolik:", error)
        setUnreadNotifications(0) // Default to 0 on error
      }
    }

    fetchUnreadNotifications()
    
    // Optional: Set up polling for real-time updates
    const interval = setInterval(fetchUnreadNotifications, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval) // Cleanup on unmount
  }, [userId])

  return (
    <header className="fixed top-0 left-0 right-0 bg-black px-4 py-2 flex items-center justify-between z-50 dark:bg-gray-900">
      {/* Instagram Logo with Beta */}
      <div className="flex-1 flex items-center gap-2">
        <h1 className="text-white font-['Instagram Sans Script'] text-2xl">Tasvirchi</h1>
        <span className="text-white text-xs bg-gray-700 px-2 py-1 rounded-full">Beta</span>
      </div>
     
      {/* Notification Icons */}
      <div className="flex items-center gap-4">
        <ModeToggle/>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          onClick={() => router.push("/notfication")}
        >
          <Bell className="h-6 w-6" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}