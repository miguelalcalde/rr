"use client";

import { RoundRobinTableRow } from "./RoundRobinTableRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateTeamMember } from "@/actions/team";

type TeamMember = {
  name: string;
  next: boolean;
  skip: number;
  OOO: Date | null;
  languages: string[];
};

interface RoundRobinTableProps {
  teamData: TeamMember[];
}

export function RoundRobinTable({ teamData }: RoundRobinTableProps) {
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
        {teamData.map((member, index) => (
          <RoundRobinTableRow
            key={member.name}
            member={member}
            index={index}
            allMembers={teamData}
          />
        ))}
      </TableBody>
    </Table>
  );
}
