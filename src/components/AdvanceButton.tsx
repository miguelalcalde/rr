"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getNextPerson } from "@/lib/roundRobin";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { requirementOptions, AEs, companyNames } from "@/lib/requirements";
import { ArrowRight, Shuffle } from "lucide-react";

export function AdvanceButton() {
  const router = useRouter();
  const [selectedRequirement, setSelectedRequirement] = useState<string>("");
  const [selectedAE, setSelectedAE] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const aeOptions = AEs.map((ae) => ae);

  const handleAdvance = async () => {
    try {
      const result = await getNextPerson(selectedRequirement, selectedAE, selectedCompany);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.request.company} assigned to ${result.next?.name}`, {
          description: [result.request.requirement, result.request.ae].filter(Boolean).join(" - "),
        });
        // Clear the inputs after successful assignment
        setSelectedRequirement("");
        setSelectedAE("");
        setSelectedCompany("");
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to advance round robin", {
        description: error instanceof Error ? error.message : String(error),
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
      const randomRequirement =
        requirementOptions[Math.floor(Math.random() * requirementOptions.length)];
      setSelectedRequirement(randomRequirement.value);
    } else {
      setSelectedRequirement("");
    }

    const randomCompany = companyNames[Math.floor(Math.random() * companyNames.length)];
    setSelectedCompany(randomCompany);
  };

  return (
    <div className="flex gap-2 items-center justify-end">
      <Button variant="outline" onClick={handleRandom}>
        <Shuffle className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Randomize</span>
      </Button>
      <Input
        value={selectedCompany}
        onChange={(e) => setSelectedCompany(e.target.value)}
        className="w-[200px]"
        placeholder="Company name"
      />
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
      <Button onClick={handleAdvance}>
        <ArrowRight className="w-4 h-4 mr-0 sm:mr-2" />
        <span className="hidden sm:inline">Next</span>
      </Button>
    </div>
  );
}
