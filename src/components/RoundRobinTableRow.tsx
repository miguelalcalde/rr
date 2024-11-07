"use client";

import { useTransition } from "react";
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

type TeamMember = {
  name: string;
  next: boolean;
  skip: number;
  OOO: string | null;
  languages: string[];
};

const languageOptions = [
  { label: "Italian", value: "italian" },
  { label: "German", value: "german" },
  { label: "Spanish", value: "spanish" },
];

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

  const handleInputChange = (field: keyof TeamMember, value: any) => {
    startTransition(() => {
      updateTeamMember(allMembers, index, field, value);
    });
  };

  return (
    <TableRow>
      <TableCell>
        <Label>{member.name}</Label>
      </TableCell>
      <TableCell>
        <Checkbox
          checked={member.next}
          onCheckedChange={(checked) => handleInputChange("next", checked)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={member.skip}
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
              {member.OOO ? (
                format(new Date(member.OOO), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={member.OOO ? new Date(member.OOO) : undefined}
              onSelect={(date) =>
                handleInputChange("OOO", date ? date.toISOString() : null)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Select
          isMulti
          options={languageOptions}
          value={languageOptions.filter((option) =>
            member.languages.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            const selectedLanguages = selectedOptions
              ? selectedOptions.map((option) => option.value)
              : [];
            handleInputChange("languages", selectedLanguages);
          }}
          className="w-[200px]"
        />
      </TableCell>
    </TableRow>
  );
}
