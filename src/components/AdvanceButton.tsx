"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getNextPerson } from "@/lib/roundRobin";
import Select from "react-select";
import { useState } from "react";
import { toast } from "sonner";
import { requirementOptions, AEs } from "@/lib/requirements";
import { ArrowRight, Shuffle } from "lucide-react";

export function AdvanceButton() {
  const router = useRouter();
  const [selectedRequirement, setSelectedRequirement] = useState<string>("");
  const [selectedAE, setSelectedAE] = useState<string>("");

  const aeOptions = AEs.map((ae) => ae);

  const handleAdvance = async () => {
    try {
      const result = await getNextPerson(selectedRequirement, selectedAE);
      if (result.error) {
        toast.warning(result.error);
      } else {
        toast.success(`Next task assigned to ${result.next?.name}`, {
          description: [result.request.requirement, result.request.ae].filter(Boolean).join(" - "),
        });
        // Clear the inputs after successful assignment
        setSelectedRequirement("");
        setSelectedAE("");
      }
      // Refresh the current route and fetch new data
      router.refresh();
    } catch (error) {
      toast.error("Failed to advance round robin", {
        description: error?.toString(),
        duration: Infinity,
        closeButton: true,
      });
      console.error("Failed to advance round robin:", error);
    }
  };

  const handleRandom = () => {
    // Always select a random AE
    const randomAE = AEs[Math.floor(Math.random() * AEs.length)];
    setSelectedAE(randomAE.value);

    // Select requirement 30% of the time
    const shouldSelectRequirement = Math.random() < 0.3;
    if (shouldSelectRequirement) {
      const randomRequirement = requirementOptions[Math.floor(Math.random() * requirementOptions.length)];
      setSelectedRequirement(randomRequirement.value);
    } else {
      setSelectedRequirement("");
    }
  };

  return (
    <div className="flex gap-2 items-center justify-end">
      <Select
        options={requirementOptions}
        value={requirementOptions.find((option) => option.value === selectedRequirement)}
        onChange={(selectedOption) => {
          setSelectedRequirement(selectedOption ? selectedOption.value : "");
        }}
        isClearable
        className="w-[200px]"
        placeholder="Requirement"
      />
      <Select
        options={aeOptions}
        value={aeOptions.find((option) => option.value === selectedAE)}
        onChange={(selectedOption) => {
          setSelectedAE(selectedOption ? selectedOption.value : "");
        }}
        isClearable
        className="w-[200px]"
        placeholder="AE"
      />
      <Button variant="outline" onClick={handleRandom}>
        <Shuffle className="w-4 h-4 mr-2" />
        Random
      </Button>
      <Button onClick={handleAdvance}>
        <ArrowRight className="w-4 h-4" />
        Next
      </Button>
    </div>
  );
}
