import { useEffect } from "react";
import { useApiConfig } from "@/hooks/use-api-config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LucideEye, LucideEyeOff, LucideSave } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  apiUrl: z.string().url("Please enter a valid URL").min(1, "API URL is required"),
  apiKey: z.string().min(1, "API Key is required"),
  refreshInterval: z.string(),
  notificationsEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function Settings() {
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
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-poppins">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your n8n dashboard connection and preferences
        </p>
      </div>
      
      {isFetching ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Connect to your n8n instance by providing your API credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <Alert className="bg-muted border-primary/20">
                  <AlertTitle>How to get your API key</AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground">
                    1. Go to your n8n instance and click on your profile in the top right<br />
                    2. Select 'Settings' from the dropdown menu<br />
                    3. Navigate to 'API' in the left sidebar<br />
                    4. Generate a new API key with appropriate permissions<br />
                  </AlertDescription>
                </Alert>
              </CardContent>
              <Separator />
              <CardHeader>
                <CardTitle>Dashboard Preferences</CardTitle>
                <CardDescription>
                  Customize your dashboard experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="refreshInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auto-Refresh Interval</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        How often to automatically refresh workflow data
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
                          Enable Notifications
                        </FormLabel>
                        <FormDescription>
                          Receive browser notifications for workflow failures
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <LucideSave className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
                <CardDescription>
                  Configure the visual appearance of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  Currently using dark theme optimized for n8n workflows.
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>
                  n8n Dashboard Information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support</span>
                  <a href="https://docs.n8n.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    n8n Documentation
                  </a>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
