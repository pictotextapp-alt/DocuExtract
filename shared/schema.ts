import { pgTable, text, timestamp, boolean, integer, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),  // Optional for OAuth users
  oauthProvider: text("oauth_provider"),  // google, facebook, apple
  oauthId: text("oauth_id"),  // OAuth provider user ID
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("users_username_idx").on(table.username),
  emailIdx: index("users_email_idx").on(table.email),
  oauthIdx: index("users_oauth_idx").on(table.oauthProvider, table.oauthId),
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
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  imageProcessed: timestamp("image_processed", { withTimezone: true }).defaultNow().notNull(),
  extractedWords: integer("extracted_words").default(0).notNull(),
  confidence: integer("confidence").default(0).notNull(),
}, (table) => ({
  userIdIdx: index("usage_logs_user_id_idx").on(table.userId),
  dateIdx: index("usage_logs_date_idx").on(table.imageProcessed),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  paypalSubscriptionId: text("paypal_subscription_id").unique(),
  status: text("status", { enum: ["active", "cancelled", "expired"] }).default("active").notNull(),
  amount: text("amount").notNull(), // Store as string for precision
  currency: text("currency").default("USD").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  paypalIdx: index("subscriptions_paypal_idx").on(table.paypalSubscriptionId),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

// OAuth user schema (no password required)
export const insertOAuthUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
});

export const insertUsageLogSchema = createInsertSchema(usageLogs).omit({
  id: true,
  imageProcessed: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Select schemas
export const selectUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
});

export const selectUsageLogSchema = createSelectSchema(usageLogs);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type PublicUser = z.infer<typeof selectUserSchema>;

export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = z.infer<typeof insertUsageLogSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = z.infer<typeof insertSubscriptionSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// OCR result schema
export const ocrResultSchema = z.object({
  extractedText: z.string(),
  rawText: z.string(),
  confidence: z.number().min(0).max(100),
  wordCount: z.number().min(0),
});

export type OCRResult = z.infer<typeof ocrResultSchema>;