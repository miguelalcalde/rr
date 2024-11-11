"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { FileText, Clock, User, ArrowRight } from "lucide-react";
import { HistoryEntry } from "@/actions/history";

export default function CardHistory({ data }: { data: HistoryEntry }) {
  const { timestamp, result } = data;

  return (
    <Card className="p-4 w-full ">
      <div className="grid grid-cols-4 gap-4 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">{new Date(timestamp).toLocaleString()}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Request Timestamp</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">{result.request.requirement || "N/A"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{result.request.requirement || "No specific requirements"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">{result.request.ae || "N/A"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{result.request.ae ? `Assigned AE: ${result.request.ae}` : "No AE assigned"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={`/ses/${result.next?.name.toLowerCase().replaceAll(" ", "-") || "unknown"}.png`} alt={result.next?.name || "Unknown"} />
                <AvatarFallback>{result.next?.name ? result.next.name.charAt(0).toUpperCase() : "?"}</AvatarFallback>
              </Avatar>
              <span className="text-sm truncate">{result.next?.name || "Unassigned"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{result.next?.name ? `Assigned to: ${result.next?.name}` : "Not yet assigned" + result.error}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
