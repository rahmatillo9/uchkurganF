// components/profile/PostCard.jsx
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import API from "@/lib/axios";

export default function PostCard({ post, user, handleLike, handleBookmark, handleDelete }) {
  const router = useRouter();

  const handleDeleteClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    
    if (confirmed) {
      try {
        const response = await API.delete(`/posts/${post.id}`);
        
        if (response.data?.success || response.status === 200 || response.status === 204) {
          // handleDelete mavjud bo'lsa, uni chaqiramiz
          if (typeof handleDelete === "function") {
            handleDelete(post.id);
          } else {
            console.warn("handleDelete funksiyasi props sifatida berilmagan");
          }
        } else {
          console.error("Failed to delete post:", response.data);
        }
      } catch (error) {
        console.error("Error deleting post:", error.response?.data || error.message);
      }
    }
  }


  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-semibold">{user.username}</h3>
            <p className="text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        {/* Add Trash button - only show if user has permission to delete */}
        {user.id === post.user_id && ( // Assuming post.userId identifies the post owner
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            className="hover:text-red-500"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
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
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => handleLike(post.id)}
              className="hover:text-white"
            >
              <Heart className={post.hasLiked ? "fill-red-500 text-red-500" : ""} />
            </Button> */}
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