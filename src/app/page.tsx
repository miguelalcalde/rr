import { RoundRobinTable } from "@/components/RoundRobinTable";
import { AdvanceButton } from "@/components/AdvanceButton";
import { getTeamData } from "@/actions/team";
import { getHistory, HistoryEntry } from "@/actions/history";
import CardHistory from "@/components/CardHistory";
import { differenceInMilliseconds } from "date-fns";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { UndoButton } from "@/components/UndoButton";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await getTeamData();
  const history = await getHistory();

  if (!result.success) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500">Error: {result.error || "Failed to load team data"}</div>
      </div>
    );
  }

  return (
    <div className="container flex justify-center py-10">
      <div className="z-10 w-full items-center justify-between font-mono text-sm">
        <div className="mb-4">
          <AdvanceButton />
        </div>
        <h2 className="text-xl font-bold mb-4">Team</h2>
        <RoundRobinTable teamData={result.data} />
        {/* <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Current Team Data:</h2>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div> */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">History</h2>
            <UndoButton />
          </div>
          <div className="flex flex-col gap-5">
            {history
              .toSorted((a, b) => differenceInMilliseconds(b.timestamp, a.timestamp))
              .map((e: HistoryEntry) => (
                <CardHistory key={e.timestamp} data={e} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
