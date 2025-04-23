import { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiConfig } from "@/hooks/use-api-config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LucideEye, LucideEyeOff } from "lucide-react";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  apiUrl: z.string().url("Please enter a valid URL").min(1, "API URL is required"),
  apiKey: z.string().min(1, "API Key is required"),
  refreshInterval: z.string(),
  notificationsEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { 
    apiConfig, 
    isFetching, 
    saveApiConfig,
    isSaving,
  } = useApiConfig();
  
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiUrl: "",
      apiKey: "",
      refreshInterval: "60",
      notificationsEnabled: false,
    },
  });

  // Update form when apiConfig changes
  useEffect(() => {
    if (apiConfig) {
      form.reset({
        apiUrl: apiConfig.apiUrl,
        apiKey: apiConfig.apiKey,
        refreshInterval: apiConfig.refreshInterval.toString(),
        notificationsEnabled: apiConfig.notificationsEnabled,
      });
    }
  }, [apiConfig, form]);

  const onSubmit = async (values: FormValues) => {
    await saveApiConfig({
      apiUrl: values.apiUrl,
      apiKey: values.apiKey,
      refreshInterval: parseInt(values.refreshInterval),
      notificationsEnabled: values.notificationsEnabled,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold font-poppins">Settings</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>n8n API URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://your-instance.n8n.cloud/api/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The base URL of your n8n instance API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••••••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <LucideEyeOff className="h-4 w-4" />
                        ) : (
                          <LucideEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your n8n API key for authentication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="refreshInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-Refresh Interval</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select refresh interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often to refresh workflow data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notificationsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable notifications
                    </FormLabel>
                    <FormDescription>
                      Receive notifications for workflow failures
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
