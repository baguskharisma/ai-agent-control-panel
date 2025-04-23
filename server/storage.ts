import { 
  n8nConfigs, type N8nConfig, type InsertN8nConfig,
  workflowAlerts, type WorkflowAlert, type InsertWorkflowAlert,
  webhookTests, type WebhookTest, type InsertWebhookTest
} from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // N8n Config
  getN8nConfig(): Promise<N8nConfig | undefined>;
  saveN8nConfig(config: InsertN8nConfig): Promise<N8nConfig>;
  
  // Workflow Alerts
  getAllWorkflowAlerts(): Promise<WorkflowAlert[]>;
  getWorkflowAlert(id: number): Promise<WorkflowAlert | undefined>;
  createWorkflowAlert(alert: InsertWorkflowAlert): Promise<WorkflowAlert>;
  updateWorkflowAlert(id: number, alert: Partial<InsertWorkflowAlert>): Promise<WorkflowAlert>;
  deleteWorkflowAlert(id: number): Promise<void>;
  
  // Webhook Tests
  getAllWebhookTests(): Promise<WebhookTest[]>;
  getWebhookTest(id: number): Promise<WebhookTest | undefined>;
  createWebhookTest(webhookTest: InsertWebhookTest): Promise<WebhookTest>;
  updateWebhookTest(id: number, webhookTest: Partial<InsertWebhookTest>): Promise<WebhookTest>;
  deleteWebhookTest(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // N8n Config Methods
  async getN8nConfig(): Promise<N8nConfig | undefined> {
    const configs = await db.select().from(n8nConfigs).limit(1);
    return configs.length > 0 ? configs[0] : undefined;
  }

  async saveN8nConfig(config: InsertN8nConfig): Promise<N8nConfig> {
    const existingConfig = await this.getN8nConfig();
    
    if (!existingConfig) {
      // Create new config with default values for required fields
      const configWithDefaults = {
        ...config,
        id: 1,
        refreshInterval: config.refreshInterval ?? 60,
        notificationsEnabled: config.notificationsEnabled ?? true
      };
      
      const [newConfig] = await db.insert(n8nConfigs)
        .values(configWithDefaults)
        .returning();
      
      return newConfig;
    } else {
      // Update existing config, maintaining defaults for any unspecified fields
      const [updatedConfig] = await db.update(n8nConfigs)
        .set({
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          refreshInterval: config.refreshInterval ?? existingConfig.refreshInterval,
          notificationsEnabled: config.notificationsEnabled ?? existingConfig.notificationsEnabled
        })
        .where(eq(n8nConfigs.id, existingConfig.id))
        .returning();
      
      return updatedConfig;
    }
  }
  
  // Workflow Alerts Methods
  async getAllWorkflowAlerts(): Promise<WorkflowAlert[]> {
    return await db.select().from(workflowAlerts);
  }

  async getWorkflowAlert(id: number): Promise<WorkflowAlert | undefined> {
    const alerts = await db.select()
      .from(workflowAlerts)
      .where(eq(workflowAlerts.id, id));
    
    return alerts.length > 0 ? alerts[0] : undefined;
  }

  async createWorkflowAlert(alert: InsertWorkflowAlert): Promise<WorkflowAlert> {
    // Add defaults for required fields
    const alertWithDefaults = {
      ...alert,
      threshold: alert.threshold ?? 3,
      enabled: alert.enabled ?? true
    };
    
    const [newAlert] = await db.insert(workflowAlerts)
      .values(alertWithDefaults)
      .returning();
    
    return newAlert;
  }

  async updateWorkflowAlert(id: number, alert: Partial<InsertWorkflowAlert>): Promise<WorkflowAlert> {
    const existingAlert = await this.getWorkflowAlert(id);
    
    if (!existingAlert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    
    const [updatedAlert] = await db.update(workflowAlerts)
      .set(alert)
      .where(eq(workflowAlerts.id, id))
      .returning();
    
    return updatedAlert;
  }

  async deleteWorkflowAlert(id: number): Promise<void> {
    await db.delete(workflowAlerts)
      .where(eq(workflowAlerts.id, id));
  }
  
  // Webhook Tests Methods
  async getAllWebhookTests(): Promise<WebhookTest[]> {
    return await db.select().from(webhookTests);
  }

  async getWebhookTest(id: number): Promise<WebhookTest | undefined> {
    const tests = await db.select()
      .from(webhookTests)
      .where(eq(webhookTests.id, id));
    
    return tests.length > 0 ? tests[0] : undefined;
  }

  async createWebhookTest(webhookTest: InsertWebhookTest): Promise<WebhookTest> {
    // Add defaults for required fields
    const webhookWithDefaults = {
      ...webhookTest,
      method: webhookTest.method ?? 'GET',
      headers: webhookTest.headers ?? {},
      body: webhookTest.body ?? null
    };
    
    const [newTest] = await db.insert(webhookTests)
      .values(webhookWithDefaults)
      .returning();
    
    return newTest;
  }

  async updateWebhookTest(id: number, webhookTest: Partial<InsertWebhookTest>): Promise<WebhookTest> {
    const existingTest = await this.getWebhookTest(id);
    
    if (!existingTest) {
      throw new Error(`Webhook test with id ${id} not found`);
    }
    
    const [updatedTest] = await db.update(webhookTests)
      .set(webhookTest)
      .where(eq(webhookTests.id, id))
      .returning();
    
    return updatedTest;
  }

  async deleteWebhookTest(id: number): Promise<void> {
    await db.delete(webhookTests)
      .where(eq(webhookTests.id, id));
  }
}

// Using DatabaseStorage
export const storage = new DatabaseStorage();