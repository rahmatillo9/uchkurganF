"use client"

import { useState, useEffect } from "react"
import {  Search, X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import API from "@/lib/axios"
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"

export function SearchBar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState([])
  const [userId, setUserId] = useState(null)
  const [showRecent, setShowRecent] = useState(false) // For showing recent searches dropdown

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
      if (token) {
        const response = await API.get("/search/history") // Recent searches uchun yangi marshrut
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
      // Save search query with userId
      const token = localStorage.getItem("token")
      if (token && userId) {
        await API.post("/search/history", { 
          search_query: searchQuery,
          user_id: userId
        })
        await fetchRecentSearches()
      }
      // Redirect to search page with query string
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
      <form onSubmit={handleSearch} className="flex items-center space-x-4 dark:text-black">
        <div className="relative">
          <Input
            type="search"
            placeholder="Nima qidiryapsiz?"
            className="w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </form>

      {showRecent && recentSearches.length > 0 && (
        <div className="absolute z-10 mt-2 w-[200px] lg:w-[300px] shadow-lg rounded-md overflow-hidden">
          <div className="p-2">
            <h3 className="font-semibold mb-2 text-sm">Oxirgi qidiruvlar:</h3>
            <ul>
              {recentSearches.map((search) => (
                <li key={search.id} className="flex justify-between items-center py-1">
                  <Button 
                    variant="ghost" 
                    className="text-left text-sm w-full truncate" 
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
                    className="flex-shrink-0"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    <X className="h-4 w-4" />
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