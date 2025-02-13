"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import API from "@/lib/axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Heart, MessageCircle, Eye } from "lucide-react"

const categories = [
  { id: 0, name: "Barchasi" },
  { id: 1, name: "Bozor" },
  { id: 2, name: "Taksi" },
  { id: 3, name: "O'quv markazlar" },
  { id: 4, name: "Ish" },
  { id: 5, name: "Boshqa" },
]




export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("0")
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [activePostId, setActivePostId] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/register")
      return
    }
    try {
      const decoded = jwtDecode(token)
      setUser(decoded)
      fetchRecentSearches()
      fetchAllPosts()
    } catch (error) {
      router.push("/register")
    }
  }, [router])


  
const deleteSearch = async (searchId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    await API.delete(`/search/${searchId}`);

    // Refresh recent searches after deletion
    fetchRecentSearches();
    toast({
      title: "Success",
      description: "Search query deleted successfully",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete search query",
      variant: "destructive",
    });
  }
};

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, selectedCategory]) //Corrected dependency array

  const fetchRecentSearches = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const decodedToken = jwtDecode(token)
      const response = await API.get(`/search?user_id=${decodedToken.id}`)
      setRecentSearches(response.data)
    } catch (error) {
      console.error("Error fetching recent searches:", error)
    }
  }

  const fetchAllPosts = async () => {
    try {
      const response = await API.get("/posts")
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      })
    }
  }

  const filterPosts = () => {
    let filtered = posts
    if (selectedCategory !== "0") {
      filtered = filtered.filter((post) => post.category_id.toString() === selectedCategory)
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    setFilteredPosts(filtered)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const decodedToken = jwtDecode(token)

      // Save search query
      await API.post("/search", {
        search_query: searchQuery,
        user_id: decodedToken.id,
      })

      filterPosts()
      fetchRecentSearches() // Refresh recent searches
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform search",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCommentClick = (postId) => {
    setActivePostId(activePostId === postId ? null : postId)
  }

  const handleNewComment = async (postId) => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      router.push("/register")
      return
    }

    try {
      const response = await API.post("/comments", {
        user_id: user.id,
        post_id: postId,
        content: newComment,
      })

      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), response.data],
            }
          }
          return post
        }),
      )

      setNewComment("")
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const favHandler = async (postId, isLiked) => {
    if (!user) {
      router.push("/register")
      return
    }

    try {
      if (isLiked) {
        await API.delete(`/likes/${user.id}/${postId}`)
      } else {
        await API.post(`/likes/${user.id}/${postId}`, {})
      }

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, isLiked: !isLiked, likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 }
            : post,
        ),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Search</h1>

      <div className="space-y-4 mb-6">
        <Input
          type="text"
          placeholder="Enter your search query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="w-full" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {recentSearches.length > 0 && (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-3">Recent Searches</h2>
    <div className="flex flex-wrap gap-2">
      {recentSearches.map((search, index) => (
        <div key={index} className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSearchQuery(search.search_query)}>
            {search.search_query}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteSearch(search.id)}
          >
            X
          </Button>
        </div>
      ))}
    </div>
  </div>
)}

      <div>
        <h2 className="text-xl font-semibold mb-3">Posts</h2>
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="mb-4">
              <CardHeader className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`http://localhost:4000${post.user.profile_image}`} />
                  <AvatarFallback>{post.user.nickname[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{post.user.nickname}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(post.createdAt), "PPP")}</p>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">{post.title}</h4>
                <p>{post.content}</p>
                {post.image && (
                  <img src={`http://localhost:4000${post.image}`} alt={post.title} className="mt-2 rounded-md w-full" />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={() => favHandler(post.id, post.isLiked)} variant="ghost" size="sm">
                  <Heart className={`mr-2 h-4 w-4 ${post.isLiked ? "text-red-500 fill-red-500" : ""}`} />
                  {post.likes_count}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleCommentClick(post.id)}>
                  <MessageCircle className="mr-2 h-4 w-4" /> {post.comments?.length || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="mr-2 h-4 w-4" /> {post.views_count}
                </Button>
              </CardFooter>
              {activePostId === post.id && (
                <CardContent>
                  <Separator className="my-4" />
                  <ScrollArea className="h-[200px] mb-4">
                    {(post.comments || []).map((comment, index) => (
                      <div key={comment.id || `comment-${index}`} className="mb-4 flex items-start space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={
                              comment?.user?.profile_image
                                ? `http://localhost:4000${comment.user.profile_image}`
                                : "/default-avatar.png"
                            }
                          />
                          <AvatarFallback>{comment?.user?.nickname?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{comment?.user?.nickname || "Guest"}</p>
                          <p>{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={() => handleNewComment(post.id)}>Post</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

