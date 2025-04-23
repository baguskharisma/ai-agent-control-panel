// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: any[]; // Node data from n8n
  connections: any; // Connection data from n8n
  lastExecution?: {
    id: string;
    status: ExecutionStatus;
    startedAt: string;
    finishedAt: string;
    timeAgo: string;
  };
  nextExecution?: string;
  lastError?: string;
  lastErrorDetails?: {
    title: string;
    description: string;
  };
  statistics?: {
    totalExecutions: number;
    successRate: number;
    failedExecutions: number;
    avgDuration: number;
    lastErrorDays: number | null;
  };
}

export type ExecutionStatus = 
  | "success" 
  | "error" 
  | "running" 
  | "waiting" 
  | "partial_success" 
  | "canceled";

// Execution Types
export interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  duration: number;
  data: any; // Execution data from n8n
  mode: string;
}

// Alert Types
export interface Alert {
  id: number;
  workflowId: string;
  workflowName: string;
  alertType: "failure" | "success" | "partial_success";
  threshold: number;
  enabled: boolean;
  message: string;
  createdAt: string;
}

// Webhook Test Types
export interface WebhookTest {
  id: number;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
}

export interface WebhookTestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
}

// Utility functions for workflow state
export function isErrorWorkflow(workflow: Workflow): boolean {
  if (workflow.lastExecution?.status === "error") return true;
  if (workflow.lastError) return true;
  return false;
}

export function isWarningWorkflow(workflow: Workflow): boolean {
  if (workflow.lastExecution?.status === "partial_success") return true;
  if (workflow.statistics && workflow.statistics.successRate < 90) return true;
  return false;
}
