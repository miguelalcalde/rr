import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const team = await kv.get("team");
    return NextResponse.json(team || []);
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
    await kv.set("team", team);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating team data:", error);
    return NextResponse.json(
      { error: "Failed to update team data" },
      { status: 500 }
    );
  }
}
