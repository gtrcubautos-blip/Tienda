import { pgTable, serial, text, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  items: jsonb("items").notNull().$type<Array<{ productId: number; productName: string; qty: number; unitPrice: number }>>(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull().default("retail"), // retail | wholesale
  status: text("status").notNull().default("completed"), // pending | completed | cancelled
  discountApplied: numeric("discount_applied", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
