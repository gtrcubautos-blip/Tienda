import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteWhatsappsTable = pgTable("quote_whatsapps", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().default(""),
  number: text("number").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuoteWhatsappSchema = createInsertSchema(quoteWhatsappsTable).omit({ id: true, createdAt: true });
export type InsertQuoteWhatsapp = z.infer<typeof insertQuoteWhatsappSchema>;
export type QuoteWhatsapp = typeof quoteWhatsappsTable.$inferSelect;
