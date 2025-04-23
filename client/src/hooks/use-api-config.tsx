import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type N8nConfig } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ApiConfigContextType {
  apiConfig: N8nConfig | null;
  isConfigured: boolean;
  isFetching: boolean;
  isSaving: boolean;
  saveApiConfig: (config: Omit<N8nConfig, "id">) => Promise<void>;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export function ApiConfigProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch API configuration
  const { 
    data: apiConfig, 
    isLoading: isFetching,
    error,
  } = useQuery({
    queryKey: ["/api/n8n-config"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/n8n-config");
        if (!res.ok) {
          // If 404, that's okay - just means no config yet
          if (res.status === 404) {
            return null;
          }
          throw new Error(`Error fetching API config: ${res.statusText}`);
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching API config:", error);
        return null;
      }
    },
  });

  // If no config is found, show settings modal
  useEffect(() => {
    if (!isFetching && !apiConfig && !error) {
      setShowSettingsModal(true);
    }
  }, [apiConfig, isFetching, error]);

  // Save API configuration
  const { mutateAsync: saveApiConfig, isPending: isSaving } = useMutation({
    mutationFn: async (config: Omit<N8nConfig, "id">) => {
      const response = await apiRequest("POST", "/api/n8n-config", config);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/n8n-config"], data);
      toast({
        title: "Settings saved",
        description: "Your n8n API configuration has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: "There was an error saving your API configuration.",
        variant: "destructive",
      });
      console.error("Error saving API config:", error);
    },
  });

  const isConfigured = Boolean(apiConfig);

  const value = {
    apiConfig: apiConfig || null,
    isConfigured,
    isFetching,
    isSaving,
    saveApiConfig,
    showSettingsModal,
    setShowSettingsModal,
  };

  return (
    <ApiConfigContext.Provider value={value}>
      {children}
    </ApiConfigContext.Provider>
  );
}

export function useApiConfig() {
  const context = useContext(ApiConfigContext);
  if (context === undefined) {
    throw new Error("useApiConfig must be used within an ApiConfigProvider");
  }
  return context;
}
