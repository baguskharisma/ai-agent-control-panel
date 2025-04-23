import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useN8nWorkflows } from "@/hooks/use-n8n-workflows";
import { Alert } from "@/lib/types";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LucidePlus, LucideBell, LucideTrash2 } from "lucide-react";

const formSchema = z.object({
  workflowId: z.string().min(1, "Workflow is required"),
  workflowName: z.string().min(1),
  alertType: z.enum(["failure", "success", "partial_success"]),
  threshold: z.string().transform(val => parseInt(val)),
  enabled: z.boolean().default(true),
  message: z.string().min(1, "Message is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Alerts() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { workflows, isLoading: isLoadingWorkflows } = useN8nWorkflows();
  
  // Fetch alerts
  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/workflow-alerts"],
  });
  
  // Create alert mutation
  const { mutate: createAlert, isPending: isCreating } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/workflow-alerts", values);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Alert created", description: "The alert has been created successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-alerts"] });
      setOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Failed to create alert", 
        description: "There was an error creating the alert.", 
        variant: "destructive" 
      });
    },
  });
  
  // Delete alert mutation
  const { mutate: deleteAlert } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workflow-alerts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Alert deleted", description: "The alert has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-alerts"] });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete alert", 
        description: "There was an error deleting the alert.", 
        variant: "destructive" 
      });
    },
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workflowId: "",
      workflowName: "",
      alertType: "failure",
      threshold: "1",
      enabled: true,
      message: "",
    },
  });
  
  const onSubmit = (values: FormValues) => {
    createAlert(values);
  };
  
  // Handle workflow selection
  const handleWorkflowChange = (workflowId: string) => {
    const workflow = workflows?.find(w => w.id === workflowId);
    if (workflow) {
      form.setValue("workflowName", workflow.name);
    }
  };
  
  // Get alert type badge
  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case "failure":
        return <Badge variant="destructive">Failure</Badge>;
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "partial_success":
        return <Badge variant="warning">Partial Success</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-poppins">Workflow Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Configure alerts for your workflow executions
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <LucidePlus className="h-4 w-4" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Set up notifications for specific workflow events
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="workflowId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleWorkflowChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a workflow" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="alertType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="failure">Failure</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="partial_success">Partial Success</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        When should this alert be triggered?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threshold</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of occurrences before triggering the alert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a message for this alert"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Alert
                        </FormLabel>
                        <FormDescription>
                          Activate this alert immediately
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
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoadingAlerts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex justify-center mb-4">
              <LucideBell className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No alerts configured</h3>
            <p className="text-muted-foreground mb-6">
              Create your first alert to get notified about workflow executions
            </p>
            <Button onClick={() => setOpen(true)}>
              <LucidePlus className="h-4 w-4 mr-2" />
              Add Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map(alert => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{alert.workflowName}</CardTitle>
                    <CardDescription className="mt-1">
                      {getAlertTypeBadge(alert.alertType)}
                      <span className="ml-2">
                        Threshold: {alert.threshold}
                      </span>
                    </CardDescription>
                  </div>
                  <Switch checked={alert.enabled} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(alert.createdAt).toLocaleDateString()}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteAlert(alert.id)}
                >
                  <LucideTrash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
