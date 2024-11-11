import { RoundRobinTable } from "@/components/RoundRobinTable";
import { AdvanceButton } from "@/components/AdvanceButton";
import { getTeamData } from "@/actions/team";
import { getHistory } from "@/actions/history";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await getTeamData();
  const history = await getHistory();

  if (!result.success) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500">
          Error: {result.error || "Failed to load team data"}
        </div>
      </div>
    );
  }

  return (
    <div className="container flex justify-center py-10">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="mb-4">
          <AdvanceButton />
        </div>
        <RoundRobinTable teamData={result.data} />
        {/* <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Current Team Data:</h2>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div> */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">History:</h2>
          <pre>{JSON.stringify(history, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
