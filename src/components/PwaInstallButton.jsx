"use client";

import { useEffect, useState } from "react";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Avtomatik taklifni to‘xtatish
      setDeferredPrompt(e); // Hodisani saqlash
      setIsInstallable(true); // Tugmani ko‘rsatish uchun holatni o‘zgartirish
      console.log("beforeinstallprompt hodisasi ishga tushdi:", e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // App o‘rnatilganligini aniqlash uchun qo‘shimcha hodisa
    window.addEventListener("appinstalled", () => {
      console.log("PWA muvaffaqiyatli o‘rnatildi");
      setDeferredPrompt(null);
      setIsInstallable(false); // Tugmani yashirish
    });

    // Tozalash funksiyasi
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log("deferredPrompt null, o‘rnatish mumkin emas");
      return; // Agar hodisa yo‘q bo‘lsa, xabar chiqarib to‘xtatish
    }

    try {
      console.log("O‘rnatish taklifi ko‘rsatilmoqda...");
      deferredPrompt.prompt(); // Foydalanuvchiga o‘rnatish taklifini ko‘rsatish

      // Foydalanuvchi tanlovini kutish
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Foydalanuvchi tanlovi:", outcome); // Tanlovni konsolda ko‘rsatish
      if (outcome === "accepted") {
        console.log("Foydalanuvchi ilovani o‘rnatdi");
      } else {
        console.log("Foydalanuvchi o‘rnatishni rad etdi");
      }

      // Holatni tozalash
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error("O‘rnatish jarayonida xato yuz berdi:", error);
    }
  };

  // Agar brauzer PWA-ni qo‘llab-quvvatlamasa yoki tugma ko‘rsatilmasa
  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      📥 Ilovani o‘rnatish
    </button>
  );
}