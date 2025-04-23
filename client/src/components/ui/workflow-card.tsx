import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Workflow, 
  ExecutionStatus,
  isErrorWorkflow,
  isWarningWorkflow
} from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useN8nWorkflows } from "@/hooks/use-n8n-workflows";
import { 
  LucideShuffle, 
  LucideCloud, 
  LucideDatabase, 
  LucideFileUp,
  LucideInfo,
  LucideHistory, 
  LucidePlayCircle,
  LucideAlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface WorkflowCardProps {
  workflow: Workflow;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const { toast } = useToast();
  const { mutate: toggleWorkflowActive } = useN8nWorkflows();
  const [executing, setExecuting] = useState(false);
  
  const isActive = workflow.active === true;
  const hasError = isErrorWorkflow(workflow);
  const hasWarning = isWarningWorkflow(workflow);
  
  const getWorkflowIcon = () => {
    if (workflow.name.toLowerCase().includes("email") || workflow.name.toLowerCase().includes("campaign")) {
      return <LucideShuffle className="text-xl" />;
    } else if (workflow.name.toLowerCase().includes("database") || workflow.name.toLowerCase().includes("db")) {
      return <LucideDatabase className="text-xl" />;
    } else if (workflow.name.toLowerCase().includes("backup") || workflow.name.toLowerCase().includes("cloud")) {
      return <LucideCloud className="text-xl" />;
    } else if (workflow.name.toLowerCase().includes("transfer") || workflow.name.toLowerCase().includes("crm")) {
      return <LucideFileUp className="text-xl" />;
    }
    return <LucideShuffle className="text-xl" />;
  };

  const getBadgeVariant = () => {
    if (hasError) return "destructive";
    if (hasWarning) return "warning";
    if (isActive) return "success";
    return "outline";
  };

  const getBadgeText = () => {
    if (hasError) return "Error";
    if (hasWarning) return "Warning";
    if (isActive) return "Active";
    return "Inactive";
  };

  const getIconBgClass = () => {
    if (hasError) return "bg-destructive bg-opacity-20";
    if (hasWarning) return "bg-warning bg-opacity-20";
    if (isActive) return "bg-primary bg-opacity-20";
    return "bg-muted bg-opacity-50";
  };

  const getIconTextClass = () => {
    if (hasError) return "text-destructive";
    if (hasWarning) return "text-warning";
    if (isActive) return "text-primary";
    return "text-muted-foreground";
  };

  const getSuccessRateClass = () => {
    const successRate = workflow.statistics?.successRate || 0;
    if (successRate >= 90) return "text-success";
    if (successRate >= 75) return "text-warning";
    return "text-destructive";
  };

  const handleToggleActive = () => {
    toggleWorkflowActive({ workflowId: workflow.id, active: !isActive });
  };

  const handleExecuteNow = async () => {
    try {
      setExecuting(true);
      await apiRequest("POST", `/api/workflows/${workflow.id}/execute`);
      toast({
        title: "Workflow execution started",
        description: `${workflow.name} is now running`,
      });
      // Invalidate executions cache to reflect the new execution
      await queryClient.invalidateQueries({ queryKey: ["/api/executions"] });
    } catch (error) {
      toast({
        title: "Failed to execute workflow",
        description: "There was an error starting the workflow execution",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className={cn(
      "bg-card rounded-n8n border overflow-hidden",
      hasError ? "border-destructive border-opacity-50" : "border-border"
    )}>
      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start mb-3 md:mb-0">
            <div className="mr-3 mt-1 flex-shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-n8n flex items-center justify-center",
                getIconBgClass()
              )}>
                <span className={getIconTextClass()}>
                  {getWorkflowIcon()}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium font-poppins text-lg flex items-center">
                {workflow.name}
                <Badge 
                  variant={getBadgeVariant()} 
                  className="ml-2 font-normal"
                >
                  {getBadgeText()}
                </Badge>
              </h3>
              <p className="text-muted-foreground text-sm">
                {workflow.lastExecution 
                  ? `Last run: ${workflow.lastExecution.timeAgo} • ${workflow.active ? `Next run: ${workflow.nextExecution || 'Manual trigger only'}` : 'Manual trigger only'}`
                  : 'No previous executions'}
                {hasError && workflow.lastError && ` • ${workflow.lastError}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {workflow.statistics && (
              <div className="flex items-center mr-4">
                <span className={cn("text-sm mr-1", getSuccessRateClass())}>
                  {workflow.statistics.successRate.toFixed(1)}%
                </span>
                <span className="text-muted-foreground text-xs">success</span>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              title="View details"
            >
              <LucideInfo className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              title="View execution history"
            >
              <LucideHistory className="h-4 w-4" />
            </Button>
            
            <Switch 
              checked={isActive} 
              onCheckedChange={handleToggleActive}
            />
          </div>
        </div>
      </div>
      
      {(workflow.statistics || hasError) && (
        <>
          <Separator />
          
          {hasError && workflow.lastErrorDetails && (
            <div className="p-4 md:p-5">
              <div className="bg-destructive bg-opacity-10 rounded-n8n p-3 flex items-start">
                <LucideAlertTriangle className="text-destructive mr-3 mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-destructive font-medium text-sm">{workflow.lastErrorDetails.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{workflow.lastErrorDetails.description}</p>
                </div>
              </div>
            </div>
          )}
          
          {workflow.statistics && (
            <div className="border-t border-border p-4 md:p-5 hidden md:block">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-8 flex-grow">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Total Executions</p>
                    <p className="text-foreground font-medium">{workflow.statistics.totalExecutions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Average Duration</p>
                    <p className="text-foreground font-medium">{workflow.statistics.avgDuration}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Last Error</p>
                    <p className={cn(
                      "font-medium",
                      workflow.statistics.lastErrorDays ? "text-destructive" : "text-success"
                    )}>
                      {workflow.statistics.lastErrorDays ? `${workflow.statistics.lastErrorDays} days ago` : "None"}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="text-primary hover:text-white hover:bg-primary"
                  onClick={handleExecuteNow}
                  disabled={executing}
                >
                  <LucidePlayCircle className="mr-2 h-4 w-4" />
                  Execute Now
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
