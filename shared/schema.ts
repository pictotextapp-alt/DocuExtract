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

// New schema for content-aware inpainting
export const inpaintRequestSchema = z.object({
  originalImage: z.string().min(1, "Original image data is required"),
  textRegions: z.array(textRegionSchema), // Regions to remove with inpainting
});

export const inpaintResponseSchema = z.object({
  cleanedImage: z.string(), // Image with text removed via content-aware inpainting
  success: z.boolean(),
  error: z.string().optional(),
});

// Enhanced text layer schema for DOM-based editing (Canva-style)
export const textLayerSchema = z.object({
  id: z.string(),
  text: z.string(),
  originalText: z.string(),
  x: z.number(), // Position relative to image
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fontSize: z.number(),
  fontFamily: z.string().default("Arial"),
  fontWeight: z.string().default("400"),
  fontStyle: z.string().default("normal"),
  textAlign: z.string().default("left"),
  lineHeight: z.number().default(1.2),
  letterSpacing: z.number().default(0),
  color: z.string().default("#000000"),
  backgroundColor: z.string().default("transparent"),
  borderColor: z.string().default("transparent"),
  borderWidth: z.number().default(0),
  borderRadius: z.number().default(0),
  padding: z.number().default(0),
  shadow: z.string().default("none"),
  opacity: z.number().default(1),
  isVisible: z.boolean().default(true),
  isEdited: z.boolean().default(false),
  rotation: z.number().default(0),
  zIndex: z.number().default(1),
});

// Export functionality schemas
export const exportRequestSchema = z.object({
  cleanedImage: z.string().min(1, "Cleaned image data is required"),
  textLayers: z.array(textLayerSchema),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
  quality: z.number().min(0.1).max(1).default(0.9),
});

export const exportResponseSchema = z.object({
  exportedImage: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type OCRRequest = z.infer<typeof ocrRequestSchema>;
export type OCRResponse = z.infer<typeof ocrResponseSchema>;
export type TextRegion = z.infer<typeof textRegionSchema>;
export type ImageEditRequest = z.infer<typeof imageEditRequestSchema>;
export type ImageEditResponse = z.infer<typeof imageEditResponseSchema>;
export type InpaintRequest = z.infer<typeof inpaintRequestSchema>;
export type InpaintResponse = z.infer<typeof inpaintResponseSchema>;
export type TextLayer = z.infer<typeof textLayerSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
export type ExportResponse = z.infer<typeof exportResponseSchema>;
