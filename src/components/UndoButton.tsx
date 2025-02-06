"use client";

import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { hasEditPermission } from "@/lib/permissions";

export function UndoButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const canEdit = hasEditPermission();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!canEdit) return;
      if (event.shiftKey) {
        if (event.key === "U" || event.key === "u") {
          handleUndo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoading, canEdit]);

  const handleUndo = async () => {
    if (!canEdit) return;
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
    <Button variant="outline" size="sm" onClick={handleUndo} disabled={isLoading || !canEdit}>
      <Undo2 className="w-4 h-4 mr-2" />
      <span>Undo</span>
    </Button>
  );
}
