import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";
import { lawyersTable } from "./lawyers";

export const timelineEventTypeEnum = pgEnum("timeline_event_type", [
  "note", "hearing", "document", "deadline", "update", "status_change"
]);

export const timelineEventsTable = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  lawyerId: integer("lawyer_id").references(() => lawyersTable.id),
  title: text("title").notNull(),
  description: text("description"),
  eventType: timelineEventTypeEnum("event_type").notNull().default("note"),
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEventsTable).omit({ id: true, createdAt: true });
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEventsTable.$inferSelect;
