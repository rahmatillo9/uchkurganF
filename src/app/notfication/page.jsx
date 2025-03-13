"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Heart, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import API from "@/lib/axios"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decodedToken = jwtDecode(token)
        setUserId(decodedToken.id)
        fetchNotifications(decodedToken.id)
      } catch (error) {
        console.error("Token dekodlashda xatolik:", error)
        router.push("/login")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  const fetchNotifications = async (userId) => {
    try {
      const response = await API.get(`/notifications/${userId}`)
      const groupedNotifications = groupNotificationsByTime(response.data)
      setNotifications(groupedNotifications)
    } catch (error) {
      console.error("Bildirishnomalarni olishda xatolik:", error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`)
      setNotifications((prevGroups) => {
        const updatedGroups = { ...prevGroups }
        Object.keys(updatedGroups).forEach((key) => {
          updatedGroups[key] = updatedGroups[key].map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification,
          )
        })
        return updatedGroups
      })
    } catch (error) {
      console.error("Bildirishnomani o'qilgan deb belgilashda xatolik:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await API.patch(`/notifications/${userId}/read-all`)
      setNotifications((prevGroups) => {
        const updatedGroups = { ...prevGroups }
        Object.keys(updatedGroups).forEach((key) => {
          updatedGroups[key] = updatedGroups[key].map((notification) => ({
            ...notification,
            is_read: true,
          }))
        })
        return updatedGroups
      })
    } catch (error) {
      console.error("Barcha bildirishnomalarni o'qilgan deb belgilashda xatolik:", error)
    }
  }

  const clearAllNotifications = async () => {
    if (!userId) return;

    try {
      await API.delete(`/notifications/${userId}`)
      setNotifications({
        today: [],
        yesterday: [],
        lastWeek: [],
        older: [],
      })
    } catch (error) {
      console.error("Barcha bildirishnomalarni tozalashda xatolik:", error)
    }
  }

  const groupNotificationsByTime = (notifications) => {
    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    }

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.createdAt)
      if (notificationDate.toDateString() === now.toDateString()) {
        groups.today.push(notification)
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(notification)
      } else if (notificationDate > lastWeek) {
        groups.lastWeek.push(notification)
      } else {
        groups.older.push(notification)
      }
    })

    return groups
  }

  const renderNotification = (notification) => {
    const handleClick = () => {
      if (!notification.is_read) {
        markAsRead(notification.id)
      }
      if (notification.post_id) {
        router.push(`/post/${notification.post_id}`)
      } else if (notification.type === "follow") {
        router.push(`/userProfile/${notification.from_user_id}`)
      }
    }

    return (
      <div
        key={notification.id}
        className={`flex items-center space-x-4 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${!notification.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
          }`}
        onClick={handleClick}
      >
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage
              className="object-cover w-full h-full"
              src={
                notification.fromUser?.profile_image
                  ? `${process.env.NEXT_PUBLIC_API_URL}${notification.fromUser.profile_image}`
                  : "/placeholder-avatar.png"
              }
              alt={notification.fromUser?.username}
            />
            <AvatarFallback>
              {notification.fromUser?.username?.[0]}
            </AvatarFallback>
          </Avatar>

          {notification.type === "like" && (
            <div className="absolute -right-1 -bottom-1 bg-red-500 rounded-full p-1">
              <Heart className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold">{notification.fromUser?.username}</span>{" "}
            {notification.type === "like" && "sizning postingizni yoqtirdi"}
            {notification.type === "comment" && "postingizga izoh qoldirdi"}
            {notification.type === "follow" && "sizga obuna bo'ldi"}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>

        {notification.post && (
          <div className="w-12 h-12">
            <img
              src={
                notification.post.images?.[0]?.image
                  ? `${process.env.NEXT_PUBLIC_API_URL}${notification.post.images[0].image}`
                  : "/placeholder-image.png"
              }
              alt="Post thumbnail"
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
      </div>
    )
  }

  // Calculate total notification count to determine if buttons should be disabled
  const totalNotifications = Object.values(notifications).reduce(
    (sum, group) => sum + group.length,
    0
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Bildirishnomalar</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={markAllAsRead}
            disabled={totalNotifications === 0}
            title="Barchasini o'qilgan deb belgilash"
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAllNotifications}
            disabled={totalNotifications === 0}
            title="Barchasini tozalash"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        {totalNotifications === 0 && (
          <div className="p-4 text-center text-gray-500">
            Hech qanday bildirishnoma yo'q
          </div>
        )}

        {notifications.today?.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-sm font-semibold text-gray-500">Bugun</h2>
            {notifications.today.map(renderNotification)}
          </div>
        )}

        {notifications.yesterday?.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-sm font-semibold text-gray-500">Kecha</h2>
            {notifications.yesterday.map(renderNotification)}
          </div>
        )}

        {notifications.lastWeek?.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-sm font-semibold text-gray-500">Oxirgi 7 kun</h2>
            {notifications.lastWeek.map(renderNotification)}
          </div>
        )}

        {notifications.older?.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-sm font-semibold text-gray-500">Oldingi</h2>
            {notifications.older.map(renderNotification)}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}