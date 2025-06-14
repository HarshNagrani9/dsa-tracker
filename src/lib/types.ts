import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { DIFFICULTIES, PLATFORMS } from "./constants";

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
  title: string;
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

// Schema for adding a new question
export const AddQuestionSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  link: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES, { required_error: "Difficulty is required." }),
  platform: z.enum(PLATFORMS, { required_error: "Platform is required." }),
  topicName: z.string().min(1, { message: "Topic name is required." }),
  comments: z.string().optional(),
});

export type AddQuestionFormInput = z.infer<typeof AddQuestionSchema>;