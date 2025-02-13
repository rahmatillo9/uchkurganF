"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { jwtDecode } from "jwt-decode"
import API from "@/lib/axios"

const MAX_FILE_SIZE = 7000000 // 7MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const formSchema = z.object({
  category_id: z.string().min(1, "Kategoriya tanlash shart"),
  title: z.string().min(2, "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak"),
  content: z.string().min(10, "Mazmun kamida 10 ta belgidan iborat bo'lishi kerak"),
  contact_info: z.string().min(5, "Aloqa ma'lumotlari kamida 5 ta belgidan iborat bo'lishi kerak"),
  image: z
    .any()
    .refine((file) => file instanceof File, "Rasm yuklash shart")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Maksimal rasm hajmi 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Faqat .jpg, .jpeg, .png va .webp formatidagi rasmlar qabul qilinadi",
    ),
})

export function CreatePostButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [userId, setUserId] = useState(null)
  const [token, setToken] = useState(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: "",
      title: "",
      content: "",
      contact_info: "",
      image: undefined,
    },
  })

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      console.error("Token topilmadi.")
      return
    }

    try {
      const decodedToken = jwtDecode(storedToken)
      setToken(storedToken)
      if (decodedToken?.id) {
        setUserId(decodedToken.id)
      } else {
        console.error("Token ichida id topilmadi:", decodedToken)
      }
    } catch (error) {
      console.error("Tokenni dekod qilishda xatolik:", error)
    }
  }, [])

  const handleImageChange = (e, onChange) => {
    const file = e.target.files[0]
    if (file) {
      onChange(file) // Update form value
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values) => {
    try {
      if (!userId || !token) {
        toast({
          title: "Foydalanuvchi aniqlanmadi",
          description: "Iltimos, qaytadan tizimga kiring.",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("user_id", userId)
      formData.append("category_id", values.category_id)
      formData.append("title", values.title)
      formData.append("content", values.content)
      formData.append("contact_info", values.contact_info)
      formData.append("image", values.image)

      const response = await API.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        toast({
          title: "Post muvaffaqiyatli yaratildi",
          description: "Sizning postingiz muvaffaqiyatli yuklandi",
        })

        setIsOpen(false)
        form.reset()
        setImagePreview(null)
      }
    } catch (error) {
      console.error("Postni yuklashda xatolik:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: "Postni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    form.reset()
    setImagePreview(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>

<DialogTrigger asChild>
  <Button variant="outline" onClick={() => setIsOpen(true)}>Yangi post yaratish</Button>
</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yangi post yaratish</DialogTitle>
          <DialogDescription>
            Post yaratish uchun quyidagi formani to'ldiring. Barcha maydonlar to'ldirilishi shart.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Button type="submit">Post yaratish</Button>
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoriya</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategoriyani tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Bozor</SelectItem>
                      <SelectItem value="2">Taksi</SelectItem>
                      <SelectItem value="3">O'quv markazlar</SelectItem>
                      <SelectItem value="4">Ish</SelectItem>
                      <SelectItem value="5">Boshqa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sarlavha</FormLabel>
                  <FormControl>
                    <Input placeholder="Post sarlavhasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mazmun</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Post mazmunini kiriting" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aloqa ma'lumotlari</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefon raqam yoki email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Rasm</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => handleImageChange(e, onChange)}
                        {...field}
                      />
                      {imagePreview && (
                        <div className="relative w-full h-48">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="rounded-md object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
       
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

