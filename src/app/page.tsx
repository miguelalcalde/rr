"use server";
import { RoundRobinTable } from "@/components/RoundRobinTable";
import { AdvanceButton } from "@/components/AdvanceButton";
import { getTeamData } from "@/actions/team";
import { error } from "console";

export default async function Page() {
  const result = await getTeamData();
  const teamData = result.success ? result.data : result.error;
  console.log(`TEAM DATA: `);
  console.log(teamData);
  return (
    <div className="container mx-auto py-10">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="mb-4">
          <AdvanceButton />
        </div>
        <RoundRobinTable teamData={teamData} />
      </div>
      <div>
        <h2>Team Data:</h2>
        <pre>{JSON.stringify(teamData, null, 2)}</pre>
      </div>
    </div>
  );
}
