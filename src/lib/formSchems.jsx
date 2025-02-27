import * as z from "zod"
export const formSchema = z.object({
    category_id: z.string().min(1, "Kategoriya tanlash shart"),
    title: z.string().min(2, "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak"),
    content: z.string()
      .min(10, "Mazmun kamida 10 ta belgidan iborat bo'lishi kerak")
      .max(255, "Mazmun 255 belgidan oshmasligi kerak"),
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
  