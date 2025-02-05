"use client";

import { useTransition, useOptimistic } from "react";
import { updateTeamMember } from "@/actions/team";
import { addDays, addHours, format } from "date-fns";
import { CalendarIcon, MoreHorizontal, Trash2, Coffee, Cookie, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Select from "react-select";
import { TeamMember } from "@/types";
import { requirementOptions, AEs } from "@/lib/requirements";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface RoundRobinTableRowProps {
  member: TeamMember;
  index: number;
  allMembers: TeamMember[];
}

export function RoundRobinTableRow({ member, index, allMembers }: RoundRobinTableRowProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticMember, setOptimisticMember] = useOptimistic(
    member,
    (state, optimisticValue: { field: keyof TeamMember; value: any }) => ({
      ...state,
      [optimisticValue.field]: optimisticValue.value,
    })
  );

  const prevNext = useRef(member.next);
  const prevSkip = useRef(member.skip);
  const prevOOO = useRef(member.OOO);

  const nextChanged = prevNext.current !== optimisticMember.next;
  const skipChanged = prevSkip.current !== optimisticMember.skip;
  const oooChanged = prevOOO.current !== optimisticMember.OOO;

  useEffect(() => {
    prevNext.current = optimisticMember.next;
    prevSkip.current = optimisticMember.skip;
    prevOOO.current = optimisticMember.OOO;
  }, [optimisticMember.next, optimisticMember.skip, optimisticMember.OOO]);

  const handleInputChange = (field: keyof TeamMember, value: any) => {
    setOptimisticMember({ field, value });
    startTransition(() => {
      updateTeamMember(allMembers, index, field, value);
    });
  };

  const handlePodAction = (action: string) => {
    switch (action) {
      case "clear":
        handleInputChange("aes", []);
        break;
      case "uk":
        const ukAEs = AEs.filter((ae) => ae.region === "UK").map((ae) => ae.value);
        handleInputChange(
          "aes",
          Array.from(new Set(Array.from(optimisticMember.aes).concat(ukAEs)))
        );
        break;
      case "dach":
        const dachAEs = AEs.filter((ae) => ae.region === "DACH").map((ae) => ae.value);
        handleInputChange(
          "aes",
          Array.from(new Set(Array.from(optimisticMember.aes).concat(dachAEs)))
        );
        break;
      case "ns":
        const nsAEs = AEs.filter((ae) => ae.region === "NS").map((ae) => ae.value);
        handleInputChange(
          "aes",
          Array.from(new Set(Array.from(optimisticMember.aes).concat(nsAEs)))
        );
        break;
    }
  };

  return (
    <TableRow>
      <TableCell className="w-[150px] min-w-[100px]">
        <Label className="line-clamp-1 text-xs md:text-sm">{optimisticMember.name}</Label>
      </TableCell>
      <TableCell className="w-[80px] min-w-[80px] text-center !pr-4">
        <Checkbox
          checked={optimisticMember.next}
          onCheckedChange={(checked) => handleInputChange("next", checked)}
        />
      </TableCell>
      <TableCell className={cn("w-[80px] min-w-[80px]", skipChanged && "animate-highlight")}>
        <Input
          type="number"
          value={optimisticMember.skip}
          onChange={(e) => handleInputChange("skip", parseInt(e.target.value, 10))}
          className="w-full text-xs md:text-sm"
        />
      </TableCell>
      <TableCell className={cn("w-[200px] min-w-[200px]", oooChanged && "animate-highlight")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal truncate text-xs md:text-sm"
            >
              <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4 shrink-0" />
              <span
                className={cn("truncate", {
                  "text-gray-400": !optimisticMember.OOO,
                })}
              >
                {optimisticMember.OOO
                  ? format(new Date(optimisticMember.OOO), "PPP")
                  : "Pick a date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col">
              <Calendar
                mode="single"
                selected={optimisticMember.OOO ? new Date(optimisticMember.OOO) : undefined}
                onSelect={(date) => {
                  console.log(date);
                  handleInputChange("OOO", date ? addHours(date, 12).toISOString() : null);
                }}
                initialFocus
                weekStartsOn={1}
              />
              <Button
                variant="ghost"
                className="mt-2 text-xs md:text-sm"
                onClick={() => handleInputChange("OOO", null)}
              >
                Clear Date
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell className="w-[300px] min-w-[300px] max-w-[300px]">
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
          className="w-full text-xs md:text-sm"
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              minWidth: "100%",
              maxWidth: "280px",
              fontSize: "inherit",
            }),
            menu: (base) => ({
              ...base,
              minWidth: "100%",
              maxWidth: "280px",
              fontSize: "inherit",
            }),
            option: (base) => ({
              ...base,
              fontSize: "inherit",
            }),
            multiValue: (base) => ({
              ...base,
              flex: "0 0 auto",
            }),
            valueContainer: (base) => ({
              ...base,
              display: "flex",
              flexWrap: "nowrap",
              overflow: "auto",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingRight: "8px",
              "::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
            }),
          }}
        />
      </TableCell>
      <TableCell className="w-[300px] min-w-[300px] max-w-[300px]">
        <Select
          isMulti
          options={AEs}
          value={AEs.filter((option) => optimisticMember.aes.includes(option.value))}
          onChange={(selectedOptions) => {
            const selectedAEs = selectedOptions
              ? selectedOptions.map((option) => option.value)
              : [];
            handleInputChange("aes", selectedAEs);
          }}
          className="w-full text-xs md:text-sm"
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              minWidth: "100%",
              maxWidth: "280px",
              fontSize: "inherit",
            }),
            menu: (base) => ({
              ...base,
              minWidth: "100%",
              maxWidth: "280px",
              fontSize: "inherit",
            }),
            option: (base) => ({
              ...base,
              fontSize: "inherit",
            }),
            multiValue: (base) => ({
              ...base,
              flex: "0 0 auto",
            }),
            valueContainer: (base) => ({
              ...base,
              display: "flex",
              flexWrap: "nowrap",
              overflow: "auto",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingRight: "8px",
              "::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
            }),
          }}
        />
      </TableCell>
      <TableCell className="w-[50px] min-w-[50px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePodAction("clear")}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear pods
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePodAction("uk")}>
              <Coffee className="mr-2 h-4 w-4" />
              Assign UK pod
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePodAction("dach")}>
              <Cookie className="mr-2 h-4 w-4" />
              Assign DACH pod
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePodAction("ns")}>
              <Salad className="mr-2 h-4 w-4" />
              Assign NS pod
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
