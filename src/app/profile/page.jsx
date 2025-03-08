// pages/profile.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import API from "@/lib/axios";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      fetchUserData(decodedToken.id);
      fetchUserPosts(decodedToken.id);
      fetchSavedPosts(decodedToken.id);
      fetchFollowers(decodedToken.id);
      fetchFollowing(decodedToken.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchUserData = async (userId) => {
    try {
      const response = await API.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Foydalanuvchi ma'lumotlarini olishda xatolik:", error);
      toast.error("Foydalanuvchi ma'lumotlarini olishda xatolik yuz berdi");
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const response = await API.get(`/posts/user/${userId}`);
      const postsData = response.data;
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          const likeResponse = await API.get(`/likes/user/${userId}/post/${post.id}`);
          const bookmarkResponse = await API.get(`/saved-posts/user/${userId}/post/${post.id}`);
          return {
            ...post,
            hasLiked: likeResponse.data.hasLiked,
            likesCount: post.likes?.length || 0,
            commentsCount: post.comments?.length || 0,
            saved: bookmarkResponse.data.hasPost,
          };
        })
      );
      setPosts(Array.from(new Map(postsWithDetails.map((p) => [p.id, p])).values()));
    } catch (error) {
      console.error("Foydalanuvchi postlarini olishda xatolik:", error);
      toast.error("Foydalanuvchi postlarini olishda xatolik yuz berdi");
    }
  };

  const fetchSavedPosts = async (userId) => {
    try {
      const response = await API.get(`/saved-posts/user/${userId}`);
      const savedPostsData = response.data;
  
      // Backend javobini tekshirish uchun konsolga chiqaramiz
      console.log("Saved Posts Data:", savedPostsData);
  
      const postsWithDetails = await Promise.all(
        savedPostsData.map(async (savedPost) => {
          const post = savedPost.post;
  
          // Likes va bookmark holatini olish
          const likeResponse = await API.get(`/likes/user/${userId}/post/${post.id}`);
          const bookmarkResponse = await API.get(`/saved-posts/user/${userId}/post/${post.id}`);
  
          // Agar postda likes yoki comments massivlari yo‘q bo‘lsa, qo‘shimcha so‘rov yuboramiz
          let likesCount = post.likes?.length || 0;
          let commentsCount = post.comments?.length || 0;
  
          if (!post.likes || !post.comments) {
            try {
              const postDetails = await API.get(`/posts/${post.id}`);
              likesCount = postDetails.data.likes?.length || 0;
              commentsCount = postDetails.data.comments?.length || 0;
            } catch (err) {
              console.error(`Post ${post.id} ma'lumotlarini olishda xato:`, err);
            }
          }
  
          return {
            ...post,
            hasLiked: likeResponse.data.hasLiked || false,
            likesCount,
            commentsCount,
            saved: bookmarkResponse.data.hasPost || false,
          };
        })
      );
  
      const uniquePosts = Array.from(new Map(postsWithDetails.map((p) => [p.id, p])).values());
      setSavedPosts(uniquePosts);
    } catch (error) {
      console.error("Saqlangan postlarni olishda xatolik:", error);
      toast.error("Saqlangan postlarni olishda xatolik yuz berdi");
    }
  };

  const fetchFollowers = async (userId) => {
    try {
      const response = await API.get(`/followers?userId=${userId}`);
      setFollowers(
        Array.isArray(response.data.followers)
          ? response.data.followers.map((item) => item.follower)
          : []
      );
    } catch (error) {
      console.error("Followerlarni olishda xatolik:", error);
      setFollowers([]);
      toast.error("Followerlarni olishda xatolik yuz berdi");
    }
  };

  const fetchFollowing = async (userId) => {
    try {
      const response = await API.get(`/followers/following?userId=${userId}`);
      setFollowing(
        Array.isArray(response.data.following)
          ? response.data.following.map((item) => item.following)
          : []
      );
    } catch (error) {
      console.error("Followinglarni olishda xatolik:", error);
      setFollowing([]);
      toast.error("Followinglarni olishda xatolik yuz berdi");
    }
  };

  const handleToggleFollow = async (followingId) => {
    try {
      const response = await API.post("/followers/toggle", {
        follower_id: user.id,
        following_id: followingId,
      });
      fetchFollowers(user.id);
      fetchFollowing(user.id);
      toast.success(response.data.message || "Follow/Unfollow muvaffaqiyatli!");
    } catch (error) {
      console.error("Follow/Unfollowda xatolik:", error);
      toast.error("Follow/Unfollowda xatolik yuz berdi");
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await API.post("/likes", { userId: user.id, postId });
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
      const updatedSavedPosts = savedPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasLiked: !p.hasLiked,
              likesCount: p.hasLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      );
      setSavedPosts(updatedSavedPosts);
    } catch (error) {
      console.error("Like qo‘yishda xatolik:", error);
      toast.error("Like qo‘yishda xatolik yuz berdi");
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (post.saved) {
        await API.delete(`/saved-posts/unsave/${user.id}/${postId}`);
      } else {
        await API.post("/saved-posts/save", { user_id: user.id, post_id: postId });
      }
      const updatedPosts = posts.map((p) =>
        p.id === postId ? { ...p, saved: !p.saved } : p
      );
      setPosts(updatedPosts);
      const updatedSavedPosts = savedPosts.map((p) =>
        p.id === postId ? { ...p, saved: !p.saved } : p
      );
      setSavedPosts(updatedSavedPosts);
    } catch (error) {
      console.error("Bookmark qilishda xatolik:", error);
      toast.error("Bookmark qilishda xatolik yuz berdi");
    }
  };

  if (!user) return <div>Yuklanmoqda...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader user={user} setUser={setUser} fetchUserData={fetchUserData} />
      <div className="flex space-x-4 mb-4 mt-4">
        <span>
          <strong>{posts.length}</strong> posts
        </span>
        <span>
          <strong>{followers.length}</strong> followers
        </span>
        <span>
          <strong>{following.length}</strong> following
        </span>
      </div>
      <ProfileTabs
        posts={posts}
        savedPosts={savedPosts}
        followers={followers}
        following={following}
        user={user}
        handleLike={handleLike}
        handleBookmark={handleBookmark}
        handleToggleFollow={handleToggleFollow}
      />
    </div>
  );
}