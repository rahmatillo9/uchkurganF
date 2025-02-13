"use client"

import { Heart, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ModeToggle } from "./darck-mode"

export default function Navbar() {
  const router = useRouter()
  return (
    <header className="fixed top-0 left-0 right-0 bg-black px-4 py-2 flex items-center justify-between z-50">
      {/* Instagram Logo */}
      <div className="flex-1">
        <h1 className="text-white font-['Instagram Sans Script'] text-2xl">Tasvirchi</h1>
      </div>
      <ModeToggle/>
     

      {/* Notification Icons */}
      <div className="flex items-center gap-4">
        <button className="relative text-white" aria-label="Likes" onClick={() => router.push('/likes')}>
          <Heart className="w-7 h-7" />
        </button>
        <button className="relative text-white" aria-label="Messages" onClick={() => router.push('/messegs')}>

          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            6
          </span>
        </button>
      </div>
    </header>
  )
}

