import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial } from "drizzle-orm/pg-core";
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

// Articles table for RSS feed data
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  pubDate: timestamp("pub_date"),
  source: text("source").notNull(),
  summary: text("summary"),
  categories: text("categories").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const selectArticleSchema = createInsertSchema(articles);

export type InsertArticleType = z.infer<typeof insertArticleSchema>;

// Client-side article type for localStorage
export const clientArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  pubDate: z.string().optional(),
  source: z.string(),
  summary: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export type ClientArticle = z.infer<typeof clientArticleSchema>;

// Chat message schema
export const chatMessageSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  timestamp: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
