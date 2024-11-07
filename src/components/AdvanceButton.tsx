"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getNextPerson } from "@/lib/roundRobin";
import Select from "react-select";
import { useState } from "react";
import { toast } from "sonner";

const languageOptions = [
  { label: "Italian", value: "italian" },
  { label: "German", value: "german" },
  { label: "Spanish", value: "spanish" },
];

export function AdvanceButton() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const handleAdvance = async () => {
    try {
      const nextPerson = await getNextPerson(selectedLanguage);
      toast.success(`Next person${nextPerson}`);
      // Refresh the current route and fetch new data
      router.refresh();
    } catch (error) {
      toast.error("Failed to advance round robin");
      console.error("Failed to advance round robin:", error);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Select
        options={languageOptions}
        value={languageOptions.find(
          (option) => option.value === selectedLanguage
        )}
        onChange={(selectedOption) => {
          setSelectedLanguage(selectedOption ? selectedOption.value : "");
        }}
        isClearable
        className="w-[200px]"
        placeholder="Select language"
      />
      <Button onClick={handleAdvance}>Advance Round Robin</Button>
    </div>
  );
}
