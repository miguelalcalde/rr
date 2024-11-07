"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import Select from "react-select";

type TeamMember = {
  name: string;
  next: boolean;
  skip: number;
  OOO: Date | null;
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
  onUpdate: (index: number, field: keyof TeamMember, value: any) => void;
}

export function RoundRobinTableRow({
  member,
  index,
  onUpdate,
}: RoundRobinTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Label>{member.name}</Label>
      </TableCell>
      <TableCell>
        <Checkbox
          checked={member.next}
          onCheckedChange={(checked) => onUpdate(index, "next", checked)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={member.skip}
          onChange={(e) =>
            onUpdate(index, "skip", parseInt(e.target.value, 10))
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
                format(member.OOO, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={member.OOO || undefined}
              onSelect={(date) => onUpdate(index, "OOO", date)}
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
            onUpdate(index, "languages", selectedLanguages);
          }}
          className="w-[200px]"
        />
      </TableCell>
    </TableRow>
  );
}
