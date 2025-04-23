import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for storing n8n API configuration
export const n8nConfigs = pgTable("n8n_configs", {
  id: serial("id").primaryKey(),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key").notNull(),
  refreshInterval: integer("refresh_interval").default(60).notNull(), // in seconds
  notificationsEnabled: boolean("notifications_enabled").default(false).notNull(),
});

export const insertN8nConfigSchema = createInsertSchema(n8nConfigs).omit({
  id: true,
});

// Schema for storing workflow alerts
export const workflowAlerts = pgTable("workflow_alerts", {
  id: serial("id").primaryKey(),
  workflowId: text("workflow_id").notNull(),
  workflowName: text("workflow_name").notNull(),
  alertType: text("alert_type").notNull(), // 'failure', 'success', 'partial_success'
  threshold: integer("threshold").default(1).notNull(), // number of occurrences to trigger
  enabled: boolean("enabled").default(true).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkflowAlertSchema = createInsertSchema(workflowAlerts).omit({
  id: true,
  createdAt: true,
});

// Schema for storing webhook test configurations
export const webhookTests = pgTable("webhook_tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  method: text("method").notNull().default("POST"),
  headers: jsonb("headers").default({}).notNull(),
  body: text("body").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebhookTestSchema = createInsertSchema(webhookTests).omit({
  id: true,
  createdAt: true,
});

// Types
export type N8nConfig = typeof n8nConfigs.$inferSelect;
export type InsertN8nConfig = z.infer<typeof insertN8nConfigSchema>;

export type WorkflowAlert = typeof workflowAlerts.$inferSelect;
export type InsertWorkflowAlert = z.infer<typeof insertWorkflowAlertSchema>;

export type WebhookTest = typeof webhookTests.$inferSelect;
export type InsertWebhookTest = z.infer<typeof insertWebhookTestSchema>;
