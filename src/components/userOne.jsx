"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import API from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ArrowLeft, Bell, Heart, MessageCircle, Eye, MoreHorizontal } from "lucide-react"

export default function UserProfile({ params }) {
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [newComment, setNewComment] = useState("")
  const [activePostId, setActivePostId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
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
      setCurrentUser(decoded)
      fetchUserData()
      fetchUserPosts()
    } catch (error) {
      router.push("/register")
    }
  }, [params.id, router]) // Added router to dependencies

  const fetchUserData = async () => {
    try {
      const response = await API.get(`/users/${params.id}`)
      setUserData(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      })
    }
  }

  const fetchUserPosts = async () => {
    try {
      const response = await API.get(`/posts/user/${params.id}`)
      setPosts(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user posts",
        variant: "destructive",
      })
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

    try {
      const response = await API.post("/comments", {
        user_id: currentUser.id,
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

  if (!userData) return null

  const profileImage = userData.profile_image
    ? userData.profile_image.startsWith("http")
      ? userData.profile_image
      : `http://localhost:4000${userData.profile_image}`
    : null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">{userData.nickname}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profileImage} />
            <AvatarFallback>{userData.nickname[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userData.fullname}</h2>
            <p className="text-gray-400">@{userData.nickname}</p>
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <div className="font-bold">{posts.length}</div>
                <div className="text-sm text-gray-400">posts</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" variant="outline" onClick={() => router.push(`/messages/${params.id}`)}>
            Message
          </Button>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-4">
        {posts.map((post) => (
          <Card key={post.id} className="mb-4 bg-gray-900 border-gray-800">
            <CardHeader className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={profileImage} />
                <AvatarFallback>{userData.nickname[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{userData.nickname}</h3>
                <p className="text-sm text-gray-400">{format(new Date(post.createdAt), "PPP")}</p>
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
              <Button variant="ghost" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                {post.likes_count || 0}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleCommentClick(post.id)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.comments?.length || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                {post.views_count || 0}
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

