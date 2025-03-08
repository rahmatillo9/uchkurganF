"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import API from "@/lib/axios"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await API.post("/users", formData)
      setSuccess(true)

      // 2 soniyadan so'ng login sahifasiga yo'naltirish
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!")
      setTimeout(() => {
        router.push("/login")
       
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
       toast.error("Bunday foydalanuvchi oldin ro'yxatdan o'tgan")
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
          <CardTitle className="text-2xl font-bold">Ro'yxatdan o'tish</CardTitle>
          <CardDescription>Yangi hisob yaratish uchun ma'lumotlaringizni kiriting</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className=" border-green-200">
                <AlertDescription className="text-green-700">
                  Muvaffaqiyatli ro'yxatdan o'tdingiz! Login sahifasiga yo'naltirilmoqdasiz...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Input
                id="username"
                name="username"
                placeholder="Foydalanuvchi nomi"
                value={formData.username}
                onChange={handleChange}
                required
                className="rounded-md border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Elektron pochta"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-md border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Parol"
                value={formData.password}
                onChange={handleChange}
                required
                className="rounded-md border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                id="bio"
                name="bio"
                placeholder="Bio (ixtiyoriy)"
                value={formData.bio}
                onChange={handleChange}
                className="rounded-md border-gray-300 min-h-[80px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={loading}
            >
              {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm">
          <div className="relative flex w-full items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <span className="relative bg-white dark:bg-black px-2 text-muted-foreground">yoki</span>
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
            Hisobingiz bormi? Kirish
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

