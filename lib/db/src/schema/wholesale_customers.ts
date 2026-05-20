import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wholesaleCustomersTable = pgTable("wholesale_customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  province: text("province").notNull(),
  companyType: text("company_type").notNull(), // TCP | MIPYME
  companyName: text("company_name").notNull(),
  onatDocument: text("onat_document").notNull(),
  clientCode: text("client_code").notNull().unique(),
  clientNumber: integer("client_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertWholesaleCustomerSchema = createInsertSchema(wholesaleCustomersTable).omit({ id: true, createdAt: true });
export type InsertWholesaleCustomer = z.infer<typeof insertWholesaleCustomerSchema>;
export type WholesaleCustomer = typeof wholesaleCustomersTable.$inferSelect;
