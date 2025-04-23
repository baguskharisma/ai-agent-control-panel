import { useQuery } from "@tanstack/react-query";
import { Execution } from "@/lib/types";
import { useApiConfig } from "@/hooks/use-api-config";
import { useState } from "react";

interface ExecutionsData {
  results: Execution[];
  count: number;
}

export function useN8nExecutions(workflowId?: string) {
  const { isConfigured, apiConfig } = useApiConfig();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<ExecutionsData>({
    queryKey: ["/api/executions", { workflowId, page, pageSize }],
    enabled: isConfigured,
    refetchInterval: apiConfig?.refreshInterval ? apiConfig.refreshInterval * 1000 : false,
    queryFn: async ({ queryKey }) => {
      const offset = (page - 1) * pageSize;
      let url = `/api/executions?limit=${pageSize}&offset=${offset}`;
      
      if (workflowId) {
        url += `&workflowId=${workflowId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch executions");
      }
      
      return await response.json();
    },
  });

  const executions = data?.results || [];
  const totalCount = data?.count || 0;

  const nextPage = () => {
    if ((page * pageSize) < totalCount) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return {
    executions,
    totalCount,
    isLoading,
    error,
    refetch,
    page,
    pageSize,
    nextPage,
    previousPage,
    setPageSize,
  };
}
