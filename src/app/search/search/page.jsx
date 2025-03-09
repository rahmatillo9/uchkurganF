"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useInView } from "react-intersection-observer"
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import API from "@/lib/axios"
import { formatDistanceToNow } from "date-fns"
import { jwtDecode } from "jwt-decode"
import useAuth from "@/components/useAuth"

export default function SearchPosts() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [userId, setUserId] = useState(null)

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const query = searchParams.get("query")

 useAuth// Properly call useAuth

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

  const sendNotification = async (type, postId) => {
    try {
      const currentUserId = localStorage.getItem("userId");
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const notificationData = {
        user_id: post.user.id, // recipient (post owner)
        from_user_id: currentUserId, // sender
        type: type, // 'like'
        post_id: postId
      };
      
      await API.post("/notifications", notificationData);
    } catch (error) {
      console.error("Notifikatsiya yuborishda xatolik:", error);
    }
  };

  const fetchPosts = async () => {
    if (!hasMore || !userId) return
    setLoading(true)
    try {
      const apiUrl = query
        ? `/posts/search?query=${encodeURIComponent(query)}&page=${page}`
        : `/posts/random?page=${page}`

      const response = await API.get(apiUrl)

      let newPosts = response.data
      if (Array.isArray(newPosts)) {
        // Direct array
      } else if (response.data.rows && Array.isArray(response.data.rows)) {
        newPosts = response.data.rows
      } else {
        console.error("API javobi noto'g'ri formatda:", response.data)
        throw new Error("API javobi massiv emas yoki noto'g'ri formatda")
      }

      const postsWithLikesAndSaved = await Promise.all(
        newPosts.map(async (post) => {
          try {
            const likeResponse = await API.get(`/likes/user/${userId}/post/${post.id}`)
            const bookmarkResponse = await API.get(`/saved-posts/user/${userId}/post/${post.id}`)
            return {
              ...post,
              hasLiked: likeResponse.data.hasLiked,
              likesCount: post.likes?.length || 0,
              saved: bookmarkResponse.data.hasPost,
            }
          } catch (likeError) {
            console.error("Like yoki Bookmark olishda xatolik:", likeError)
            return { ...post, hasLiked: false, likesCount: post.likes?.length || 0, saved: false }
          }
        }),
      )

      if (postsWithLikesAndSaved.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prevPosts) => {
          const existingIds = new Set(prevPosts.map((post) => post.id))
          const filteredNewPosts = postsWithLikesAndSaved.filter((post) => !existingIds.has(post.id))
          return [...prevPosts, ...filteredNewPosts]
        })
        setPage((prevPage) => prevPage + 1)
      }
    } catch (error) {
      console.error("Postlarni yuklashda xatolik:", error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setPosts([])
    setHasMore(true)
    if (userId) {
      fetchPosts()
    }
  }, [userId, query])

  useEffect(() => {
    if (inView && userId) {
      fetchPosts()
    }
  }, [inView, userId])

  const handleLike = async (postId) => {
    try {
      const currentUserId = localStorage.getItem("userId")
      const post = posts.find((p) => p.id === postId)

      if (!post) return;

      if (post.hasLiked) {
        await API.delete(`/likes/${postId}/${currentUserId}`)
      } else {
        await API.post("/likes", { userId: currentUserId, postId })
        // Send notification only when liking (not unliking)
        if (!post.hasLiked && post.user.id !== currentUserId) { // Don't notify if liking own post
          await sendNotification('like', postId)
        }
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

  const handleBookmark = async (postId) => {
    try {
      const currentUserId = localStorage.getItem("userId")
      const post = posts.find((p) => p.id === postId)

      if (!post) return;

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

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50 dark:bg-slate-600">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {query ? `"${query}" bo'yicha postlar` : "Barcha postlar"}
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl mb-4">Hech narsa topilmadi</p>
          <p>
            {query
              ? `"${query}" bo'yicha mos keluvchi postlar mavjud emas. Iltimos, boshqa so'z bilan qidiring.`
              : "Hozircha postlar mavjud emas."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                    <h3 className="font-semibold">{post.user.username}</h3>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLike(post.id)}
                      className="hover:text-white"
                    >
                      <Heart className={post.hasLiked ? "fill-red-500 text-red-500" : ""} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-white"
                      onClick={() => router.push(`/post/${post.id}`)}
                    >
                      <MessageCircle />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-white">
                      <Send />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmark(post.id)}
                    className="hover:text-white"
                  >
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
        </div>
      )}
      {loading && <div className="text-center py-4">Yuklanmoqda...</div>}
      {!hasMore && <div className="text-center py-4">Boshqa post yo'q</div>}
      <div ref={ref} className="h-10" />
    </div>
  )
}