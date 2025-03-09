"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Search, PlusSquare,  User, Store } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Bosh sahifa", href: "/" },
    { icon: Search, label: "Qidiruv", href: "/search" },
    { icon: PlusSquare, label: "Post qo`shish", href: "/create" },
    { icon: Store, label: "Haqida", href: "/about" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black dark:bg-gray-900 border-t border-gray-800 ">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full 
                          transition-colors duration-200 ${
                            isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                          }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Progress bar indicator - optional */}
      <div className="h-1 bg-gray-800">
        <div className="h-full w-1/2 bg-white rounded-r-full" />
      </div>
    </nav>
  )
}
