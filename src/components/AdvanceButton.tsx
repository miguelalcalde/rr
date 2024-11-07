"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AdvanceButton() {
  const router = useRouter();

  const handleAdvance = async () => {
    try {
      const response = await fetch("/api/advance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: "" }),
      });

      const data = await response.json();
      router.refresh();

      if (data.nextPerson) {
        alert(`Next person${data.nextPerson}`);
        // Refresh the current route and fetch new data
        router.refresh();
      }
    } catch (error) {
      alert("Failed to advance round robin");
    }
  };

  return <Button onClick={handleAdvance}>Advance Round Robin</Button>;
}
