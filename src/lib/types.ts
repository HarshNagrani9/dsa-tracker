import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export type Topic = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "LeetCode" | "CSES" | "CodeChef" | "Codeforces" | "Other";

export type Question = {
  id: string;
  topicId: string;
  title: string; // Added title for better display
  link: string;
  description: string;
  comments: string;
  difficulty: Difficulty;
  platform: Platform;
  createdAt: Date;
  updatedAt: Date;
  solvedAt?: Date;
};

export type Contest = {
  id: string;
  title: string;
  platform: Platform;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  createdAt: Date;
  updatedAt: Date;
};

export type ActivityLog = {
  id: string;
  date: string; // YYYY-MM-DD
  count: number;
};
