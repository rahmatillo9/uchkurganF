"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/darck-mode";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PostsAll } from "@/components/allPosts";

export default function Page() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("AllPost"); // Default sahifa

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <SidebarProvider value={{ activePage, setActivePage }}>
      <div className="flex w-full">
        <AppSidebar onSelect={setActivePage} /> 
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <ModeToggle 
            />
          </header>

          {/* Asosiy kontent */}
          <div className="flex  justify-center w-full items-center">
            <PostsAll/>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
