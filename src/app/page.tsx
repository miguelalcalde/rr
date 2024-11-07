import { RoundRobinTable } from "@/components/RoundRobinTable";
import { AdvanceButton } from "@/components/AdvanceButton";
import { getTeamData } from "@/actions/team";

export default async function Page() {
  const result = await getTeamData();

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
    <div className="container mx-auto py-10">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="mb-4">
          <AdvanceButton />
        </div>
        <RoundRobinTable teamData={result.data} />
      </div>
      {/* <div>
        <h2>Team Data:</h2>
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
      </div> */}
    </div>
  );
}
