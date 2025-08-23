import { pgTable, text, timestamp, boolean, integer, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Premium users table - populated via PayPal payments first, then login allowed
export const premiumUsers = pgTable("premium_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  paypalOrderId: text("paypal_order_id"),
  subscriptionStatus: text("subscription_status", { enum: ["active", "cancelled", "expired"] }).default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("premium_users_email_idx").on(table.email),
}));

// Users table - only for premium subscribers who can actually log in
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),  // Optional for OAuth users
  oauthProvider: text("oauth_provider"),  // google
  oauthId: text("oauth_id"),  // OAuth provider user ID
  monthlyUsageCount: integer("monthly_usage_count").default(0).notNull(),
  lastUsageReset: timestamp("last_usage_reset", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("users_username_idx").on(table.username),
  emailIdx: index("users_email_idx").on(table.email),
  oauthIdx: index("users_oauth_idx").on(table.oauthProvider, table.oauthId),
}));

// Free tier usage tracking by IP + cookie (no user accounts)
export const freeUsage = pgTable("free_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  ipAddress: text("ip_address").notNull(),
  cookieId: text("cookie_id").notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsage: timestamp("last_usage", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  ipCookieIdx: index("free_usage_ip_cookie_idx").on(table.ipAddress, table.cookieId),
  lastUsageIdx: index("free_usage_last_usage_idx").on(table.lastUsage),
}));

export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull(),
}, (table) => ({
  expireIdx: index("sessions_expire_idx").on(table.expire),
}));

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"), // For free users
  cookieId: text("cookie_id"), // For free users
  imageProcessed: timestamp("image_processed", { withTimezone: true }).defaultNow().notNull(),
  extractedWords: integer("extracted_words").default(0).notNull(),
  confidence: integer("confidence").default(0).notNull(),
  userType: text("user_type", { enum: ["free", "premium"] }).notNull(),
}, (table) => ({
  userIdIdx: index("usage_logs_user_id_idx").on(table.userId),
  ipCookieIdx: index("usage_logs_ip_cookie_idx").on(table.ipAddress, table.cookieId),
  dateIdx: index("usage_logs_date_idx").on(table.imageProcessed),
}));

// PayPal payment records
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  paypalOrderId: text("paypal_order_id").unique().notNull(),
  amount: text("amount").notNull(), // Store as string for precision
  currency: text("currency").default("USD").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  emailIdx: index("payments_email_idx").on(table.email),
  paypalIdx: index("payments_paypal_idx").on(table.paypalOrderId),
}));

// Insert schemas
export const insertPremiumUserSchema = createInsertSchema(premiumUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
  monthlyUsageCount: true,
  lastUsageReset: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const insertFreeUsageSchema = createInsertSchema(freeUsage).omit({
  id: true,
  createdAt: true,
});

export const insertUsageLogSchema = createInsertSchema(usageLogs).omit({
  id: true,
  imageProcessed: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Select schemas
export const selectPremiumUserSchema = createSelectSchema(premiumUsers);
export const selectUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
});
export const selectFreeUsageSchema = createSelectSchema(freeUsage);
export const selectUsageLogSchema = createSelectSchema(usageLogs);
export const selectPaymentSchema = createSelectSchema(payments);

// Types
export type PremiumUser = typeof premiumUsers.$inferSelect;
export type NewPremiumUser = z.infer<typeof insertPremiumUserSchema>;

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type PublicUser = z.infer<typeof selectUserSchema>;

export type FreeUsage = typeof freeUsage.$inferSelect;
export type NewFreeUsage = z.infer<typeof insertFreeUsageSchema>;

export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = z.infer<typeof insertUsageLogSchema>;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = z.infer<typeof insertPaymentSchema>;

// Login schema - only for premium users
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// PayPal payment schema
export const paypalPaymentSchema = z.object({
  email: z.string().email("Valid email is required"),
  amount: z.string().regex(/^\d+\.\d{2}$/, "Amount must be in format 0.00"),
  currency: z.string().default("USD"),
});

export type PayPalPaymentData = z.infer<typeof paypalPaymentSchema>;

// OCR result schema
export const ocrResultSchema = z.object({
  extractedText: z.string(),
  rawText: z.string(),
  confidence: z.number().min(0).max(100),
  wordCount: z.number().min(0),
});

export type OCRResult = z.infer<typeof ocrResultSchema>;