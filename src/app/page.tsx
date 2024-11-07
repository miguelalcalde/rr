import { RoundRobinTable } from "@/components/RoundRobinTable";
import { AdvanceButton } from "@/components/AdvanceButton";

async function getTeamData() {
  const res = await fetch(`${process.env.VERCEL_URL}/api/team`, {
    next: { tags: ["team-data"] },
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default async function Page() {
  const teamData = await getTeamData();

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
