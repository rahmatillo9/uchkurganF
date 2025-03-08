// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Image from "next/image"
// import { jwtDecode } from "jwt-decode"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import API from "@/lib/axios"
// import { toast } from "sonner"
// import useAuth from "./useAuth"

// export default function ProfilePage() {
//   const router = useRouter()
//   const [user, setUser] = useState(null)
//   const [posts, setPosts] = useState([])
//   const [followers, setFollowers] = useState([])
//   const [following, setFollowing] = useState([])
//   const [editMode, setEditMode] = useState(false)
//   const [newBio, setNewBio] = useState("")
//   const [newProfileImage, setNewProfileImage] = useState(null)


//   useAuth
//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       const decodedToken = jwtDecode(token)
//       fetchUserData(decodedToken.id)
//       fetchUserPosts(decodedToken.id)
//       fetchFollowers(decodedToken.id)
//       fetchFollowing(decodedToken.id)
//     } else {
//       router.push("/login")
//     }
//   }, [router])

//   const fetchUserData = async (userId) => {
//     try {
//       const response = await API.get(`/users/${userId}`)
//       setUser(response.data)
//       setNewBio(response.data.bio)
//     } catch (error) {
//       console.error("Foydalanuvchi ma'lumotlarini olishda xatolik:", error)
//       toast.error("Foydalanuvchi ma'lumotlarini olishda xatolik yuz berdi")
//     }
//   }

//   const fetchUserPosts = async (userId) => {
//     try {
//       const response = await API.get(`/posts/user/${userId}`)
//       setPosts(response.data)
//     } catch (error) {
//       console.error("Foydalanuvchi postlarini olishda xatolik:", error)
//       toast.error("Foydalanuvchi postlarini olishda xatolik yuz berdi")
//     }
//   }

//   const fetchFollowers = async (userId) => {
//     try {
//       const response = await API.get(`/followers/followers/${userId}`)
//       setFollowers(response.data)
//     } catch (error) {
//       console.error("Followerlarni olishda xatolik:", error)
//       toast.error("Followerlarni olishda xatolik yuz berdi")
//     }
//   }

//   const fetchFollowing = async (userId) => {
//     try {
//       const response = await API.get(`/followers/following/${userId}`)
//       setFollowing(response.data)
//     } catch (error) {
//       console.error("Followinglarni olishda xatolik:", error)
//       toast.error("Followinglarni olishda xatolik yuz berdi")
//     }
//   }

//   const handleProfileUpdate = async () => {
//     try {
//       const formData = new FormData()
//       formData.append("bio", newBio)
//       if (newProfileImage) {
//         formData.append("profile_image", newProfileImage)
//       }

//       await API.put(`/users/${user.id}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       })

//       fetchUserData(user.id)
//       setEditMode(false)
//       toast.success("Profil muvaffaqiyatli yangilandi")
//     } catch (error) {
//       console.error("Profilni yangilashda xatolik:", error)
//       toast.error("Profilni yangilashda xatolik yuz berdi")
//     }
//   }

//   if (!user) {
//     return <div>Yuklanmoqda...</div>
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
//         <Avatar className="w-32 h-32 md:w-40 md:h-40">
//           <AvatarImage src={user.profile_image || "/placeholder-avatar.png"} alt={user.username} />
//           <AvatarFallback>{user.username[0]}</AvatarFallback>
//         </Avatar>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
//           <div className="flex space-x-4 mb-4">
//             <span>
//               <strong>{posts.length}</strong> posts
//             </span>
//             <span>
//               <strong>{followers.length}</strong> followers
//             </span>
//             <span>
//               <strong>{following.length}</strong> following
//             </span>
//           </div>
//           {editMode ? (
//             <div className="space-y-2">
//               <Textarea
//                 value={newBio}
//                 onChange={(e) => setNewBio(e.target.value)}
//                 placeholder="Yangi bio"
//                 className="w-full"
//               />
//               <Input type="file" onChange={(e) => setNewProfileImage(e.target.files[0])} accept="image/*" />
//               <div className="flex space-x-2">
//                 <Button onClick={handleProfileUpdate}>Saqlash</Button>
//                 <Button variant="outline" onClick={() => setEditMode(false)}>
//                   Bekor qilish
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <>
//               <p className="mb-2">{user.bio}</p>
//               <Button onClick={() => setEditMode(true)}>Profilni tahrirlash</Button>
//             </>
//           )}
//         </div>
//       </div>

//       <Tabs defaultValue="posts" className="mt-8">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="posts">Postlar</TabsTrigger>
//           <TabsTrigger value="followers">Followerlar</TabsTrigger>
//           <TabsTrigger value="following">Following</TabsTrigger>
//         </TabsList>
//         <TabsContent value="posts">
//           <div className="grid grid-cols-3 gap-4 mt-4">
//             {posts.map((post) => (
//               <Card key={post.id} className="cursor-pointer" onClick={() => router.push(`/post/${post.id}`)}>
//                 <CardContent className="p-0">
//                   <Image
//                     src={`${process.env.NEXT_PUBLIC_API_URL}${post.images[0]?.image}`}
//                     alt={`Post ${post.id}`}
//                     width={300}
//                     height={300}
//                     className="w-full h-full object-cover"
//                   />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>
//         <TabsContent value="followers">
//           <div className="space-y-4 mt-4">
//             {followers.map((follower) => (
//               <div key={follower.follower_id} className="flex items-center space-x-4">
//                 <Avatar>
//                   <AvatarImage
//                     src={follower.follower.profile_image || "/placeholder-avatar.png"}
//                     alt={follower.follower.username}
//                   />
//                   <AvatarFallback>{follower.follower.username[0]}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="font-semibold">{follower.follower.username}</p>
//                   <p className="text-sm text-gray-500">{follower.follower.bio}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </TabsContent>
//         <TabsContent value="following">
//           <div className="space-y-4 mt-4">
//             {following.map((follow) => (
//               <div key={follow.following_id} className="flex items-center space-x-4">
//                 <Avatar>
//                   <AvatarImage
//                     src={follow.following.profile_image || "/placeholder-avatar.png"}
//                     alt={follow.following.username}
//                   />
//                   <AvatarFallback>{follow.following.username[0]}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <p className="font-semibold">{follow.following.username}</p>
//                   <p className="text-sm text-gray-500">{follow.following.bio}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

