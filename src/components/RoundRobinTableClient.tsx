"use client";

import { useState } from "react";
import { RoundRobinTableRow } from "./RoundRobinTableRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TeamMember = {
  name: string;
  next: boolean;
  skip: number;
  OOO: Date | null;
  languages: string[];
};

interface RoundRobinTableClientProps {
  initialData: TeamMember[];
}

export function RoundRobinTableClient({
  initialData,
}: RoundRobinTableClientProps) {
  const [data, setData] = useState<TeamMember[]>(initialData);

  const handleInputChange = (
    index: number,
    field: keyof TeamMember,
    value: any
  ) => {
    const newData = [...data];
    if (field === "next" && value === true) {
      // Ensure only one 'next' is true
      newData.forEach((item, i) => {
        item.next = i === index;
      });
    } else {
      // @ts-expect-error
      newData[index][field] = value;
    }
    setData(newData);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Next</TableHead>
          <TableHead>Skip</TableHead>
          <TableHead>OOO</TableHead>
          <TableHead>Languages</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((member, index) => (
          <RoundRobinTableRow
            key={member.name}
            member={member}
            index={index}
            onUpdate={handleInputChange}
          />
        ))}
      </TableBody>
    </Table>
  );
}
