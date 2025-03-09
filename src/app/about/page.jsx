"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Users2, Code, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h1 className="text-4xl font-bold mb-4">Loyiha Haqida</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Bu loyiha ijtimoiy tarmoq platformasi sifatida 2025-yilda yaratildi. Maqsadim foydalanuvchilarga o'zlarining 
            postlari, rasmlari va tajribalarini ulashish uchun qulay muhit taqdim etish edi. Ushbu platformada har bir 
            foydalanuvchi o'z ijodini namoyish qilishi va boshqalar bilan bog'lanishi mumkin.
          </p>
        </div>
        <div className="relative h-[800px] rounded-lg overflow-hidden">
          <Image
            src="/platform-preview.jpg" // Loyihangizga mos rasm qo'yishingiz mumkin
            alt="Platform Preview"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 hover:bg-blue-500">
            <Users2 className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">
              <CountUp end={500} duration={2.5} separator="," />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Foydalanuvchilar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 hover:bg-blue-500">
            <Code className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">
              <CountUp end={1000} duration={2.5} separator="," />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Postlar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 hover:bg-blue-500">
            <Briefcase className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">
              <CountUp end={2} duration={2.5} />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Muvaffaqiyatli loyihalar</p>
          </CardContent>
        </Card>
      </div>

      {/* Developer Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Men Haqimda</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card>
            <CardContent className="p-6">
              <div className="relative h-[800px] mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/Butcher.jpg" // O'zingizning rasmingizni qo'yishingiz mumkin
                  alt="Developer"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Butcher</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Men Butcher, dasturchiman va ushbu ijtimoiy tarmoq loyihasining muallifiman. 
                Web-dasturlash bo'yicha tajribam bor va foydalanuvchilar uchun qulay interfeyslar 
                yaratishga intilaman.
              </p>
              <Button asChild variant="outline">
                <a href="https://butcher4.uz" target="_blank" rel="noopener noreferrer">
                  Portfolimga o'tish
                </a>
              </Button>
            </CardContent>
          </Card>
          <div>
            <p className="text-gray-600 dark:text-gray-300">
              Men bu loyihani yaratishda zamonaviy texnologiyalardan, masalan, Next.js, React va 
              Tailwind CSS dan foydalandim. Maqsadim foydalanuvchilarga tez va ishonchli platforma 
              taqdim etish edi. Agar mening boshqa ishlarim bilan qiziqsangiz, portfolimga tashrif buyuring!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}