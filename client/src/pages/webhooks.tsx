import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WebhookTest, WebhookTestResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LucidePlus,
  LucideLink2,
  LucidePlay,
  LucideTrash2,
  LucideCheck,
  LucideX,
  LucideLoader,
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Please enter a valid URL"),
  method: z.string().min(1, "Method is required"),
  headers: z.string().optional(),
  body: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Webhooks() {
  const [open, setOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookTest | null>(null);
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch webhook tests
  const { data: webhookTests = [], isLoading: isLoadingWebhooks } = useQuery<WebhookTest[]>({
    queryKey: ["/api/webhook-tests"],
  });
  
  // Create webhook test mutation
  const { mutate: createWebhookTest, isPending: isCreating } = useMutation({
    mutationFn: async (values: FormValues) => {
      // Parse headers from JSON string
      let headers = {};
      if (values.headers) {
        try {
          headers = JSON.parse(values.headers);
        } catch (error) {
          throw new Error("Invalid headers JSON format");
        }
      }
      
      const payload = {
        ...values,
        headers,
      };
      
      const response = await apiRequest("POST", "/api/webhook-tests", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Webhook test created", description: "The webhook test has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/webhook-tests"] });
      setOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create webhook test", 
        description: error instanceof Error ? error.message : "There was an error creating the webhook test.", 
        variant: "destructive" 
      });
    },
  });
  
  // Delete webhook test mutation
  const { mutate: deleteWebhookTest } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/webhook-tests/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Webhook test deleted", description: "The webhook test has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/webhook-tests"] });
      setSelectedWebhook(null);
    },
    onError: () => {
      toast({ 
        title: "Failed to delete webhook test", 
        description: "There was an error deleting the webhook test.", 
        variant: "destructive" 
      });
    },
  });
  
  // Execute webhook test
  const executeWebhookTest = async (id: number) => {
    setIsTestingWebhook(true);
    setTestResult(null);
    
    try {
      const response = await apiRequest("POST", `/api/webhook-tests/${id}/execute`);
      const result = await response.json();
      setTestResult(result);
      toast({ 
        title: "Webhook executed", 
        description: `Status code: ${result.status} ${result.statusText}`,
        variant: result.status >= 200 && result.status < 300 ? "default" : "destructive",
      });
    } catch (error) {
      toast({ 
        title: "Failed to execute webhook", 
        description: "There was an error executing the webhook test.", 
        variant: "destructive" 
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      method: "POST",
      headers: '{\n  "Content-Type": "application/json"\n}',
      body: '{\n  "data": "example"\n}',
    },
  });
  
  const onSubmit = (values: FormValues) => {
    createWebhookTest(values);
  };
  
  // Format JSON for display
  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-poppins">Webhook Testing</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and test webhooks for your workflows
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <LucidePlus className="h-4 w-4" />
              New Webhook Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Webhook Test</DialogTitle>
              <DialogDescription>
                Set up a new webhook test configuration
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Webhook Test" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this webhook test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormLabel>Method</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/webhook" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="headers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headers (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{ "Content-Type": "application/json" }'
                          className="font-mono h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Headers to send with the request in JSON format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Body (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{ "data": "example" }'
                          className="font-mono h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Request body in JSON format (ignored for GET requests)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Webhook Test"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Webhook List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>My Webhook Tests</CardTitle>
              <CardDescription>
                Select a webhook to view or test
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWebhooks ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : webhookTests.length === 0 ? (
                <div className="text-center py-8">
                  <LucideLink2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">No webhook tests found</p>
                  <Button 
                    variant="link" 
                    onClick={() => setOpen(true)}
                    className="mt-2"
                  >
                    Create your first webhook test
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {webhookTests.map(webhook => (
                    <div 
                      key={webhook.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedWebhook?.id === webhook.id 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted border border-transparent"
                      }`}
                      onClick={() => setSelectedWebhook(webhook)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant="outline">{webhook.method}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{webhook.url}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Webhook Details */}
        <div className="md:col-span-2">
          {selectedWebhook ? (
            <Card>
              <CardHeader className="flex flex-row justify-between items-start space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    {selectedWebhook.name}
                    <Badge variant="outline" className="ml-2">{selectedWebhook.method}</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedWebhook.url}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteWebhookTest(selectedWebhook.id)}
                  >
                    <LucideTrash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => executeWebhookTest(selectedWebhook.id)}
                    disabled={isTestingWebhook}
                  >
                    {isTestingWebhook ? (
                      <LucideLoader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LucidePlay className="h-4 w-4 mr-2" />
                    )}
                    Execute
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="request">
                  <TabsList className="mb-4">
                    <TabsTrigger value="request">Request</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="request">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Headers</h4>
                        <pre className="bg-muted p-4 rounded-md overflow-auto text-xs font-mono">
                          {JSON.stringify(selectedWebhook.headers, null, 2)}
                        </pre>
                      </div>
                      
                      {selectedWebhook.body && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Body</h4>
                          <pre className="bg-muted p-4 rounded-md overflow-auto text-xs font-mono">
                            {formatJson(selectedWebhook.body)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="response">
                    {testResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">Status:</h4>
                          <Badge 
                            variant={testResult.status >= 200 && testResult.status < 300 ? "success" : "destructive"}
                            className="flex items-center gap-1"
                          >
                            {testResult.status >= 200 && testResult.status < 300 ? (
                              <LucideCheck className="h-3 w-3" />
                            ) : (
                              <LucideX className="h-3 w-3" />
                            )}
                            {testResult.status} {testResult.statusText}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Response Headers</h4>
                          <pre className="bg-muted p-4 rounded-md overflow-auto text-xs font-mono">
                            {JSON.stringify(testResult.headers, null, 2)}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Response Body</h4>
                          <pre className="bg-muted p-4 rounded-md overflow-auto text-xs font-mono">
                            {JSON.stringify(testResult.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No response data available</p>
                        <p className="text-sm text-muted-foreground mt-1">Execute the webhook to see the response</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="text-xs text-muted-foreground">
                Created on {new Date(selectedWebhook.createdAt).toLocaleString()}
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-8 text-center">
              <LucideLink2 className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Webhook Selected</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Select a webhook from the list to view its details or create a new one to get started with webhook testing
              </p>
              <Button onClick={() => setOpen(true)}>
                <LucidePlus className="h-4 w-4 mr-2" />
                Create New Webhook Test
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
