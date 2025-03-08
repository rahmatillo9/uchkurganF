// components/profile/PostCard.jsx
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post, user, handleLike, handleBookmark }) {
  const router = useRouter();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Avatar
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={() => router.push(`/profile/${user.id}`)}
          >
            <AvatarImage
              src={
                user.profile_image
                  ? `${process.env.NEXT_PUBLIC_API_URL}${user.profile_image}`
                  : "/placeholder-avatar.png"
              }
              alt={user.username}
              className="object-cover w-full h-full rounded-full"
            />
            <AvatarFallback className="rounded-full flex items-center justify-center w-full h-full">
              {user.username?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{user.username}</h3>
            <p className="text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <img
          src={
            post.images && post.images[0]?.image
              ? `${process.env.NEXT_PUBLIC_API_URL}${post.images[0].image}`
              : "/placeholder-image.png"
          }
          alt={`Post ${post.id}`}
          className="w-full h-auto object-cover"
          onError={(e) => (e.target.src = "/placeholder-image.png")}
        />
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
              onClick={() => router.push(`/post/${post.id}`)}
              className="hover:text-white"
            >
              <MessageCircle />
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
            <span className="font-semibold">{user.username}</span> {post.caption}
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
  );
}