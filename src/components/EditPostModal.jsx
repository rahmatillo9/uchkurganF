"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import API from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"

const MAX_FILE_SIZE = 7000000 // 7MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg"]

const formSchema = z.object({
  category_id: z.string().min(1, "Kategoriya tanlash shart"),
  title: z.string().min(2, "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak"),
  content: z.string()
    .min(10, "Mazmun kamida 10 ta belgidan iborat bo'lishi kerak")
    .max(255, "Mazmun 255 belgidan oshmasligi kerak"),
  contact_info: z.string().min(5, "Aloqa ma'lumotlari kamida 5 ta belgidan iborat bo'lishi kerak"),
  image: z.any()
})

export default function EditPostModal({ post, isOpen, onClose, onUpdate }) {
  const { toast } = useToast()
  const [imagePreview, setImagePreview] = useState(post?.image || null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: post?.category_id || "",
      title: post?.title || "",
      content: post?.content || "",
      contact_info: post?.contact_info || "",
      image: undefined,
    },
  })

  useEffect(() => {
    if (post) {
      form.reset({
        category_id: post.category_id || "",
        title: post.title || "",
        content: post.content || "",
        contact_info: post.contact_info || "",
        image: undefined,
      })
      setImagePreview(post.image || null)
    }
  }, [post, form])

  const handleImageChange = (e, onChange) => {
    const file = e.target.files[0]
    if (file) {
      onChange(file) // Formni yangilaymiz
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values) => {
    try {
      const formData = new FormData()
      formData.append("category_id", values.category_id)
      formData.append("title", values.title)
      formData.append("content", values.content)
      formData.append("contact_info", values.contact_info)
      if (values.image instanceof File) {
        formData.append("image", values.image)
      }

      const response = await API.put(`/posts/${post.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data) {
        toast({
          title: "Muvaffaqiyatli yangilandi",
          description: "Post yangilandi",
        })
        onUpdate(response.data) // Yangilangan postni parent komponentga uzatamiz
        onClose()
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Postni yangilashda muammo yuz berdi.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Postni tahrirlash</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="3">O‘quv markazlar</SelectItem>
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
              render={({ field: { onChange, ...field } }) => (
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
            <DialogFooter>
              <Button type="submit">Saqlash</Button>
              <Button variant="outline" onClick={onClose}>
                Bekor qilish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
