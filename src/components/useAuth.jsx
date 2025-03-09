import { useEffect } from "react";

import {jwtDecode} from "jwt-decode";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      // Agar token muddati tugagan bo'lsa
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token"); // Eskirgan tokenni o‘chiramiz
        router.push("/login");
        return;
      }

      // User ID ni saqlash
      localStorage.setItem("userId", decodedToken.id);
    } catch (error) {
      console.error("Tokenni decode qilishda xatolik:", error);
      localStorage.removeItem("token"); // Yaroqsiz tokenni o‘chiramiz
      router.push("/login");
    }
  }, [router]);
};

export default useAuth;
