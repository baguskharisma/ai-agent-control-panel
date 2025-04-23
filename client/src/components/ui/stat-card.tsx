import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  positive?: boolean;
  variant?: "default" | "error" | "success" | "warning";
}

export function StatCard({ 
  title, 
  value, 
  change, 
  positive = true,
  variant = "default" 
}: StatCardProps) {
  const getValueClass = () => {
    switch (variant) {
      case "error":
        return "text-destructive";
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      default:
        return "text-primary";
    }
  };

  const getChangeClass = () => {
    if (positive) return "text-success";
    return "text-destructive";
  };

  return (
    <div className="bg-card p-4 rounded-n8n border border-border flex flex-col">
      <span className="text-muted-foreground text-sm">{title}</span>
      <div className="flex items-baseline mt-1">
        <span className={cn("text-2xl font-semibold", getValueClass())}>
          {value}
        </span>
        {change !== undefined && (
          <span className={cn("ml-2 text-xs", getChangeClass())}>
            {positive ? "+" : "-"}{change}
          </span>
        )}
      </div>
    </div>
  );
}
