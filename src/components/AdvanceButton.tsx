"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getNextPerson } from "@/lib/roundRobin";

export function AdvanceButton() {
  const router = useRouter();

  const handleAdvance = async () => {
    try {
      const nextPerson = await getNextPerson();
      alert(`Next person${nextPerson}`);
      // Refresh the current route and fetch new data
      router.refresh();
    } catch (error) {
      console.error("Failed to advance round robin:", error);
      alert("Failed to advance round robin");
    }
  };

  return <Button onClick={handleAdvance}>Advance Round Robin</Button>;
}
