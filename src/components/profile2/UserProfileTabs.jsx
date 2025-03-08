// components/profile/UserProfileTabs.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "./PostCard";
import UserList from "./UserList";

export default function UserProfileTabs({
  posts,
  followers,
  following,
  user,
  currentUserId,
  handleLike,
  handleBookmark,
  handleFollow,
}) {
  return (
    <Tabs defaultValue="posts" className="mt-8">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="posts">Postlar</TabsTrigger>
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

      <TabsContent value="followers">
        <UserList
          users={followers}
          currentUserId={currentUserId}
          following={following}
          handleFollow={handleFollow}
        />
      </TabsContent>

      <TabsContent value="following">
        <UserList
          users={following}
          currentUserId={currentUserId}
          following={following}
          handleFollow={handleFollow}
        />
      </TabsContent>
    </Tabs>
  );
}