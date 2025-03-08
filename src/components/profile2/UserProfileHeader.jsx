// components/profile/UserProfileHeader.jsx
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import API from "@/lib/axios";
import { toast } from "sonner";

export default function UserProfileHeader({ user, currentUserId, isFollowing, handleFollow }) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
      <Avatar
        className="w-32 h-32 md:w-40 md:h-40 cursor-pointer"
        onClick={() => router.push(`/profile/${user.id}`)}
      >
        <AvatarImage
          src={
            user.profile_image
              ? `${process.env.NEXT_PUBLIC_API_URL}${user.profile_image}`
              : "/placeholder-avatar.png"
          }
          alt={user.username}
          className="object-cover"
        />
        <AvatarFallback>{user.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-4 mb-2">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          {user.id !== currentUserId && (
            <Button
              variant="outline"
              onClick={() => handleFollow(user.id)}
            >
              {isFollowing ? "Obunani bekor qilish" : "Obuna bo‘lish"}
            </Button>
          )}
        </div>
        <p className="mb-2">{user.bio || "Bio mavjud emas"}</p>
      </div>
    </div>
  );
}