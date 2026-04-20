import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lawyersTable = pgTable("lawyers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  oab: text("oab").notNull(),
  specialty: text("specialty"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLawyerSchema = createInsertSchema(lawyersTable).omit({ id: true, createdAt: true });
export type InsertLawyer = z.infer<typeof insertLawyerSchema>;
export type Lawyer = typeof lawyersTable.$inferSelect;
