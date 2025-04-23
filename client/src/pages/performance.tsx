import { useState, useEffect } from "react";
import { useN8nWorkflows } from "@/hooks/use-n8n-workflows";
import { useN8nExecutions } from "@/hooks/use-n8n-executions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Workflow } from "@/lib/types";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--accent))"];

export default function Performance() {
  const { workflows, isLoading: isLoadingWorkflows } = useN8nWorkflows();
  const { executions, isLoading: isLoadingExecutions } = useN8nExecutions();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");
  const [filteredWorkflow, setFilteredWorkflow] = useState<Workflow | null>(null);
  
  // Generate sample data for charts
  const [executionTrendData, setExecutionTrendData] = useState<any[]>([]);
  const [durationData, setDurationData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  
  useEffect(() => {
    if (isLoadingWorkflows || isLoadingExecutions) return;
    
    // Update filtered workflow
    if (selectedWorkflow === "all") {
      setFilteredWorkflow(null);
    } else {
      const selected = workflows?.find(w => w.id === selectedWorkflow) || null;
      setFilteredWorkflow(selected);
    }
    
    // Generate execution trend data (last 7 days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Random data for demo - in real app this would come from executions
      trend.push({
        name: dayStr,
        executions: Math.floor(Math.random() * 100) + 10,
        errors: Math.floor(Math.random() * 10),
      });
    }
    setExecutionTrendData(trend);
    
    // Generate duration data
    const durations = [];
    for (let i = 0; i < 10; i++) {
      durations.push({
        name: `Workflow ${i+1}`,
        avgDuration: Math.random() * 3 + 0.5,
      });
    }
    setDurationData(durations);
    
    // Generate status distribution
    setStatusDistribution([
      { name: 'Success', value: 75 },
      { name: 'Error', value: 15 },
      { name: 'Partial', value: 10 },
    ]);
  }, [isLoadingWorkflows, isLoadingExecutions, workflows, executions, selectedWorkflow]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-poppins">Performance Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your workflow efficiency and execution statistics
          </p>
        </div>
        
        <Select 
          value={selectedWorkflow} 
          onValueChange={setSelectedWorkflow}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select workflow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All workflows</SelectItem>
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
      </div>
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingWorkflows ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={executionTrendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="executions" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorExecutions)" />
                  <Area type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorErrors)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingWorkflows ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Workflow Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Average Execution Duration by Workflow</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoadingWorkflows ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={durationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="avgDuration" fill="hsl(var(--secondary))">
                  {durationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Additional Metrics */}
      {filteredWorkflow && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Usage Times</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">8-10 AM</p>
              <p className="text-muted-foreground">Most executions occur during this time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resource Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">325 MB</p>
              <p className="text-muted-foreground">Average memory usage per execution</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execution Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">$0.0032</p>
              <p className="text-muted-foreground">Average cost per execution</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
