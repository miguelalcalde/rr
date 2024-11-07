import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import state from "../../../../standalone/state.json";

export async function GET() {
  try {
    let team = await redis.get("team");
    if (!team) {
      await redis.set("team", JSON.stringify(state));
      team = state;
    } else {
      team = JSON.parse(team);
    }
    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const team = await request.json();
    await redis.set("team", JSON.stringify(team));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating team data:", error);
    return NextResponse.json(
      { error: "Failed to update team data" },
      { status: 500 }
    );
  }
}
