import { RoundRobinTableClient } from "@/components/RoundRobinTableClient";

async function getTeamData() {
  const res = await fetch(`${process.env.VERCEL_URL}/api/team`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch team data");
  }
  return res.json();
}

export default async function RoundRobinTable() {
  const initialData = await getTeamData();

  return (
    <div className="container mx-auto py-10">
      <RoundRobinTableClient initialData={initialData} />
    </div>
  );
}
