"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import API from "@/lib/axios"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import useAuth from "./useAuth"

const PostFeed = () => {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  const { ref, inView } = useInView({
    threshold: 0,
  })


  useAuth
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decodedToken = jwtDecode(token)
        setUserId(decodedToken.id)
        localStorage.setItem("userId", decodedToken.id)
      } catch (error) {
        console.error("Token dekodlashda xatolik:", error)
        router.push("/login")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || !userId) return
    setLoading(true)
    try {
      const response = await API.get(`/posts/random?page=${page}`)
      const newPosts = response.data

      const postsWithDetails = await Promise.all(
        newPosts.map(async (post) => {
          const [likeResponse, bookmarkResponse, followResponse] = await Promise.all([
            API.get(`/likes/user/${userId}/post/${post.id}`),
            API.get(`/saved-posts/user/${userId}/post/${post.id}`),
            API.get(`/followers/check?follower_id=${userId}&following_id=${post.user.id}`),
          ])
          return {
            ...post,
            hasLiked: likeResponse.data.hasLiked,
            likesCount: post.likes?.length || 0,
            commentsCount: post.comments?.length || 0,
            saved: bookmarkResponse.data.hasPost,
            user: {
              ...post.user,
              isFollowing: followResponse.data.isFollowing,
            },
          }
        }),
      )

      if (postsWithDetails.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prevPosts) => {
          const existingIds = new Set(prevPosts.map((post) => post.id))
          const filteredNewPosts = postsWithDetails.filter((post) => !existingIds.has(post.id))
          return [...prevPosts, ...filteredNewPosts]
        })
        setPage((prevPage) => prevPage + 1)
      }
    } catch (error) {
      console.error("Postlarni yuklashda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, userId, page])

  useEffect(() => {
    if (inView && userId) {
      fetchPosts()
    }
  }, [inView, userId, fetchPosts])

  const handleLike = async (postId) => {
    try {
      const currentUserId = localStorage.getItem("userId")
      const post = posts.find((p) => p.id === postId)

      if (post.hasLiked) {
         await API.post("/likes", { userId: currentUserId, postId })
      } else {
        await API.post("/likes", { userId: currentUserId, postId })
      }

      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasLiked: !post.hasLiked,
              likesCount: post.hasLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post,
      )
      setPosts(updatedPosts)
    } catch (error) {
      console.error("Like qo'yishda xatolik:", error)
    }
  }

  const handleFollow = async (followingId) => {
    try {
      const followerId = localStorage.getItem("userId")
      await API.post("/followers/toggle", {
        follower_id: followerId,
        following_id: followingId,
      })

      const updatedPosts = posts.map((post) => {
        if (post.user.id === followingId) {
          return {
            ...post,
            user: {
              ...post.user,
              isFollowing: !post.user.isFollowing,
            },
          }
        }
        return post
      })
      setPosts(updatedPosts)
    } catch (error) {
      console.error("Follow/Unfollow qilishda xatolik:", error)
    }
  }

  const handleCommentClick = (postId) => {
    router.push(`/post/${postId}`)
  }

  const handleBookmark = async (postId) => {
    try {
      const currentUserId = localStorage.getItem("userId")
      const post = posts.find((p) => p.id === postId)

      if (post.saved) {
        await API.delete(`/saved-posts/unsave/${currentUserId}/${postId}`)
      } else {
        await API.post("/saved-posts/save", { user_id: currentUserId, post_id: postId })
      }

      const updatedPosts = posts.map((post) => (post.id === postId ? { ...post, saved: !post.saved } : post))
      setPosts(updatedPosts)
    } catch (error) {
      console.error("Bookmark qilishda xatolik:", error)
    }
  }

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden">
      {posts.map((post) => (
        <Card key={post.id} className="border border-gray-800 max-w-2xl mx-auto mb-4 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center space-x-4">
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
                  <h3 className="font-semibold">{post.user.username}</h3>
                  {post.user.id !== userId && (
                    <Button
                      variant="link"
                      className={post.user.isFollowing ? "text-gray-500 p-0" : "text-blue-500 p-0"}
                      onClick={() => handleFollow(post.user.id)}
                    >
                      {post.user.isFollowing ? "Obunani bekor qilish" : "Obuna bo`lish"}
                    </Button>
                  )}
                </div>
                <p className="text-sm">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Carousel className="w-full h-auto overflow-hidden">
              <CarouselContent>
                {post.images?.map((image, index) => (
                  <CarouselItem key={index} className="w-full max-w-xs h-auto">
                    <div className="p-1">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${image.image}`}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-auto object-contain"
                        onClick={() => setSelectedImage(image)}
                        onError={(e) => {
                          console.error("Rasm yuklanmadi:", `${process.env.NEXT_PUBLIC_API_URL}${image.image}`)
                          e.target.src = "/placeholder-image.png"
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {post.images?.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 p-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" onClick={() => handleLike(post.id)} className="hover:text-white">
                  <Heart className={post.hasLiked ? "fill-red-500 text-red-500" : ""} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-white"
                  onClick={() => handleCommentClick(post.id)}
                >
                  <MessageCircle />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-white">
                  <Send />
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleBookmark(post.id)} className="hover:text-white">
                <Bookmark className={post.saved ? "fill-yellow-500 text-yellow-500" : ""} />
              </Button>
            </div>

            <div className="space-y-2 w-full">
              <p className="font-semibold">{post.likesCount} likes</p>
              <p>
                <span className="font-semibold">{post.user.username}</span> {post.caption}
              </p>
              {post.commentsCount > 0 && (
                <Button variant="link" className="p-0" onClick={() => router.push(`/post/${post.id}`)}>
                  View all {post.commentsCount} comments
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
      {loading && <div className="text-center py-4">Yuklanmoqda...</div>}
      {!hasMore && <div className="text-center py-4">Boshqa post yo'q</div>}
      <div ref={ref} className="h-10" />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-full h-full p-0 border-none">
          <VisuallyHidden>
            <DialogTitle>Full Screen Image</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${selectedImage.image}`}
                alt="Full screen"
                className="object-contain"
                onError={(e) => {
                  console.error("Modal rasm yuklanmadi:", `${process.env.NEXT_PUBLIC_API_URL}${selectedImage.image}`)
                  e.target.src = "/placeholder-image.png"
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PostFeed

