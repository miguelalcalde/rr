import { RoundRobinTableRow } from "./RoundRobinTableRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamMember } from "@/types";

interface RoundRobinTableProps {
  teamData: TeamMember[];
}

export function RoundRobinTable({ teamData }: RoundRobinTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] min-w-[100px] text-xs md:text-sm">
              Name
            </TableHead>
            <TableHead className="w-[80px] min-w-[80px] text-xs md:text-sm">
              Next
            </TableHead>
            <TableHead className="w-[80px] min-w-[80px] text-xs md:text-sm">
              Skip
            </TableHead>
            <TableHead className="w-[200px] min-w-[200px] text-xs md:text-sm">
              OOO
            </TableHead>
            <TableHead className="w-[300px] min-w-[300px] text-xs md:text-sm">
              Requirements
            </TableHead>
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
    </div>
  );
}
