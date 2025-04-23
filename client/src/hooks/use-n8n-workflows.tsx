import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workflow } from "@/lib/types";
import { useApiConfig } from "@/hooks/use-api-config";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useN8nWorkflows() {
  const queryClient = useQueryClient();
  const { apiConfig, isConfigured } = useApiConfig();
  const { toast } = useToast();

  // Fetch workflows
  const {
    data: workflows = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    enabled: isConfigured,
    refetchInterval: apiConfig?.refreshInterval ? apiConfig.refreshInterval * 1000 : false,
  });

  // Toggle workflow active state
  const { mutate: toggleWorkflowActive, isPending: isToggling } = useMutation({
    mutationFn: async ({ 
      workflowId, 
      active 
    }: { 
      workflowId: string; 
      active: boolean 
    }) => {
      const endpoint = active ? `/api/workflows/${workflowId}/activate` : `/api/workflows/${workflowId}/deactivate`;
      await apiRequest("POST", endpoint);
    },
    onMutate: async ({ workflowId, active }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/workflows"] });
      
      // Snapshot the previous value
      const previousWorkflows = queryClient.getQueryData<Workflow[]>(["/api/workflows"]);
      
      // Optimistically update to the new value
      if (previousWorkflows) {
        queryClient.setQueryData<Workflow[]>(
          ["/api/workflows"],
          previousWorkflows.map((workflow) =>
            workflow.id === workflowId
              ? { ...workflow, active }
              : workflow
          )
        );
      }
      
      return { previousWorkflows };
    },
    onSuccess: (_, { active, workflowId }) => {
      const action = active ? "activated" : "deactivated";
      toast({
        title: `Workflow ${action}`,
        description: `The workflow has been ${action} successfully.`,
      });
    },
    onError: (err, { active }, context) => {
      const action = active ? "activate" : "deactivate";
      toast({
        title: `Failed to ${action} workflow`,
        description: `There was an error trying to ${action} the workflow.`,
        variant: "destructive",
      });
      
      // Rollback to the previous state
      if (context?.previousWorkflows) {
        queryClient.setQueryData(["/api/workflows"], context.previousWorkflows);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
  });

  return {
    workflows,
    isLoading,
    error,
    refetch,
    mutate: toggleWorkflowActive,
    isToggling,
  };
}
