"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import API from "@/lib/axios"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await API.post("/auth/login", { username, password })
      console.log("Backend javobi:", response.data) // Javobni tekshirish uchun

      const { access_token: token } = response.data

      // Token mavjudligini tekshirish
      if (!token) {
        throw new Error("Token topilmadi. Backend javobini tekshiring.")
      }

      // Tokenni saqlash
      localStorage.setItem("token", token)
      
      // Asosiy sahifaga yo'naltirish
      toast.success("Tizimga muvaffaqiyatli kirdingiz!")
      router.push("/")
  
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Noto'g'ri ma'lumotlar kiritildi!"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Kirish xatosi:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-500 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex justify-center">
            <Camera className="h-12 w-12 text-pink-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Tizimga kirish</CardTitle>
          <CardDescription>
            Hisobingizga kirish uchun ma'lumotlaringizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Input
                id="username"
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-md border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-md border-gray-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={loading}
            >
              {loading ? "Kirish..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm">
          <div className="relative flex w-full items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <span className="relative bg-white dark:bg-black px-2 text-muted-foreground">
              yoki
            </span>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => router.push('/register')}
          >
            Ro'yxatdan o'tish
          </Button>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Parolni unutdingizmi?
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}