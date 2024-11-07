"use client";

import { useTransition, useOptimistic } from "react";
import { updateTeamMember } from "@/actions/team";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableCell, TableRow } from "@/components/ui/table";
import Select from "react-select";
import { TeamMember } from "@/types";
import { requirementOptions } from "@/lib/requirements";

interface RoundRobinTableRowProps {
  member: TeamMember;
  index: number;
  allMembers: TeamMember[];
}

export function RoundRobinTableRow({
  member,
  index,
  allMembers,
}: RoundRobinTableRowProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticMember, setOptimisticMember] = useOptimistic(
    member,
    (state, optimisticValue: { field: keyof TeamMember; value: any }) => ({
      ...state,
      [optimisticValue.field]: optimisticValue.value,
    })
  );

  const handleInputChange = (field: keyof TeamMember, value: any) => {
    setOptimisticMember({ field, value });
    startTransition(() => {
      updateTeamMember(allMembers, index, field, value);
    });
  };

  return (
    <TableRow>
      <TableCell>
        <Label>{optimisticMember.name}</Label>
      </TableCell>
      <TableCell>
        <Checkbox
          checked={optimisticMember.next}
          onCheckedChange={(checked) => handleInputChange("next", checked)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={optimisticMember.skip}
          onChange={(e) =>
            handleInputChange("skip", parseInt(e.target.value, 10))
          }
        />
      </TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {optimisticMember.OOO ? (
                format(new Date(optimisticMember.OOO), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col">
              <Calendar
                mode="single"
                selected={
                  optimisticMember.OOO
                    ? new Date(optimisticMember.OOO)
                    : undefined
                }
                onSelect={(date) =>
                  handleInputChange("OOO", date ? date.toISOString() : null)
                }
                initialFocus
              />
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => handleInputChange("OOO", null)}
              >
                Clear Date
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Select
          isMulti
          options={requirementOptions}
          value={requirementOptions.filter((option) =>
            optimisticMember.requirements.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            const selectedRequirements = selectedOptions
              ? selectedOptions.map((option) => option.value)
              : [];
            handleInputChange("requirements", selectedRequirements);
          }}
          className="w-[200px]"
        />
      </TableCell>
    </TableRow>
  );
}
