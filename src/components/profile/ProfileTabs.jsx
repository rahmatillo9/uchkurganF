// components/profile/ProfileTabs.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "./PostCard";
import UserList from "./UserList";

export default function ProfileTabs({
  posts,
  savedPosts,
  followers,
  following,
  user,
  handleLike,
  handleBookmark,
  handleToggleFollow,
}) {
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
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              handleLike={handleLike}
              handleBookmark={handleBookmark}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="save">
        <div className="space-y-4 mt-4">
          {Array.isArray(savedPosts) && savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={post.user} // Saqlangan postlar uchun muallif
                handleLike={handleLike}
                handleBookmark={handleBookmark}
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