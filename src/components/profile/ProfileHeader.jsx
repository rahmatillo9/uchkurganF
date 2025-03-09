import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import API from "@/lib/axios";
import heic2any from "heic2any";

export default function ProfileHeader({ user, setUser, fetchUserData }) {
  const [editMode, setEditMode] = useState(false);
  const [newBio, setNewBio] = useState(user?.bio || "");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfileUpdate = async () => {
    if (isUploading) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      
      // Always include the bio
      formData.append("bio", newBio);

      // Handle image upload with HEIC conversion
      if (newProfileImage) {
        let finalFile = newProfileImage;

        // Check if the file is HEIC/HEIF
        if (
          newProfileImage.type === "image/heic" || 
          newProfileImage.type === "image/heif" || 
          newProfileImage.name.match(/\.(heic|heif)$/i)
        ) {
          try {
            const convertedBlob = await heic2any({
              blob: newProfileImage,
              toType: "image/jpeg",
              quality: 0.8,
            });
            finalFile = new File(
              [convertedBlob], 
              `${newProfileImage.name.split('.')[0]}.jpg`, 
              { type: "image/jpeg" }
            );
            toast.info("HEIF fayl JPEG ga aylantirildi");
          } catch (error) {
            toast.error("HEIF faylni konvertatsiya qilishda xatolik");
            console.error("HEIF konvertatsiya xatosi:", error);
            setIsUploading(false);
            return;
          }
        }

        formData.append("profile_image", finalFile);
      }

      const response = await API.put(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update local state with the response
      setUser(prevUser => ({
        ...prevUser,
        bio: newBio,
        profile_image: newProfileImage ? response.data.profile_image : prevUser.profile_image
      }));

      fetchUserData(user.id);
      setEditMode(false);
      setNewProfileImage(null);
      toast.success("Profil muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error("Profilni yangilashda xatolik:", error);
      toast.error("Profilni yangilashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
      <Avatar className="w-32 h-32 md:w-40 md:h-40">
        <AvatarImage
          src={
            newProfileImage
              ? URL.createObjectURL(newProfileImage)
              : user.profile_image
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
              accept="image/*,.heic,.heif"
              disabled={isUploading}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleProfileUpdate} 
                disabled={isUploading}
              >
                {isUploading ? "Yuklanmoqda..." : "Saqlash"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditMode(false);
                  setNewBio(user.bio || "");
                  setNewProfileImage(null);
                }}
                disabled={isUploading}
              >
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