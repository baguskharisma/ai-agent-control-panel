import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LucideLayoutDashboard,
  LucideHistory,
  LucideLineChart,
  LucideBell,
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex flex-col items-center justify-center w-full h-full",
          isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
};

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 w-full lg:hidden bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        <NavItem
          href="/"
          icon={<LucideLayoutDashboard />}
          label="Dashboard"
          isActive={location === "/"}
        />
        <NavItem
          href="/executions"
          icon={<LucideHistory />}
          label="History"
          isActive={location === "/executions"}
        />
        <NavItem
          href="/performance"
          icon={<LucideLineChart />}
          label="Performance"
          isActive={location === "/performance"}
        />
        <NavItem
          href="/alerts"
          icon={<LucideBell />}
          label="Alerts"
          isActive={location === "/alerts"}
        />
      </div>
    </nav>
  );
}
