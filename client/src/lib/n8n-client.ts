import { apiRequest } from "./queryClient";
import type { Workflow, Execution } from "./types";

// A client for interacting with the n8n API through our backend proxy
export class N8nClient {
  /**
   * Get all workflows
   */
  static async getWorkflows(): Promise<Workflow[]> {
    const response = await apiRequest("GET", "/api/workflows");
    return response.json();
  }

  /**
   * Get a specific workflow by ID
   */
  static async getWorkflow(id: string): Promise<Workflow> {
    const response = await apiRequest("GET", `/api/workflows/${id}`);
    return response.json();
  }

  /**
   * Activate a workflow
   */
  static async activateWorkflow(id: string): Promise<void> {
    await apiRequest("POST", `/api/workflows/${id}/activate`);
  }

  /**
   * Deactivate a workflow
   */
  static async deactivateWorkflow(id: string): Promise<void> {
    await apiRequest("POST", `/api/workflows/${id}/deactivate`);
  }

  /**
   * Execute a workflow
   */
  static async executeWorkflow(id: string): Promise<void> {
    await apiRequest("POST", `/api/workflows/${id}/execute`);
  }

  /**
   * Get executions with pagination
   */
  static async getExecutions(options: {
    workflowId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Execution[]; count: number }> {
    const { workflowId, limit = 20, offset = 0 } = options;
    let url = `/api/executions?limit=${limit}&offset=${offset}`;
    
    if (workflowId) {
      url += `&workflowId=${workflowId}`;
    }
    
    const response = await apiRequest("GET", url);
    return response.json();
  }

  /**
   * Get a specific execution by ID
   */
  static async getExecution(id: string): Promise<Execution> {
    const response = await apiRequest("GET", `/api/executions/${id}`);
    return response.json();
  }
}
