"use client"

import { useEffect, useState } from "react"
import API from "@/lib/axios"
import { jwtDecode } from "jwt-decode"
import { Check, LogOut, Heart, MessageCircle, Eye, Trash, Edit,  } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [activePostId, setActivePostId] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const decodedToken = jwtDecode(token)

        // Fetch user data
        const userResponse = await API.get(`/users/${decodedToken.id}`)
        setUserData(userResponse.data)

        // Fetch user posts
        const postsResponse = await API.get(`/posts/user/${decodedToken.id}`)
        setPosts(postsResponse.data)
      } catch (error) {
        setError(error.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
 
  const deletePost = async (postId) => {
    if (!window.confirm("Rostan ham bu postni o‘chirmoqchimisiz?")) return;
  
    try {
      // 🔥 Optimistik UI: Postni vaqtincha olib tashlaymiz
      const prevPosts = [...posts];
      setPosts(posts.filter((post) => post.id !== postId));
  
      // 🛠️ Serverdan o‘chirish
      await API.delete(`/posts/${postId}`);
  
      toast({
        title: "Success",
        description: "Post muvaffaqiyatli o‘chirildi",
      });
    } catch (error) {
      // ❌ Xatolik bo‘lsa, avvalgi holatni tiklash
      setPosts(prevPosts);
  
      toast({
        title: "Error",
        description: "Postni o‘chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };
  

  const logout = () => {
    localStorage.removeItem("token")
    router.push("/")
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

    try {
      const response = await API.post("/comments", {
        user_id: userData.id,
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
    try {
      if (isLiked) {
        await API.delete(`/likes/${userData.id}/${postId}`)
      } else {
        await API.post(`/likes/${userData.id}/${postId}`, {})
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

  if (loading) return <div className="flex justify-center p-8">Loading...</div>
  if (error) return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>

  const profileImage = userData?.profile_image
    ? userData.profile_image.startsWith("http")
      ? userData.profile_image
      : `http://localhost:4000${userData.profile_image}`
    : null

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Profile Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
    
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-full">
              {profileImage ? (
                <AvatarImage src={profileImage} alt={userData?.nickname} />
              ) : (
                <AvatarFallback>{userData?.nickname?.[0].toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{userData?.nickname}</h1>
              <p className="text-sm text-gray-400">{posts.length} posts</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open menu</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/edit-profile")}>
                <Check className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {userData?.bio && <p className="text-sm">{userData.bio}</p>}

        <Button className="w-full" variant="outline" onClick={() => router.push("/edit-profile")}>
          Edit profile
        </Button>
      </div>

      {/* Posts */}
      <div className="container mx-auto p-4 max-w-md">
        {posts.map((post) => (
          
          <Card key={post.id} className="mb-4">
             
            <CardHeader className="flex items-center space-x-4">
          
              <Avatar>
                <AvatarImage src={profileImage} />
                <AvatarFallback>{userData?.nickname[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{userData?.nickname}</h3>
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
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open menu</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => deletePost(post.id)}>
              <Trash className="text-red-500"/>
                postni o`chirish
              </DropdownMenuItem>
              <DropdownMenuItem >
                <Edit className="mr-2 h-4 w-4" />
                postni tahrirlash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  )
}

