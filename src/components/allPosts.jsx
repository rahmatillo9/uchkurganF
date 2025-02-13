"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import API from "@/lib/axios"
import { format } from "date-fns"
import { Heart, MessageCircle, Eye } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { useToast } from "@/hooks/use-toast"

export function PostsAll() {
  const [posts, setPosts] = useState([])
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
      fetchPosts()
    } catch (error) {
      router.push("/register")
    }
  }, [router]) // Added router to dependencies

  const fetchPosts = async () => {
    try {
      const response = await API.get("/posts")
      setPosts(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
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

      // Update the posts state with the new comment
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

      // Like tugmasini bosganda UI-ni yangilaymiz
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
      {posts.map((post) => (
        <Card key={post.id} className="mb-4">
          <CardHeader className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => router.push(`/profile/${post.user.id}`)}
            >
              <Avatar>
                <AvatarImage src={`http://localhost:4000${post.user.profile_image}`} />
                <AvatarFallback>{post.user.nickname[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{post.user.nickname}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(post.createdAt), "PPP")}</p>
              </div>
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

                      <AvatarFallback>{"B"}</AvatarFallback>
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
  )
}

