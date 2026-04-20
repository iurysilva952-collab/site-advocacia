import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { lawyersTable } from "./lawyers";
import { clientsTable } from "./clients";

export const caseStatusEnum = pgEnum("case_status", ["active", "pending", "closed", "archived"]);
export const casePriorityEnum = pgEnum("case_priority", ["low", "medium", "high", "urgent"]);

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: caseStatusEnum("status").notNull().default("pending"),
  priority: casePriorityEnum("priority").notNull().default("medium"),
  caseType: text("case_type"),
  clientId: integer("client_id").notNull().references(() => clientsTable.id),
  lawyerId: integer("lawyer_id").notNull().references(() => lawyersTable.id),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true, caseNumber: true, createdAt: true, updatedAt: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
