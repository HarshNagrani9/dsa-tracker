
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

// Topic Types
export const AddTopicSchema = z.object({
  name: z.string().min(1, { message: "Topic name cannot be empty." }).max(100, {message: "Topic name too long."}),
});
export type AddTopicFormInput = z.infer<typeof AddTopicSchema>;
export interface TopicDocument extends AddTopicFormInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  questionCount?: number; // Added for displaying question count per topic
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
  topicName: z.string().min(1, { message: "Topic name is required." }).max(100, {message: "Topic name too long."}), // Can later be a dropdown of TopicDocument.id
  comments: z.string().max(500, {message: "Comments too long."}).optional(),
});
export type AddQuestionFormInput = z.infer<typeof AddQuestionSchema>;
export interface QuestionDocument extends AddQuestionFormInput {
  id: string;
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
  endTime: z.string().regex(timeRegex, "Invalid end time format (HH:MM).")
}).refine(data => {
  // Optional: Add validation if endTime must be after startTime on the same day
  // For simplicity, not adding complex cross-field validation here yet.
  return true;
}, {
  message: "End time must be after start time.", // This message might not be hit without specific logic
  path: ["endTime"],
});

export type AddContestFormInput = z.infer<typeof AddContestSchema>;

export interface ContestDocument {
  id: string;
  title: string;
  platform: Platform;
  date: Timestamp; // Stored as Firestore Timestamp
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  createdAt: Timestamp; // Stored as Firestore Timestamp, converted to Date on fetch
  updatedAt: Timestamp; // Stored as Firestore Timestamp, converted to Date on fetch
}
// Client side representation after fetching and converting Timestamps
export interface ContestDocumentClient extends Omit<ContestDocument, 'date' | 'createdAt' | 'updatedAt'> {
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}


export type ActivityLog = {
  id: string;
  date: string; // YYYY-MM-DD
  count: number;
};

// Chart data types
export interface ChartDataItem {
  name: string;
  count: number;
  fill: string;
}
