
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarNavProps {
  items: NavItem[];
  onLinkClick?: () => void; // Optional: for mobile to close sidebar on click
}

export function SidebarNav({ items, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
        
        return (
          <SidebarMenuItem key={index}>
            <Link href={item.disabled ? "#" : item.href}>
              <SidebarMenuButton
                asChild
                variant="default"
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
                isActive={isActive}
                aria-disabled={item.disabled}
                onClick={onLinkClick}
                tooltip={{content: item.title, side: "right", align: "center"}}
              >
                <>
                  <Icon />
                  <span>{item.title}</span>
                  {item.label && (
                    <span className="ml-auto text-xs">{item.label}</span>
                  )}
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

