"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { FileText, Clock, User, ArrowRight, Building2, Asterisk, Info } from "lucide-react";
import { HistoryEntry } from "@/actions/history";
import { cn } from "@/lib/utils";

export default function CardHistory({ data }: { data: HistoryEntry }) {
  const { timestamp, result } = data;
  console.debug(result);
  return (
    <Card className="p-4 w-full relative">
      {(result.isException || result.reasons?.length > 0) && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-neutral-300">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center space-x-2">
                <Asterisk className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                {result.isException && <p>Assigned out of order</p>}
                {result.reasons?.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {result.reasons.map((reason, index) => (
                      <li key={index} className="text-sm">
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <></>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className="grid grid-cols-5 gap-4 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {new Date(timestamp).toLocaleString()}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Request Timestamp</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className={cn("flex items-center space-x-2", {
                "text-neutral-400": !result.request.requirement,
              })}
            >
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
            <TooltipTrigger className="flex items-center space-x-2 justify-end">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">{result.request.company || "N/A"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {result.request.company
                  ? `Assigned company: ${result.request.company}`
                  : "No company assigned"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage
                  src={`/ses/${
                    result.next?.name.toLowerCase().replaceAll(" ", "-") || "unknown"
                  }.png`}
                  alt={result.next?.name || "Unknown"}
                />
                <AvatarFallback>
                  {result.next?.name ? result.next.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm truncate">{result.next?.name || "Unassigned"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {result.next?.name
                  ? `Assigned to: ${result.next?.name}`
                  : "Not yet assigned" + result.error}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
