"use client";

import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function UndoButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // ... existing imports ...

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        if (event.key === "U" || event.key === "u") {
          handleUndo();
        } /*  else if (event.key === "N" || event.key === "n") {
            handleAdvance();
          } */
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoading]); // Empty dependency array since handlers are stable

  const handleUndo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/undo", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to undo");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Successfully undid last assignment");
      } else {
        toast.error("Nothing to undo");
      }

      router.refresh();
    } catch (error) {
      toast.error("Failed to undo last assignment", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleUndo} disabled={isLoading}>
      <Undo2 className="w-4 h-4 mr-2" />
      <span>Undo</span>
    </Button>
  );
}
