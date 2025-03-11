import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token); // Token bor yoki yo‘qligini tekshirish

    if (!token) {

      router.push("/register");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken); // Token dekod qilinganini tekshirish

      // Token muddati tugaganligini tekshirish
      if (decodedToken.exp * 1000 < Date.now()) {
        console.log("Token muddati tugagan, /login ga yo‘naltirilmoqda");
        localStorage.removeItem("token");
        router.push("/register");
        return;
      }

      // User ID ni saqlash
      console.log("Token yaroqli, userId saqlanmoqda");
      localStorage.setItem("userId", decodedToken.id);
    } catch (error) {
      console.error("Tokenni decode qilishda xatolik:", error);
      localStorage.removeItem("token");
      router.push("/register");
    }
  }, [router]);

  return null; // Hook hech narsa qaytarmasa ham bo‘ladi, lekin null qo‘shdim
};

export default useAuth;