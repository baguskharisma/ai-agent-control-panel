import { useState } from "react";
import { useN8nExecutions } from "@/hooks/use-n8n-executions";
import { useN8nWorkflows } from "@/hooks/use-n8n-workflows";
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
import { LucideFilter, LucideSearch, LucideRefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Executions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | undefined>();
  
  const { 
    executions,
    totalCount,
    isLoading: isLoadingExecutions,
    page,
    pageSize,
    nextPage,
    previousPage,
    refetch
  } = useN8nExecutions(selectedWorkflow);
  
  const { workflows, isLoading: isLoadingWorkflows } = useN8nWorkflows();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-poppins">Execution History</h1>
          <p className="text-muted-foreground mt-1">
            View and filter past workflow executions
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <LucideRefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow down execution results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row w-full gap-3">
            <div className="relative flex-grow">
              <Input 
                type="text" 
                placeholder="Search executions..." 
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
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedWorkflow} 
              onValueChange={setSelectedWorkflow}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select workflow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All workflows</SelectItem>
                {isLoadingWorkflows ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  workflows?.map(workflow => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            <Button className="flex items-center gap-2">
              <LucideFilter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoadingExecutions ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <ExecutionTable 
          executions={executions}
          totalCount={totalCount}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
          currentPage={page}
          pageSize={pageSize}
          isLoading={isLoadingExecutions}
        />
      )}
    </div>
  );
}
