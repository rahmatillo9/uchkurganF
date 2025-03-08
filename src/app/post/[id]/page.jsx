"use client"

import PostDetail from "@/components/post-detail"
import { useParams } from "next/navigation"

export default function PostPage() {
  const params = useParams()

  return <PostDetail postId={params.id} />
}

