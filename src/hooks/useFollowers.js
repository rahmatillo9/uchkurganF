// src/hooks/useFollowers.js
import { useState, useEffect } from "react";
import API from "@/lib/axios";
import { toast } from "sonner";

export const useFollowers = (userId) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const fetchFollowers = async (id) => {
    try {
      const response = await API.get(`/followers?userId=${id}`);
      const uniqueFollowers = Array.from(
        new Map(response.data.map((f) => [f.follower_id, f])).values()
      );
      setFollowers(uniqueFollowers);
    } catch (error) {
      console.error("Followerlarni olishda xatolik:", error);
      toast.error("Followerlarni olishda xatolik yuz berdi");
    }
  };

  const fetchFollowing = async (id) => {
    try {
      const response = await API.get(`/followers/following?userId=${id}`);
      const uniqueFollowing = Array.from(
        new Map(response.data.map((f) => [f.following_id, f])).values()
      );
      setFollowing(uniqueFollowing);
    } catch (error) {
      console.error("Followinglarni olishda xatolik:", error);
      toast.error("Followinglarni olishda xatolik yuz berdi");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFollowers(userId);
      fetchFollowing(userId);
    }
  }, [userId]);

  return { followers, following, fetchFollowers, fetchFollowing };
};