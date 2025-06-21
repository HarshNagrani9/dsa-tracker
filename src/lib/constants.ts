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

export const PLATFORMS = ["LeetCode", "CSES", "CodeChef", "Codeforces", "Other"] as const;
export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export const TOPIC_CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export const AppLogo = Brain;
