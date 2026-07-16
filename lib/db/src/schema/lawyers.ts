import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lawyersTable = pgTable("lawyers", {
  id: serial("id").primaryKey(),

  // Dados básicos
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  // OAB
  oab: text("oab").notNull(),
  ufOab: text("uf_oab"),

  // Documentos
  cpf: text("cpf"),
  rg: text("rg"),

  // Contato
  phone: text("phone"),

  // Profissional
  specialty: text("specialty"),
  role: text("role"),

  // Informações extras
  bio: text("bio"),
  avatarUrl: text("avatar_url"),

  // Permissões
  isAdmin: boolean("is_admin").notNull().default(false),

  // Datas
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLawyerSchema = createInsertSchema(lawyersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertLawyer = z.infer<typeof insertLawyerSchema>;
export type Lawyer = typeof lawyersTable.$inferSelect;