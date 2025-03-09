"use client"

import { Home, Search, PlusSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import NotificationIndicator from "./NotificationIndicator"

export default function AppLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-2">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="icon"
            className={isActive("/") ? "text-blue-500" : ""}
            onClick={() => router.push("/")}
          >
            <Home className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={isActive("/search") ? "text-blue-500" : ""}
            onClick={() => router.push("/search")}
          >
            <Search className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={isActive("/create") ? "text-blue-500" : ""}
            onClick={() => router.push("/create")}
          >
            <PlusSquare className="h-6 w-6" />
          </Button>

          <NotificationIndicator />

          <Button
            variant="ghost"
            size="icon"
            className={isActive("/profile") ? "text-blue-500" : ""}
            onClick={() => router.push("/profile")}
          >
            <User className="h-6 w-6" />
          </Button>
        </div>
      </nav>
    </div>
  )
}

