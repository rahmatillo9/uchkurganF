// components/profile/UserList.jsx
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserList({ users, currentUserId, following, handleFollow }) {
  const router = useRouter();

  return (
    <div className="space-y-4 mt-4">
      {Array.isArray(users) && users.length > 0 ? (
        users.map((user) => (
          <div key={user.id} className="flex items-center justify-between space-x-4">
            <div
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => router.push(`/userProfile/${user.id}`)}
            >
              <Avatar className="w-12 h-12 rounded-full">
                <AvatarImage
                  src={
                    user.profile_image
                      ? `${process.env.NEXT_PUBLIC_API_URL}${user.profile_image}`
                      : "/placeholder-avatar.png"
                  }
                  alt={user.username}
                  className="object-cover rounded-full"
                />
                <AvatarFallback className="rounded-full flex items-center justify-center">
                  {user.username[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-gray-500">{user.bio || "Bio mavjud emas"}</p>
              </div>
            </div>
            {/* {user.id !== currentUserId && (
              <Button
                variant="outline"
                onClick={() => handleFollow(user.id)}
              >
                {following.some((f) => f.id === user.id) ? "Obunani bekor qilish" : "Obuna bo'lish"}
              </Button>
            )} */}
          </div>
        ))
      ) : (
        <p>Ro‘yxat mavjud emas</p>
      )}
    </div>
  );
}