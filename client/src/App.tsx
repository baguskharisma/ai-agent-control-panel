import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Executions from "@/pages/executions";
import Performance from "@/pages/performance";
import Alerts from "@/pages/alerts";
import Webhooks from "@/pages/webhooks";
import Settings from "@/pages/settings";
import Sidebar from "@/components/ui/sidebar";
import MobileHeader from "@/components/ui/mobile-header";
import MobileNavigation from "@/components/ui/mobile-navigation";
import { useLocation } from "wouter";
import { ApiConfigProvider } from "@/hooks/use-api-config";

function Router() {
  const [location] = useLocation();
  
  const getTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/executions":
        return "Execution History";
      case "/performance":
        return "Performance";
      case "/alerts":
        return "Alerts";
      case "/webhooks":
        return "Webhook Testing";
      case "/settings":
        return "Settings";
      default:
        return "n8n Dashboard";
    }
  };

  return (
    <div className="min-h-screen">
      <MobileHeader title={getTitle()} />
      <Sidebar />
      
      <main className="pt-16 lg:pt-0 lg:pl-64 pb-16 lg:pb-0 min-h-screen">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/executions" component={Executions} />
          <Route path="/performance" component={Performance} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/webhooks" component={Webhooks} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <MobileNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiConfigProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ApiConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
