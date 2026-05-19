import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const discountsTable = pgTable("discounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  type: text("type").notNull(), // percentage | fixed | wholesale_tier
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").notNull().default(true),
  appliesTo: text("applies_to").notNull().default("all"), // all | retail | wholesale | category
  category: text("category"),
  minAmount: numeric("min_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiscountSchema = createInsertSchema(discountsTable).omit({ id: true, createdAt: true });
export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type Discount = typeof discountsTable.$inferSelect;
