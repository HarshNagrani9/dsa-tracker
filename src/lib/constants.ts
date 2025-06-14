import type { NavItem, Platform, Difficulty } from "@/lib/types";
import { Home, ListChecks, FileQuestion, Trophy, CalendarDays, Settings, Brain } from "lucide-react";

export const APP_NAME = "DSA Tracker";

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Topics",
    href: "/topics",
    icon: ListChecks,
  },
  {
    title: "Questions",
    href: "/questions",
    icon: FileQuestion,
  },
  {
    title: "Contests",
    href: "/contests",
    icon: Trophy,
  },
  {
    title: "Streak",
    href: "/streak",
    icon: CalendarDays,
  },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  title: "Settings",
  href: "/settings",
  icon: Settings,
};

export const PLATFORMS: Platform[] = ["LeetCode", "CSES", "CodeChef", "Codeforces", "Other"];
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const AppLogo = Brain;
