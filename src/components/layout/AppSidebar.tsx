
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

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
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
          {loading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-col gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </>
          ) : user ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate max-w-[120px]">{user.displayName || "User"}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden" onClick={signOutUser} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Avatar className="h-8 w-8">
                 <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden flex-1">
                 <Button onClick={signInWithGoogle} size="sm" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" /> Sign in
                 </Button>
              </div>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
