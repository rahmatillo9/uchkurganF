"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Send, MoreHorizontal, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import API from "@/lib/axios"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import useAuth from "./useAuth"

const PostDetail = ({ postId }) => {
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [userId, setUserId] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const router = useRouter()


  useAuth
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decodedToken = jwtDecode(token)
        setUserId(decodedToken.id)
      } catch (error) {
        console.error("Token dekodlashda xatolik:", error)
        router.push("/login")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          API.get(`/posts/${postId}`),
          API.get(`/comments/post/${postId}`),
        ])
        setPost(postResponse.data)
        setComments(commentsResponse.data)
        if (postResponse.data.user.followers) {
          setIsFollowing(postResponse.data.user.followers.some((follower) => follower.id === userId))
        }
        if (postResponse.data.likes) {
          setIsLiked(postResponse.data.likes.some((like) => like.userId === userId))
        }
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error)
      }
    }

    if (postId && userId) {
      fetchPostAndComments()
    }
  }, [postId, userId])

  const handleFollow = async () => {
    try {
      const followerId = userId
      const followingId = post.user.id

      if (isFollowing) {
        await API.delete(`/followers/unfollow/${followerId}/${followingId}`)
      } else {
        await API.post("/followers/follow", {
          follower_id: followerId,
          following_id: followingId,
        })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Obuna bo'lishda xatolik:", error)
    }
  }

  const handleLike = async () => {
    try {
      if (isLiked) {
        await API.delete(`/likes/${postId}/${userId}`)
      } else {
        await API.post("/likes", { userId, postId })
      }
      setIsLiked(!isLiked)
      const updatedPost = {
        ...post,
        likes: isLiked ? post.likes.filter((like) => like.userId !== userId) : [...post.likes, { userId }],
      }
      setPost(updatedPost)
    } catch (error) {
      console.error("Like qo'yishda xatolik:", error)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await API.post("/comments", {
        user_id: userId,
        post_id: postId,
        content: newComment,
      })

      const newCommentWithUser = {
        ...response.data,
        user: {
          id: userId,
          username: localStorage.getItem("username"),
          profile_image: localStorage.getItem("profile_image"),
        },
      }
      setComments([...comments, newCommentWithUser])
      setNewComment("")
    } catch (error) {
      console.error("Kommentariya qo'shishda xatolik:", error)
    }
  }

  if (!post) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold">Izoh</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto pb-16"> {/* pb-20 ni pb-16 ga o'zgartirdim, footer uchun joy qoldirish uchun */}
        {/* User Info */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 rounded-full" onClick={() => router.push(`/userProfile/${post.user.id}`)}>
  <AvatarImage
    src={
      post.user.profile_image
        ? `${process.env.NEXT_PUBLIC_API_URL}${post.user.profile_image}`
        : "/placeholder-avatar.png"
    }
    alt={post.user.username}
    className="object-cover w-full h-full rounded-full"
  />
  <AvatarFallback className="rounded-full flex items-center justify-center w-full h-full">
    {post.user.username?.[0]}
  </AvatarFallback>
</Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold">{post.user.username}</p>
                <span className="text-gray-400">•</span>
                <p className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-gray-400">{post.user.bio}</p>
            </div>
          </div>
          {post.user.id !== userId && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              className={isFollowing ? "text-white border-gray-600" : "bg-blue-500 hover:bg-blue-600"}
              size="sm"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* Post Caption */}
        <div className="px-4 py-2">
          <p className="whitespace-pre-wrap">{post.caption}</p>
        </div>

        {/* Images */}
        <div className="mt-4">
          <Carousel className="w-full">
            <CarouselContent>
              {post.images?.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${image.image}`}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {post.images?.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        {/* Engagement */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" onClick={handleLike}>
                <Heart className={isLiked ? "fill-red-500 text-red-500" : ""} />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageCircle />
              </Button>
              <Button variant="ghost" size="icon">
                <Send />
              </Button>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </div>

          <p className="font-semibold">{post.likes?.length || 0} likes</p>
        </div>

        <Separator className="bg-gray-800" />

        {/* Comments */}
        <div className="py-2">
          {comments.map((comment) => (
            <div key={comment.id} className="px-4 py-3 flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user?.profile_image || "/placeholder-avatar.png"} />
                <AvatarFallback>{comment.user?.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm">{comment.user?.username}</p>
                  <span className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Input - Footer ustida, lekin fixed holda pastki qismda */}
      <div className="fixed bottom-16 left-0 right-0 bg-black border-t border-gray-800 p-4 z-40">
        <form onSubmit={handleComment} className="flex items-center space-x-3 max-w-2xl mx-auto">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.user.profile_image || "/placeholder-avatar.png"} />
            <AvatarFallback>{post.user.username?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="izoh qoldiring..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-gray-900 border-none text-white placeholder:text-gray-500 rounded-full px-4 py-2 w-full"
            />
          </div>
          <Button
            type="submit"
            variant="ghost"
            className={`text-blue-500 ${!newComment.trim() && "opacity-50"}`}
            disabled={!newComment.trim()}
          >
            izoh
          </Button>
        </form>
      </div>
    </div>
  )
}

export default PostDetail