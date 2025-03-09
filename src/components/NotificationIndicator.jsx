"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import useAuth from "./useAuth"

export default function NotificationIndicator() {
  const router = useRouter()
  const { unreadNotifications, refreshNotifications } = useAuth()

  // Refresh notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [refreshNotifications])

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/notifications")}>
      <Bell className="h-6 w-6" />
      {unreadNotifications > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadNotifications > 9 ? "9+" : unreadNotifications}
        </span>
      )}
    </Button>
  )
}

