"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { jwtDecode } from "jwt-decode"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const SOCKET_SERVER_URL = "http://localhost:3001"

export function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef()
  const userId = jwtDecode(localStorage.getItem("token")).id

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL)

    socketRef.current.on("newNotification", (notification) => {
      setNotifications((prevNotifications) => [notification, ...prevNotifications])
      setUnreadCount((prevCount) => prevCount + 1)
    })

    // Mavjud bildirishnomalarni olish
    fetchNotifications()

    return () => socketRef.current.disconnect()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((notif) => !notif.isRead).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications(notifications.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
      setUnreadCount((prevCount) => prevCount - 1)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-default">
                    <div
                      className={`w-full p-2 ${notification.isRead ? "bg-background" : "bg-muted"}`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <p className="font-medium">{notification.messageText}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {notification.messageId && (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => {
                            /* Navigate to message */
                          }}
                        >
                          View Message
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

