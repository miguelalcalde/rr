import { NextResponse } from "next/server";
import { getTeamData, setTeamData } from "@/actions/team";

export async function GET() {
  const result = await getTeamData();

  if (result.success) {
    return NextResponse.json(result.data);
  } else {
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const team = await request.json();
    const result = await setTeamData(team);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error("Error updating team data:", error);
    return NextResponse.json(
      { error: "Failed to update team data" },
      { status: 500 }
    );
  }
}
