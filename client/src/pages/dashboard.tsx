import { useState, useEffect } from "react";
import { useN8nWorkflows } from "@/hooks/use-n8n-workflows";
import { useN8nExecutions } from "@/hooks/use-n8n-executions";
import { useApiConfig } from "@/hooks/use-api-config";
import { WorkflowCard } from "@/components/ui/workflow-card";
import { StatCard } from "@/components/ui/stat-card";
import ExecutionTable from "@/components/ui/execution-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddWorkflowFAB from "@/components/add-workflow-fab";
import { LucideFilter, LucideSearch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Workflow } from "@/lib/types";

export default function Dashboard() {
  const { isConfigured, setShowSettingsModal } = useApiConfig();
  const { 
    workflows,
    isLoading: isLoadingWorkflows
  } = useN8nWorkflows();
  
  const { 
    executions,
    totalCount,
    isLoading: isLoadingExecutions,
    page,
    pageSize,
    nextPage,
    previousPage
  } = useN8nExecutions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  
  // Calculate statistics from workflows
  const activeWorkflows = workflows?.filter(w => w.active).length || 0;
  const executionsToday = executions?.length || 0;
  const failedRuns = workflows?.reduce((count, workflow) => 
    count + (workflow.statistics?.failedExecutions || 0), 0) || 0;
  const successRate = workflows?.length ? 
    workflows.reduce((total, workflow) => 
      total + (workflow.statistics?.successRate || 0), 0) / workflows.length : 0;
    
  // Create an object for easy consumption in the JSX
  const stats = {
    activeWorkflows,
    executionsToday,
    failedRuns,
    successRate
  };
  
  // Filter workflows based on search and status
  useEffect(() => {
    if (!workflows) {
      setFilteredWorkflows([]);
      return;
    }
    
    let filtered = [...workflows];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(workflow => 
        workflow.name.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(workflow => {
        switch (statusFilter) {
          case "active":
            return workflow.active;
          case "inactive":
            return !workflow.active;
          case "error":
            return workflow.lastExecution?.status === "error";
          default:
            return true;
        }
      });
    }
    
    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm, statusFilter]);

  if (!isConfigured) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Welcome to n8n Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Please configure your n8n API settings to get started
          </p>
          <Button 
            onClick={() => setShowSettingsModal(true)}
          >
            Configure Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Stats overview */}
      <div className="mb-6 slide-in">
        <h2 className="text-xl font-semibold font-poppins mb-4">Workflow Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingWorkflows ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))
          ) : (
            <>
              <StatCard 
                title="Active Workflows" 
                value={stats.activeWorkflows} 
                change={2} 
                positive={true} 
              />
              <StatCard 
                title="Executions Today" 
                value={stats.executionsToday} 
                change={124} 
                positive={true} 
              />
              <StatCard 
                title="Failed Runs" 
                value={stats.failedRuns} 
                change={3} 
                positive={false} 
                variant="error" 
              />
              <StatCard 
                title="Success Rate" 
                value={`${stats.successRate.toFixed(1)}%`} 
                change="0.5%" 
                positive={stats.successRate >= 95} 
                variant={stats.successRate >= 95 ? "success" : "warning"} 
              />
            </>
          )}
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 slide-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold font-poppins">My Workflows</h2>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative flex-grow">
              <Input 
                type="text" 
                placeholder="Search workflows..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <LucideSearch className="h-4 w-4" />
              </span>
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex items-center gap-2">
              <LucideFilter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Workflows list */}
      <div className="space-y-4 slide-in" style={{ animationDelay: "0.2s" }}>
        {isLoadingWorkflows ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : filteredWorkflows.length === 0 ? (
          <div className="bg-card p-8 rounded-n8n border border-border text-center">
            <h3 className="text-lg font-medium mb-2">No workflows found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Connect your n8n instance to see workflows"}
            </p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))
        )}
      </div>
      
      {/* Recent executions */}
      <div className="mt-8 slide-in" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-xl font-semibold font-poppins mb-4">Recent Executions</h2>
        <ExecutionTable 
          executions={executions}
          totalCount={totalCount}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
          currentPage={page}
          pageSize={pageSize}
          isLoading={isLoadingExecutions}
        />
      </div>
      
      <AddWorkflowFAB />
    </div>
  );
}