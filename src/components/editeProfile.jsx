"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import API from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export default function EditProfile() {
  const [userData, setUserData] = useState({
    fullname: "",
    nickname: "",
    email: "",
    profile_image: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No token found")

        const decodedToken = jwtDecode(token)
        const response = await API.get(`/users/${decodedToken.id}`)
        setUserData(response.data)
      } catch (error) {
        setError(error.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const decodedToken = jwtDecode(token)
      const formData = new FormData()

      formData.append("fullname", userData.fullname)
      formData.append("nickname", userData.nickname)
      formData.append("email", userData.email)
      if (newImage) {
        formData.append("profile_image", newImage)
      }

      await API.put(`/users/${decodedToken.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      router.push("/profile")
    } catch (error) {
      setError(error.message || "Failed to update profile")
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>

  const profileImage = userData.profile_image
    ? userData.profile_image.startsWith("http")
      ? userData.profile_image
      : `http://localhost:4000${userData.profile_image}`
    : null

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profileImage} />
            <AvatarFallback>{userData.nickname[0]}</AvatarFallback>
          </Avatar>
          <Label
            htmlFor="profile_image"
            className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Change Profile Picture
          </Label>
          <Input id="profile_image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullname">Full Name</Label>
          <Input
            id="fullname"
            name="fullname"
            value={userData.fullname}
            onChange={handleChange}
            placeholder="Full Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            name="nickname"
            value={userData.nickname}
            onChange={handleChange}
            placeholder="Nickname"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  )
}

