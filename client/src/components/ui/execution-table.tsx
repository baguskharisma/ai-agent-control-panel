import { Execution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExecutionTableProps {
  executions: Execution[];
  totalCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
}

export default function ExecutionTable({
  executions,
  totalCount,
  onPreviousPage,
  onNextPage,
  currentPage,
  pageSize,
  isLoading = false,
}: ExecutionTableProps) {
  const startNumber = (currentPage - 1) * pageSize + 1;
  const endNumber = Math.min(startNumber + executions.length - 1, totalCount);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = endNumber < totalCount;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "error":
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "warning":
      case "partial":
      case "partial_success":
        return <Badge variant="warning">Partial Success</Badge>;
      case "running":
        return <Badge variant="default">Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="bg-card rounded-n8n border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Workflow
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Execution Time
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Duration
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-40"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="h-4 bg-muted rounded w-24 ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : executions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No executions found
                </TableCell>
              </TableRow>
            ) : (
              executions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {execution.workflowName}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(execution.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {execution.startedAt}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {execution.duration}s
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="link"
                      className="text-primary hover:text-primary hover:underline"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-border flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalCount === 0 
            ? "No executions" 
            : `Showing ${startNumber}-${endNumber} of ${totalCount} executions`}
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-r-none"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none border-l-0"
            onClick={onNextPage}
            disabled={!hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
