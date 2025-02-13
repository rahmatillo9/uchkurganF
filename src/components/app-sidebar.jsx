"use client";
import * as React from "react";
import { NavUser } from "./user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { CreatePostButton } from "./CreateButton";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },


};

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CreatePostButton/>
      </SidebarHeader>
     
      <SidebarContent>
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button variant="outline" >Catigory</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => router.push('#') }>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('#') }>
              maktab
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('#') }>
              Taxi
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('#') }>
              Bozor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
