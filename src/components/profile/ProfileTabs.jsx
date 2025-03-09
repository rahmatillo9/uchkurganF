// components/profile/ProfileTabs.jsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "./PostCard";
import UserList from "./UserList";

export default function ProfileTabs({
  posts: initialPosts, // Dastlabki postlar
  savedPosts: initialSavedPosts, // Dastlabki saqlangan postlar
  followers,
  following,
  user,
  handleLike,
  handleBookmark,
  handleToggleFollow,
}) {
  // Postlar va saqlangan postlar uchun lokal holat
  const [posts, setPosts] = useState(initialPosts || []); // Bo'sh massiv standart qiymat
  const [savedPosts, setSavedPosts] = useState(initialSavedPosts || []); // Bo'sh massiv standart qiymat

  // Debugging uchun log
  console.log("initialPosts:", initialPosts);
  console.log("posts:", posts);
  console.log("initialSavedPosts:", initialSavedPosts);
  console.log("savedPosts:", savedPosts);

  // Postni o'chirish funksiyasi
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
          {posts && posts.length > 0 ? (
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
          {savedPosts && savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={post.user} // Saqlangan postlar uchun muallif
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