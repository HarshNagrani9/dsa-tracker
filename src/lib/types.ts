
import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import { DIFFICULTIES, PLATFORMS } from "./constants";
import type { Timestamp } from 'firebase/firestore';

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
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "LeetCode" | "CSES" | "CodeChef" | "Codeforces" | "Other";

// Represents the structure of a question, can be used for form data or fetched data
export type Question = {
  topicName: string; 
  title: string;
  link?: string;
  description?: string;
  comments?: string;
  difficulty: Difficulty;
  platform: Platform;
  createdAt: Date | Timestamp; 
  updatedAt: Date | Timestamp; 
  solvedAt?: Date | Timestamp;
};

// Schema for adding a new question via form
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

// Represents a question document fetched from Firestore, including its ID
// Timestamps from Firestore are converted to JS Date objects upon fetching.
export interface QuestionDocument extends AddQuestionFormInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}


export type Contest = {
  id: string;
  title: string;
  platform: Platform;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type ActivityLog = {
  id: string;
  date: string; // YYYY-MM-DD
  count: number;
};
