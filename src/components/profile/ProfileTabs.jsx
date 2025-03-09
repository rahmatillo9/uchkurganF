"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "./PostCard";
import UserList from "./UserList";
import API from "@/lib/axios";

export default function ProfileTabs({
  posts: initialPosts = [], // Dastlabki postlar uchun standart bo'sh massiv
  savedPosts: initialSavedPosts = [], // Dastlabki saqlangan postlar uchun standart bo'sh massiv
  followers,
  following,
  user,
  handleLike,
  handleBookmark,
  handleToggleFollow,
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [savedPosts, setSavedPosts] = useState(initialSavedPosts);
  const [loading, setLoading] = useState(false);

  // Userga tegishli postlarni olish
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.id) return; // Agar user ID bo'lmasa, hech narsa qilmaymiz

      setLoading(true);
      try {
        // Userning postlarini olish
        const postsResponse = await API.get(`/posts/user/${user.id}`);
        const userPosts = postsResponse.data;

        // Saqlangan postlarni olish
        const savedPostsResponse = await API.get(`/saved-posts/user/${user.id}`);
        const userSavedPosts = savedPostsResponse.data;

        // Postlar uchun qo'shimcha ma'lumotlarni olish (like, bookmark, va hokazo)
        const postsWithDetails = await Promise.all(
          userPosts.map(async (post) => {
            const [likeResponse, bookmarkResponse] = await Promise.all([
              API.get(`/likes/user/${user.id}/post/${post.id}`),
              API.get(`/saved-posts/user/${user.id}/post/${post.id}`),
            ]);
            return {
              ...post,
              hasLiked: likeResponse.data.hasLiked,
              likesCount: post.likes?.length || 0,
              commentsCount: post.comments?.length || 0,
              saved: bookmarkResponse.data.hasPost,
            };
          })
        );

        setPosts(postsWithDetails);
        setSavedPosts(userSavedPosts);
      } catch (error) {
        console.error("Postlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?.id]);




  const handleDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
    setSavedPosts(savedPosts.filter((post) => post.id !== postId));
  };

  return (
    <Tabs defaultValue="posts" className="mt-8">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="posts">Postlar</TabsTrigger>
        <TabsTrigger value="save">Saqlangan</TabsTrigger>
        <TabsTrigger value="followers">Followerlar</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <div className="space-y-4 mt-4">
          {loading ? (
            <p>Yuklanmoqda...</p>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                handleLike={handleLike}
                handleBookmark={handleBookmark}
                handleDelete={handleDelete}
              />
            ))
          ) : (
            <p>Postlar mavjud emas</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="save">
        <div className="space-y-4 mt-4">
          {loading ? (
            <p>Yuklanmoqda...</p>
          ) : savedPosts && savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={post.user || user} // Saqlangan postlar uchun muallif
                handleLike={handleLike}
                handleBookmark={handleBookmark}
                handleDelete={handleDelete}
              />
            ))
          ) : (
            <p>Saqlangan postlar mavjud emas</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="followers">
        <UserList
          users={followers}
          currentUserId={user.id}
          following={following}
          handleToggleFollow={handleToggleFollow}
        />
      </TabsContent>

      <TabsContent value="following">
        <UserList
          users={following}
          currentUserId={user.id}
          following={following}
          handleToggleFollow={handleToggleFollow}
        />
      </TabsContent>
    </Tabs>
  );
}