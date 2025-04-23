import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertN8nConfigSchema, insertWorkflowAlertSchema, insertWebhookTestSchema } from "@shared/schema";
import axios from "axios";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // N8n Config Routes
  app.get("/api/n8n-config", async (req, res) => {
    try {
      const config = await storage.getN8nConfig();
      if (!config) {
        return res.status(404).json({ message: "No n8n configuration found" });
      }
      // Return with masked API key
      return res.json({
        ...config,
        apiKey: config.apiKey ? "••••••••••••••••••••••" : "",
      });
    } catch (error) {
      console.error("Error fetching n8n config:", error);
      return res.status(500).json({ message: "Failed to fetch n8n configuration" });
    }
  });

  app.post("/api/n8n-config", async (req, res) => {
    try {
      const data = insertN8nConfigSchema.parse(req.body);
      const config = await storage.saveN8nConfig(data);
      return res.status(201).json({
        ...config,
        apiKey: config.apiKey ? "••••••••••••••••••••••" : "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to save n8n configuration" });
    }
  });

  // N8n API Proxy Routes
  app.get("/api/workflows", async (req, res) => {
    try {
      const config = await storage.getN8nConfig();
      if (!config) {
        return res.status(404).json({ message: "No n8n configuration found" });
      }

      const response = await axios.get(`${config.apiUrl}/workflows`, {
        headers: {
          "X-N8N-API-KEY": config.apiKey
        }
      });

      return res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching workflows:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: "Failed to fetch workflows",
        error: error.response?.data || error.message
      });
    }
  });

  app.get("/api/executions", async (req, res) => {
    try {
      const config = await storage.getN8nConfig();
      if (!config) {
        return res.status(404).json({ message: "No n8n configuration found" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const workflowId = req.query.workflowId as string | undefined;

      let url = `${config.apiUrl}/executions?limit=${limit}&offset=${offset}`;
      if (workflowId) {
        url += `&workflowId=${workflowId}`;
      }

      const response = await axios.get(url, {
        headers: {
          "X-N8N-API-KEY": config.apiKey
        }
      });

      return res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching executions:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: "Failed to fetch executions",
        error: error.response?.data || error.message
      });
    }
  });

  app.post("/api/workflows/:id/activate", async (req, res) => {
    try {
      const { id } = req.params;
      const config = await storage.getN8nConfig();
      if (!config) {
        return res.status(404).json({ message: "No n8n configuration found" });
      }

      const response = await axios.post(`${config.apiUrl}/workflows/${id}/activate`, {}, {
        headers: {
          "X-N8N-API-KEY": config.apiKey
        }
      });

      return res.json(response.data);
    } catch (error: any) {
      console.error("Error activating workflow:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: "Failed to activate workflow",
        error: error.response?.data || error.message
      });
    }
  });

  app.post("/api/workflows/:id/deactivate", async (req, res) => {
    try {
      const { id } = req.params;
      const config = await storage.getN8nConfig();
      if (!config) {
        return res.status(404).json({ message: "No n8n configuration found" });
      }

      const response = await axios.post(`${config.apiUrl}/workflows/${id}/deactivate`, {}, {
        headers: {
          "X-N8N-API-KEY": config.apiKey
        }
      });

      return res.json(response.data);
    } catch (error: any) {
      console.error("Error deactivating workflow:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: "Failed to deactivate workflow",
        error: error.response?.data || error.message
      });
    }
  });

  app.post("/api/workflows/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const config = await storage.getN8nConfig();
      if (!config) {
        return res.status(404).json({ message: "No n8n configuration found" });
      }

      const response = await axios.post(`${config.apiUrl}/workflows/${id}/execute`, {}, {
        headers: {
          "X-N8N-API-KEY": config.apiKey
        }
      });

      return res.json(response.data);
    } catch (error: any) {
      console.error("Error executing workflow:", error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: "Failed to execute workflow",
        error: error.response?.data || error.message
      });
    }
  });

  // Workflow Alert Routes
  app.get("/api/workflow-alerts", async (req, res) => {
    try {
      const alerts = await storage.getAllWorkflowAlerts();
      return res.json(alerts);
    } catch (error) {
      console.error("Error fetching workflow alerts:", error);
      return res.status(500).json({ message: "Failed to fetch workflow alerts" });
    }
  });

  app.post("/api/workflow-alerts", async (req, res) => {
    try {
      const data = insertWorkflowAlertSchema.parse(req.body);
      const alert = await storage.createWorkflowAlert(data);
      return res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create workflow alert" });
    }
  });

  app.delete("/api/workflow-alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkflowAlert(parseInt(id));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting workflow alert:", error);
      return res.status(500).json({ message: "Failed to delete workflow alert" });
    }
  });

  // Webhook Test Routes
  app.get("/api/webhook-tests", async (req, res) => {
    try {
      const webhookTests = await storage.getAllWebhookTests();
      return res.json(webhookTests);
    } catch (error) {
      console.error("Error fetching webhook tests:", error);
      return res.status(500).json({ message: "Failed to fetch webhook tests" });
    }
  });

  app.post("/api/webhook-tests", async (req, res) => {
    try {
      const data = insertWebhookTestSchema.parse(req.body);
      const webhookTest = await storage.createWebhookTest(data);
      return res.status(201).json(webhookTest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create webhook test" });
    }
  });

  app.delete("/api/webhook-tests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWebhookTest(parseInt(id));
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting webhook test:", error);
      return res.status(500).json({ message: "Failed to delete webhook test" });
    }
  });

  app.post("/api/webhook-tests/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const webhookTest = await storage.getWebhookTest(parseInt(id));
      
      if (!webhookTest) {
        return res.status(404).json({ message: "Webhook test not found" });
      }

      const headers = webhookTest.headers as Record<string, string>;
      
      const response = await axios({
        method: webhookTest.method,
        url: webhookTest.url,
        headers,
        data: webhookTest.body ? JSON.parse(webhookTest.body) : undefined,
        validateStatus: () => true // Return response regardless of status code
      });

      return res.json({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
    } catch (error: any) {
      console.error("Error executing webhook test:", error.message);
      return res.status(500).json({
        message: "Failed to execute webhook test",
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
