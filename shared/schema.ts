import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// OCR extraction schemas
export const ocrRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"),
  language: z.string().optional().default("eng"),
  isTable: z.boolean().optional().default(false),
});

export const textRegionSchema = z.object({
  id: z.string(),
  text: z.string(),
  originalText: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number(),
  isVisible: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  isEdited: z.boolean().default(false),
});

export const ocrResponseSchema = z.object({
  text: z.string(),
  confidence: z.number(),
  words: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
  textRegions: z.array(textRegionSchema).optional(),
});

export const imageEditRequestSchema = z.object({
  originalImage: z.string().min(1, "Original image data is required"),
  textRegions: z.array(textRegionSchema),
});

export const imageEditResponseSchema = z.object({
  modifiedImage: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type OCRRequest = z.infer<typeof ocrRequestSchema>;
export type OCRResponse = z.infer<typeof ocrResponseSchema>;
export type TextRegion = z.infer<typeof textRegionSchema>;
export type ImageEditRequest = z.infer<typeof imageEditRequestSchema>;
export type ImageEditResponse = z.infer<typeof imageEditResponseSchema>;
