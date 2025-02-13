"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getNextPerson } from "@/lib/roundRobin";
import Select from "react-select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { requirementOptions, AEs, companyNames, SEs } from "@/lib/requirements";
import { ArrowRight, Shuffle } from "lucide-react";
import { getTeamData, setTeamData } from "@/actions/team";
import { addHistoryEntry } from "@/actions/history";
import { TeamMember } from "@/types";
import { components } from "react-select";
import { hasEditPermission } from "@/lib/permissions";

export function AdvanceButton() {
  const router = useRouter();
  const [showRandomize, setShowRandomize] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string>("");
  const [selectedAE, setSelectedAE] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedSE, setSelectedSE] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const canEdit = hasEditPermission();

  const aeOptions = AEs.map((ae) => ae);
  const customOption = (props: any) => {
    const { label, region, segment } = props.data;

    return (
      <components.Option {...props}>
        <div>
          {label}
          <div style={{ fontSize: "0.8em", color: "#666" }}>
            {segment} - {region}
          </div>
        </div>
      </components.Option>
    );
  };

  useEffect(() => {
    const shouldShowRandomize = localStorage.getItem("showRandomize") === "true";
    setShowRandomize(shouldShowRandomize);

    const handleDevModeToggle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "R") {
        e.preventDefault();
        const newShowRandomize = !showRandomize;
        localStorage.setItem("showRandomize", String(newShowRandomize));
        setShowRandomize(newShowRandomize);
        toast.success(`Randomize button ${newShowRandomize ? "enabled" : "disabled"}`);
      }
    };

    window.addEventListener("keydown", handleDevModeToggle);
    return () => window.removeEventListener("keydown", handleDevModeToggle);
  }, [showRandomize]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!canEdit) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.shiftKey) {
        if (event.key === "R" || event.key === "r") {
          handleRandom();
        } else if (event.key === "N" || event.key === "n") {
          handleAdvance();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedRequirement, selectedAE, selectedCompany, canEdit]);

  const handleAdvance = async () => {
    if (!canEdit) return;
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
    if (!canEdit) return;
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

  const handleManualAssign = async () => {
    if (!canEdit) return;
    if (!selectedSE) {
      toast.error("Please select an SE for manual assignment");
      return;
    }

    if (!selectedCompany) {
      toast.error("Please enter a company name in the automatic assignment section");
      return;
    }

    try {
      const result = await getTeamData();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch team data");
      }

      const team = result.data;
      const seIndex = team.findIndex((member) => member.name === selectedSE);

      if (seIndex === -1) {
        throw new Error("Selected SE not found in team data");
      }

      // Increase skip count for manual assignment
      team[seIndex].skip += 1;

      const setResult = await setTeamData(team);
      if (!setResult.success) {
        throw new Error(setResult.error || "Failed to update team data");
      }

      // Add history entry for manual assignment
      await addHistoryEntry(team, {
        request: { requirement: selectedRequirement, ae: selectedAE, company: selectedCompany },
        next: team[seIndex],
        isException: true,
        reasons: [
          `Manual override: Assigned to ${team[seIndex].name}`,
          `Increased skip count for ${team[seIndex].name}`,
          ...(customReason ? [`Custom reason: ${customReason}`] : []),
        ],
      });

      toast.success(`${selectedCompany} manually assigned to ${team[seIndex].name}`, {
        description: [selectedRequirement, selectedAE].filter(Boolean).join(" - "),
      });

      // Clear all inputs after successful assignment
      setSelectedRequirement("");
      setSelectedAE("");
      setSelectedCompany("");
      setSelectedSE("");
      setCustomReason("");
      router.refresh();
    } catch (error) {
      toast.error("Failed to manually assign", {
        description: error instanceof Error ? error.message : String(error),
      });
      console.error("Failed to manually assign:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Automatic Assignment Section */}
      <div className="flex flex-col gap-4 pb-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Automatic Assignment</h2>
          <div className="flex gap-2">
            {showRandomize && (
              <Button variant="outline" onClick={handleRandom} disabled={!canEdit}>
                <Shuffle className="w-4 h-4 mr-2" />
                <span>Randomize</span>
              </Button>
            )}
            <Button onClick={handleAdvance} disabled={!canEdit}>
              <ArrowRight className="w-4 h-4 mr-2" />
              <span>Assign Next</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full sm:w-[200px]"
            placeholder="Company name"
            disabled={!canEdit}
          />
          <Select
            options={requirementOptions}
            value={
              selectedRequirement
                ? requirementOptions.find((option) => option.value === selectedRequirement)
                : null
            }
            onChange={(selectedOption) => {
              setSelectedRequirement(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            className="w-full sm:w-[200px]"
            placeholder="Requirement"
            isDisabled={!canEdit}
          />
          <Select
            components={{ Option: customOption }}
            options={AEs.map((ae) => {
              return {
                ...ae,
                label: ae.label,
              };
            })}
            value={selectedAE ? aeOptions.find((option) => option.value === selectedAE) : null}
            onChange={(selectedOption) => {
              setSelectedAE(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            className="w-full sm:w-[200px]"
            placeholder="AE"
            isDisabled={!canEdit}
          />
        </div>
      </div>

      {/* Manual Override Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Manual Override</h2>
            <p className="text-sm text-muted-foreground">Directly assign to a specific SE</p>
          </div>
          <Button onClick={handleManualAssign} variant="secondary" disabled={!canEdit}>
            <ArrowRight className="w-4 h-4 mr-2" />
            <span>Assign Manually</span>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            options={SEs}
            value={selectedSE ? SEs.find((option) => option.value === selectedSE) : null}
            onChange={(selectedOption) => {
              setSelectedSE(selectedOption ? selectedOption.value : "");
            }}
            isClearable
            className="w-full sm:w-[200px]"
            placeholder="Select SE"
            isDisabled={!canEdit}
          />
          <Input
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="w-full sm:flex-1"
            placeholder="Reason for manual assignment"
            disabled={!canEdit}
          />
        </div>
      </div>
    </div>
  );
}
