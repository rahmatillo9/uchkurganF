"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import API from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import useAuth from "./useAuth";

const AllPostsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  // useAuth chaqirish
  useAuth();

  const sendNotification = async (type, postId = null, recipientId = null) => {
    try {
      const currentUserId = localStorage.getItem("userId");
      const notificationData = {
        user_id: recipientId || posts.find((p) => p.id === postId)?.user?.id,
        from_user_id: currentUserId,
        type: type,
        ...(postId && { post_id: postId }),
      };

      await API.post("/notifications", notificationData);
    } catch (error) {
      console.error("Notifikatsiya yuborishda xatolik:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
        localStorage.setItem("userId", decodedToken.id);
      } catch (error) {
        console.error("Token dekodlashda xatolik:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId || loading) return;

      setLoading(true);
      try {
        const response = await API.get("/posts"); // Barcha postlarni olish
        const newPosts = response.data;

        if (!newPosts || newPosts.length === 0) {
          setPosts([]);
          return;
        }

        const postsWithDetails = await Promise.all(
          newPosts.map(async (post) => {
            const [likeResponse, bookmarkResponse, followResponse] = await Promise.all([
              API.get(`/likes/user/${userId}/post/${post.id}`),
              API.get(`/saved-posts/user/${userId}/post/${post.id}`),
              API.get(`/followers/check?follower_id=${userId}&following_id=${post.user?.id}`),
            ]);
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
            };
          })
        );

        setPosts(postsWithDetails);
      } catch (error) {
        console.error("Postlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const handleLike = async (postId) => {
    try {
      const currentUserId = localStorage.getItem("userId");
      const post = posts.find((p) => p.id === postId);

      if (!post) return;

      await API.post("/likes", { userId: currentUserId, postId });

      if (!post.hasLiked) {
        await sendNotification("like", postId);
      }

      const updatedPosts = posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasLiked: !p.hasLiked,
              likesCount: p.hasLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Like qo'yishda xatolik:", error);
    }
  };

  const handleFollow = async (followingId) => {
    try {
      const followerId = localStorage.getItem("userId");
      await API.post("/followers/toggle", {
        follower_id: followerId,
        following_id: followingId,
      });

      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          if (post.user?.id === followingId) {
            const isNowFollowing = !post.user.isFollowing;
            if (isNowFollowing) {
              await sendNotification("follow", null, followingId);
            }
            return {
              ...post,
              user: {
                ...post.user,
                isFollowing: isNowFollowing,
              },
            };
          }
          return post;
        })
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Follow/Unfollow qilishda xatolik:", error);
    }
  };

  const handleCommentClick = (postId) => {
    router.push(`/post/${postId}`);
  };

  const handleBookmark = async (postId) => {
    try {
      const currentUserId = localStorage.getItem("userId");
      const post = posts.find((p) => p.id === postId);

      if (!post) return;

      if (post.saved) {
        await API.delete(`/saved-posts/unsave/${currentUserId}/${postId}`);
      } else {
        await API.post("/saved-posts/save", { user_id: currentUserId, post_id: postId });
      }

      const updatedPosts = posts.map((p) =>
        p.id === postId ? { ...p, saved: !p.saved } : p
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Bookmark qilishda xatolik:", error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this post?");
      if (confirmed) {
        const response = await API.delete(`/posts/${postId}`);
        if (response.status === 200 || response.status === 204) {
          setPosts(posts.filter((post) => post.id !== postId));
        }
      }
    } catch (error) {
      console.error("Post o'chirishda xatolik:", error);
    }
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden">
      {loading && <div className="text-center py-4">Yuklanmoqda...</div>}
      {!loading && posts.length === 0 && (
        <div className="text-center py-4">Hech qanday post topilmadi</div>
      )}
      {!loading &&
        posts.map((post) => (
          <Card key={post.id} className="border border-gray-800 max-w-2xl mx-auto mb-4 rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Avatar
                  className="w-12 h-12 rounded-full"
                  onClick={() => router.push(`/userProfile/${post.user?.id}`)}
                >
                  <AvatarImage
                    src={
                      post.user?.profile_image
                        ? `${process.env.NEXT_PUBLIC_API_URL}${post.user.profile_image}`
                        : "/placeholder-avatar.png"
                    }
                    alt={post.user?.username || "User"}
                    className="object-cover w-full h-full rounded-full"
                  />
                  <AvatarFallback className="rounded-full flex items-center justify-center w-full h-full">
                    {post.user?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{post.user?.username || "Unknown"}</h3>
                    {post.user?.id !== userId && (
                      <Button
                        variant="link"
                        className={
                          post.user?.isFollowing ? "text-gray-500 p-0" : "text-blue-500 p-0"
                        }
                        onClick={() => handleFollow(post.user?.id)}
                      >
                        {post.user?.isFollowing ? "Obunani bekor qilish" : "Obuna bo`lish"}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {post.user?.id === userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                    className="hover:text-red-500"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-6 h-6" />
                </Button>
              </div>
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
                            console.error(
                              "Rasm yuklanmadi:",
                              `${process.env.NEXT_PUBLIC_API_URL}${image.image}`
                            );
                            e.target.src = "/placeholder-image.png";
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
                    onClick={() => handleCommentClick(post.id)}
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
                  <span className="font-semibold">{post.user?.username || "Unknown"}</span>{" "}
                  {post.caption}
                </p>
                {post.commentsCount > 0 && (
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => router.push(`/post/${post.id}`)}
                  >
                    View all {post.commentsCount} comments
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
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
                  console.error(
                    "Modal rasm yuklanmadi:",
                    `${process.env.NEXT_PUBLIC_API_URL}${selectedImage.image}`
                  );
                  e.target.src = "/placeholder-image.png";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllPostsFeed;