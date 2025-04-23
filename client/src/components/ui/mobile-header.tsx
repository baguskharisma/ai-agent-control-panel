import { useCallback } from "react";
import { useLocation, useRouter } from "wouter";
import { cn } from "@/lib/utils";
import { LucideArrowLeft, LucideSearch, LucideSettings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModal } from "@/components/settings-modal";
import { useApiConfig } from "@/hooks/use-api-config";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function MobileHeader({ title, showBackButton = false }: MobileHeaderProps) {
  const [location] = useLocation();
  const router = useRouter();
  const { showSettingsModal, setShowSettingsModal } = useApiConfig();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSettings = useCallback(() => {
    setShowSettingsModal(true);
  }, [setShowSettingsModal]);

  const handleSearch = useCallback(() => {
    // Placeholder for future search functionality
    alert("Search functionality to be implemented");
  }, []);

  return (
    <>
      <header className="lg:hidden fixed top-0 w-full bg-background z-50 border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 text-white" 
                onClick={handleBack}
              >
                <LucideArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold font-poppins text-white">{title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={handleSearch}
            >
              <LucideSearch className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={handleSettings}
            >
              <LucideSettings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <SettingsModal 
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />
    </>
  );
}
