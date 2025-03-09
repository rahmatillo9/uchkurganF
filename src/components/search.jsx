"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import API from "@/lib/axios"
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"
import useAuth from "./useAuth"



export function SearchBar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState([])
  const [userId, setUserId] = useState(null)
  const [showRecent, setShowRecent] = useState(false)
  useAuth
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUserId(decoded.id)
      } catch (error) {
        console.error("JWT decode error:", error)
      }
    }
    fetchRecentSearches()
  }, [])

  const fetchRecentSearches = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token && userId) {
        const response = await API.get(`/search/history/${userId}`)
        setRecentSearches(response.data)
      }
    } catch (error) {
      console.error("Saqlangan qidiruvlarni olishda xatolik:", error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      const token = localStorage.getItem("token")
      if (token && userId) {
        await API.post("/search/history", { 
          search_query: searchQuery,
          user_id: userId
        })
        await fetchRecentSearches()
      }
      router.push(`/search/search?query=${encodeURIComponent(searchQuery)}`)
    } catch (error) {
      console.error("Qidiruv xatosi:", error)
      toast.error("Qidiruvda xatolik yuz berdi")
    }
  }

  const handleDeleteSearch = async (id) => {
    try {
      await API.delete(`/search/history/${id}`)
      toast.success("Qidiruv o'chirildi")
      await fetchRecentSearches()
    } catch (error) {
      console.error("Qidiruvni o'chirishda xatolik:", error)
      toast.error("Qidiruvni o'chirishda xatolik yuz berdi")
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center space-x-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Nima qidiryapsiz?"
            className="w-[200px] lg:w-[300px] bg-gray-900 text-white border-gray-700 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 text-gray-400 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {showRecent && recentSearches.length > 0 && (
        <div className="absolute z-10 mt-2 w-[200px] lg:w-[300px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-3">
            <h3 className="font-semibold text-sm text-gray-300 mb-2">Oxirgi qidiruvlar</h3>
            <ul className="space-y-1">
              {recentSearches.map((search) => (
                <li 
                  key={search.id} 
                  className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-700 transition-colors duration-150"
                >
                  <Button
                    variant="ghost"
                    className="text-left text-sm text-gray-200 w-full truncate p-0 hover:text-white"
                    onClick={() => {
                      setSearchQuery(search.search_query)
                      router.push(`/search/search?query=${encodeURIComponent(search.search_query)}`)
                    }}
                  >
                    {search.search_query}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-full w-6 h-6"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}