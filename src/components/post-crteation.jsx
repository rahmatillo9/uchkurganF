"use client"

import { useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"
import API from "@/lib/axios"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import heic2any from "heic2any"
import useAuth from "./useAuth"

const PostCreation = () => {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [userId, setUserId] = useState(null);
  const [postId, setPostId] = useState(null);
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);


  useAuth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
        console.log("Decoded Token:", decodedToken);
      } catch (error) {
        console.error("Token dekodlashda xatolik:", error);
        toast.error("Sessiya xatosi. Qayta kiring!");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handlePostCreation = async (e) => {
    e.preventDefault();

    if (!caption.trim()) {
      toast.error("Iltimos, post matnini kiriting");
      return;
    }

    if (caption.length > 255) {
      toast.error("Post matni 255 belgidan oshmasligi kerak");
      return;
    }

    try {
      const response = await API.post("/posts", { user_id: userId, caption });
      setPostId(response.data.id);
      setIsBottomSheetOpen(true);
      toast.success("Post muvaffaqiyatli yaratildi");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Noto'g'ri ma'lumotlar kiritildi!";
      toast.error(errorMessage);
      console.error("Post yaratish xatosi:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      toast.error("Iltimos, rasm tanlang");
      return;
    }
    if (images.length >= 5) {
      toast.error("Bir postga faqat 5 ta rasm yuklash mumkin");
      return;
    }

    setIsUploading(true);
    let finalFile = file;

    if (file.type === "image/heic" || file.type === "image/heif" || file.name.match(/\.(heic|heif)$/i)) {
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        finalFile = new File([convertedBlob], `${file.name.split('.')[0]}.jpg`, {
          type: "image/jpeg",
        });
        toast.info("HEIF fayl JPEG ga aylantirildi");
      } catch (error) {
        toast.error("HEIF faylni konvertatsiya qilishda xatolik");
        console.error("HEIF konvertatsiya xatosi:", error);
        setIsUploading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("post_id", postId);
      formData.append("image", finalFile);

      await API.post("/post-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages([...images, URL.createObjectURL(finalFile)]);
      toast.success("Rasm muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error("Rasm yuklashda xatolik yuz berdi");
      console.error("Rasm yuklash xatosi:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-full ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} transition-all duration-300`}>
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-700 w-full">
        <div className="flex items-center gap-2">
          <Camera className="h-8 w-8 text-pink-500" />
          <h1 className="text-xl font-bold">Yangi Post</h1>
        </div>
        <Button
          variant="ghost"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-full hover:bg-gray-800 hover:text-pink-500 transition-colors"
        >
          {darkMode ? "☀️" : "🌙"}
        </Button>
      </header>

      {/* Forma */}
      <form onSubmit={handlePostCreation} className="flex-grow p-4 space-y-6 w-full">
        <div className="relative">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Postingiz haqida yozing..."
            maxLength={255} // Belgilar sonini cheklash
            className={`w-full h-40 rounded-xl border-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-black"} resize-none shadow-lg focus:ring-4 focus:ring-pink-500/50 focus:border-pink-500 transition-all ${caption.length > 255 ? "border-red-500" : ""}`}
          />
          <div className="text-sm text-gray-500 mt-1">
            {caption.length}/255 belgi
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Post yaratish
        </Button>
      </form>

      {/* Bottom Sheet */}
      <Sheet open={isBottomSheetOpen} onOpenChange={setIsBottomSheetOpen}>
        <SheetContent side="bottom" className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} h-[70vh] rounded-t-3xl shadow-2xl border-t border-gray-700 w-full`}>
          <SheetTitle className="sr-only">Rasmlar yuklash</SheetTitle>
          <div className="flex flex-col h-full p-6 w-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="h-3 w-3 bg-pink-500 rounded-full animate-pulse"></span>
              Rasmlar yuklash
            </h2>
            <div className="flex-grow overflow-y-auto w-full">
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Yuklangan rasm ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl shadow-md transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
                {images.length < 5 && (
                  <div className={`w-full h-32 rounded-xl border-dashed border-2 ${darkMode ? "border-gray-600" : "border-gray-300"} flex items-center justify-center text-gray-500 hover:border-pink-500 transition-colors`}>
                    <span>+ Rasm</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 space-y-4 w-full">
              <input
                type="file"
                accept="image/*, .heic, .heif"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                disabled={isUploading || images.length >= 5}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="block w-full">
                <Button
                  asChild
                  disabled={isUploading || images.length >= 5}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span>{isUploading ? "Yuklanmoqda..." : "Rasm qo'shish"}</span>
                </Button>
              </label>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Tugatish
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PostCreation;