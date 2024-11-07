"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getNextPerson } from "@/lib/roundRobin";
import Select from "react-select";
import { useState } from "react";
import { toast } from "sonner";
import { requirementOptions } from "@/lib/requirements";
import { ArrowRight } from "lucide-react";

export function AdvanceButton() {
  const router = useRouter();
  const [selectedRequirement, setSelectedRequirement] = useState<string>("");

  const handleAdvance = async () => {
    try {
      const result = await getNextPerson(selectedRequirement);
      if (result.error) {
        toast.warning(result.error);
      } else {
        toast.success(`Next task assigned to ${result.next?.name}`, {
          description: result.requirements,
        });
      }
      // Refresh the current route and fetch new data
      router.refresh();
    } catch (error) {
      toast.error("Failed to advance round robin");
      console.error("Failed to advance round robin:", error);
    }
  };

  return (
    <div className="flex gap-2 items-center justify-end">
      <Select
        options={requirementOptions}
        value={requirementOptions.find(
          (option) => option.value === selectedRequirement
        )}
        onChange={(selectedOption) => {
          setSelectedRequirement(selectedOption ? selectedOption.value : "");
        }}
        isClearable
        className="w-[200px]"
        placeholder="Requirement"
      />
      <Button onClick={handleAdvance}>
        <ArrowRight className="w-4 h-4" />
        Next
      </Button>
    </div>
  );
}
