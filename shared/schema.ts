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

export const ocrResponseSchema = z.object({
  text: z.string(),
  confidence: z.number(),
  words: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type OCRRequest = z.infer<typeof ocrRequestSchema>;
export type OCRResponse = z.infer<typeof ocrResponseSchema>;
