"use client";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportHistory } from "@/actions/history";

export function MoreButton() {
  const handleExport = async () => {
    try {
      const csvContent = await exportHistory();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `rr-history-${timestamp}.csv`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error during export:", error);
      // You might want to add some UI feedback here
    }
  };

  const handleRestore = () => {
    // To be implemented
    console.log("Restore functionality not implemented yet");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExport}>Export history</DropdownMenuItem>
        <DropdownMenuItem onClick={handleRestore}>Restore history</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
