import { 
  n8nConfigs, type N8nConfig, type InsertN8nConfig,
  workflowAlerts, type WorkflowAlert, type InsertWorkflowAlert,
  webhookTests, type WebhookTest, type InsertWebhookTest
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private n8nConfig: N8nConfig | undefined;
  private workflowAlerts: Map<number, WorkflowAlert>;
  private webhookTests: Map<number, WebhookTest>;
  private alertId: number;
  private webhookTestId: number;

  constructor() {
    this.workflowAlerts = new Map();
    this.webhookTests = new Map();
    this.alertId = 1;
    this.webhookTestId = 1;
  }

  // N8n Config Methods
  async getN8nConfig(): Promise<N8nConfig | undefined> {
    return this.n8nConfig;
  }

  async saveN8nConfig(config: InsertN8nConfig): Promise<N8nConfig> {
    const newConfig = {
      id: 1,
      ...config
    };
    this.n8nConfig = newConfig;
    return newConfig;
  }

  // Workflow Alerts Methods
  async getAllWorkflowAlerts(): Promise<WorkflowAlert[]> {
    return Array.from(this.workflowAlerts.values());
  }

  async getWorkflowAlert(id: number): Promise<WorkflowAlert | undefined> {
    return this.workflowAlerts.get(id);
  }

  async createWorkflowAlert(alert: InsertWorkflowAlert): Promise<WorkflowAlert> {
    const id = this.alertId++;
    const newAlert: WorkflowAlert = {
      ...alert,
      id,
      createdAt: new Date()
    };
    this.workflowAlerts.set(id, newAlert);
    return newAlert;
  }

  async updateWorkflowAlert(id: number, alert: Partial<InsertWorkflowAlert>): Promise<WorkflowAlert> {
    const existingAlert = this.workflowAlerts.get(id);
    if (!existingAlert) {
      throw new Error(`Workflow alert with id ${id} not found`);
    }
    
    const updatedAlert = {
      ...existingAlert,
      ...alert
    };
    
    this.workflowAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteWorkflowAlert(id: number): Promise<void> {
    this.workflowAlerts.delete(id);
  }

  // Webhook Tests Methods
  async getAllWebhookTests(): Promise<WebhookTest[]> {
    return Array.from(this.webhookTests.values());
  }

  async getWebhookTest(id: number): Promise<WebhookTest | undefined> {
    return this.webhookTests.get(id);
  }

  async createWebhookTest(webhookTest: InsertWebhookTest): Promise<WebhookTest> {
    const id = this.webhookTestId++;
    const newWebhookTest: WebhookTest = {
      ...webhookTest,
      id,
      createdAt: new Date()
    };
    this.webhookTests.set(id, newWebhookTest);
    return newWebhookTest;
  }

  async updateWebhookTest(id: number, webhookTest: Partial<InsertWebhookTest>): Promise<WebhookTest> {
    const existingWebhookTest = this.webhookTests.get(id);
    if (!existingWebhookTest) {
      throw new Error(`Webhook test with id ${id} not found`);
    }
    
    const updatedWebhookTest = {
      ...existingWebhookTest,
      ...webhookTest
    };
    
    this.webhookTests.set(id, updatedWebhookTest);
    return updatedWebhookTest;
  }

  async deleteWebhookTest(id: number): Promise<void> {
    this.webhookTests.delete(id);
  }
}

export const storage = new MemStorage();
