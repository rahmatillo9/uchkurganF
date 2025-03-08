// components/profile/ProfileHeader.jsx
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import API from "@/lib/axios";

export default function ProfileHeader({ user, setUser, fetchUserData }) {
  const [editMode, setEditMode] = useState(false);
  const [newBio, setNewBio] = useState(user?.bio || "");
  const [newProfileImage, setNewProfileImage] = useState(null);

  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("bio", newBio);
      if (newProfileImage) formData.append("profile_image", newProfileImage);

      await API.put(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchUserData(user.id);
      setEditMode(false);
      toast.success("Profil muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error("Profilni yangilashda xatolik:", error);
      toast.error("Profilni yangilashda xatolik yuz berdi");
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
      <Avatar className="w-32 h-32 md:w-40 md:h-40">
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
        <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
        {editMode ? (
          <div className="space-y-2">
            <Textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Yangi bio"
              className="w-full"
            />
            <Input
              type="file"
              onChange={(e) => setNewProfileImage(e.target.files[0])}
              accept="image/*"
            />
            <div className="flex space-x-2">
              <Button onClick={handleProfileUpdate}>Saqlash</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Bekor qilish
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2">{user.bio || "Bio mavjud emas"}</p>
            <Button onClick={() => setEditMode(true)}>Profilni tahrirlash</Button>
          </>
        )}
      </div>
    </div>
  );
}