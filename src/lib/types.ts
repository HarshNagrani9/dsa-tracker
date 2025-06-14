
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

// Auth Schemas
export const SignUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // path of error
});
export type SignUpFormInput = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});
export type SignInFormInput = z.infer<typeof SignInSchema>;


// Topic Types
export const AddTopicSchema = z.object({
  name: z.string().min(1, { message: "Topic name cannot be empty." }).max(100, {message: "Topic name too long."}),
  userId: z.string({ required_error: "User ID is required."})
});
export type AddTopicFormInput = z.infer<typeof AddTopicSchema>;
export interface TopicDocument extends Omit<AddTopicFormInput, 'userId'> { // userId is part of the doc, not directly in this type if always fetched for a user
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  questionCount?: number;
}

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "LeetCode" | "CSES" | "CodeChef" | "Codeforces" | "Other";


// Question Types
export const AddQuestionSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(200, { message: "Title too long."}),
  link: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().max(500, {message: "Description too long."}).optional(),
  difficulty: z.enum(DIFFICULTIES, { required_error: "Difficulty is required." }),
  platform: z.enum(PLATFORMS, { required_error: "Platform is required." }),
  topicName: z.string().min(1, { message: "Topic name is required." }).max(100, {message: "Topic name too long."}),
  comments: z.string().max(500, {message: "Comments too long."}).optional(),
  userId: z.string({ required_error: "User ID is required."})
});
export type AddQuestionFormInput = z.infer<typeof AddQuestionSchema>;
export interface QuestionDocument extends Omit<AddQuestionFormInput, 'userId'> {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contest Types
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format

export const AddContestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(200, "Title too long."),
  platform: z.enum(PLATFORMS, { required_error: "Platform is required." }),
  date: z.date({ required_error: "Contest date is required." }),
  startTime: z.string().regex(timeRegex, "Invalid start time format (HH:MM)."),
  endTime: z.string().regex(timeRegex, "Invalid end time format (HH:MM)."),
  userId: z.string({ required_error: "User ID is required."})
}).refine(data => {
  // Basic time validation, can be improved if needed
  return true; // Assuming valid times for now, or add more complex validation
}, {
  message: "End time must be after start time.", // This part is hard to validate without parsing time properly relative to date.
  path: ["endTime"],
});

export type AddContestFormInput = z.infer<typeof AddContestSchema>;

// Firestore document structure (server-side)
export interface ContestDocumentFirestore {
  id?: string; // id is usually not stored in the document itself but is the doc key
  title: string;
  platform: Platform;
  date: Timestamp; 
  startTime: string; 
  endTime: string; 
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Client-side representation
export interface ContestDocumentClient {
  id: string;
  title: string;
  platform: Platform;
  date: Date;
  startTime: string;
  endTime: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}


export type ActivityLog = {
  id: string;
  date: string; // YYYY-MM-DD
  count: number;
  userId: string;
};

// Chart data types
export interface ChartDataItem {
  name: string;
  count: number;
  fill: string;
}

// Streak Data (Firestore representation)
export interface StreakDataFirestore {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  // userId is the document ID, not a field in the doc
}

// Streak Data (Client-side representation)
export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}
