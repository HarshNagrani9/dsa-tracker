"use client";

import Link from "next/link";
import { NAV_ITEMS, APP_NAME, AppLogo } from "@/lib/constants";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./SidebarNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming user profile later
import { LogOut } from "lucide-react";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 group/sidebar-logo-link">
          <AppLogo className="h-8 w-8 text-primary group-hover/sidebar-logo-link:text-accent transition-colors" />
          <h1 className="text-xl font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarNav items={NAV_ITEMS} onLinkClick={() => setOpenMobile(false)} />
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto">
        <Separator className="my-2" />
         {/* Placeholder for user profile/logout - can be expanded later with Firebase Auth */}
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">User Name</span>
            <span className="text-xs text-muted-foreground">user@example.com</span>
          </div>
           <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden">
             <LogOut className="h-4 w-4" />
             <span className="sr-only">Log out</span>
           </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
