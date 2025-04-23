import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";

export default function AddWorkflowFAB() {
  return (
    <div className="fixed right-4 bottom-20 lg:bottom-8 lg:right-8 z-40 flex flex-col items-end space-y-2">
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg transition-all duration-200 ease-in-out bg-primary hover:bg-secondary"
      >
        <LucidePlus className="h-6 w-6" />
      </Button>
    </div>
  );
}
