// pages/profile/[userId].jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import UserProfileHeader from "@/components/profile2/UserProfileHeader";
import UserProfileTabs from "@/components/profile2/UserProfileTabs";
import API from "@/lib/axios";
import { toast } from "sonner";
import useAuth from "@/components/useAuth";

export default function UserProfilePage() {
  const router = useRouter();
  const { userId: profileUserId } = useParams(); // URL dan foydalanuvchi ID sini olamiz
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  useAuth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUserId(decodedToken.id);
      fetchProfileData(profileUserId, decodedToken.id);
    } else {
      router.push("/login");
    }
  }, [router, profileUserId]);

  const fetchProfileData = async (profileUserId, currentUserId) => {
    try {
      // Profil ma’lumotlari
      const userResponse = await API.get(`/users/${profileUserId}`);
      setProfileUser(userResponse.data);

      // Follow holatini tekshirish
      const followResponse = await API.get(
        `/followers/check?follower_id=${currentUserId}&following_id=${profileUserId}`
      );
      setIsFollowing(followResponse.data.isFollowing);

      // Postlarni olish
      const postsResponse = await API.get(`/posts/user/${profileUserId}`);
      const postsData = postsResponse.data;
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          const likeResponse = await API.get(`/likes/user/${currentUserId}/post/${post.id}`);
          const bookmarkResponse = await API.get(`/saved-posts/user/${currentUserId}/post/${post.id}`);
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

      // Followerlar va Followinglar
      const followersResponse = await API.get(`/followers?userId=${profileUserId}`);
      setFollowers(
        Array.isArray(followersResponse.data.followers)
          ? followersResponse.data.followers.map((item) => item.follower)
          : []
      );

      const followingResponse = await API.get(`/followers/following?userId=${profileUserId}`);
      setFollowing(
        Array.isArray(followingResponse.data.following)
          ? followingResponse.data.following.map((item) => item.following)
          : []
      );
    } catch (error) {
      console.error("Profil ma'lumotlarini olishda xatolik:", error);
      toast.error("Profil ma'lumotlarini olishda xatolik yuz berdi");
    }
  };

  const handleFollow = async (followingId) => {
    try {
      await API.post("/followers/toggle", {
        follower_id: currentUserId,
        following_id: followingId,
      });
      setIsFollowing(!isFollowing);
      fetchProfileData(profileUserId, currentUserId); // Follower va following ro‘yxatini yangilash
      toast.success(isFollowing ? "Obuna bekor qilindi" : "Obuna bo‘lindi");
    } catch (error) {
      console.error("Follow/Unfollowda xatolik:", error);
      toast.error("Follow/Unfollowda xatolik yuz berdi");
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await API.post("/likes", { userId: currentUserId, postId });
      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasLiked: !post.hasLiked,
              likesCount: post.hasLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Like qo‘yishda xatolik:", error);
      toast.error("Like qo‘yishda xatolik yuz berdi");
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const post = posts.find((p) => p.id === postId);
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
      toast.error("Bookmark qilishda xatolik yuz berdi");
    }
  };

  if (!profileUser) return <div>Yuklanmoqda...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileHeader
        user={profileUser}
        currentUserId={currentUserId}
        isFollowing={isFollowing}
        handleFollow={handleFollow}
      />
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
      <UserProfileTabs
        posts={posts}
        followers={followers}
        following={following}
        user={profileUser}
        currentUserId={currentUserId}
        handleLike={handleLike}
        handleBookmark={handleBookmark}
        handleFollow={handleFollow}
      />
    </div>
  );
}