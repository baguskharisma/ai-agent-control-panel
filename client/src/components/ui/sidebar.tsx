import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LucideLayoutDashboard,
  LucideHistory,
  LucideLineChart,
  LucideBell,
  LucideLink2,
  LucideSettings,
  LucideHelpCircle,
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

const SidebarLink = ({ href, icon, children, isActive }: SidebarLinkProps) => {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center px-3 py-2.5 rounded-n8n text-white transition-colors duration-150 ease-in-out",
        isActive
          ? "bg-primary bg-opacity-10 text-primary font-medium"
          : "hover:bg-muted text-foreground"
      )}
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-card lg:border-r lg:border-border">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <div className="flex items-center">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M6 8.5H18M6 15.5H18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-primary"
            />
            <path 
              d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-primary"
            />
          </svg>
          <h1 className="ml-2 text-xl font-semibold font-poppins text-white">n8n Dashboard</h1>
        </div>
      </div>
      <nav className="flex-1 pt-4 pb-20 overflow-y-auto">
        <div className="px-4 space-y-2">
          <p className="px-2 mb-2 text-xs text-muted-foreground uppercase font-medium">Main</p>
          <SidebarLink 
            href="/" 
            icon={<LucideLayoutDashboard />} 
            isActive={location === "/"}
          >
            Dashboard
          </SidebarLink>
          <SidebarLink 
            href="/executions" 
            icon={<LucideHistory />} 
            isActive={location === "/executions"}
          >
            Execution History
          </SidebarLink>
          <SidebarLink 
            href="/performance" 
            icon={<LucideLineChart />} 
            isActive={location === "/performance"}
          >
            Performance
          </SidebarLink>
          <SidebarLink 
            href="/alerts" 
            icon={<LucideBell />} 
            isActive={location === "/alerts"}
          >
            Alerts
          </SidebarLink>
          <SidebarLink 
            href="/webhooks" 
            icon={<LucideLink2 />} 
            isActive={location === "/webhooks"}
          >
            Webhook Testing
          </SidebarLink>
        </div>
        <div className="px-4 mt-8 space-y-2">
          <p className="px-2 mb-2 text-xs text-muted-foreground uppercase font-medium">Settings</p>
          <SidebarLink 
            href="/settings" 
            icon={<LucideSettings />} 
            isActive={location === "/settings"}
          >
            Settings
          </SidebarLink>
          <SidebarLink 
            href="https://docs.n8n.io/" 
            icon={<LucideHelpCircle />} 
            isActive={false}
          >
            Help & Support
          </SidebarLink>
        </div>
      </nav>
    </aside>
  );
}
