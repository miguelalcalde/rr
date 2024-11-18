import { NextResponse } from "next/server";
import { getHistory } from "@/actions/history";
import { setTeamData } from "@/actions/team";
import redis from "@/lib/redis";
import { revalidateTag } from "next/cache";

export async function POST() {
  try {
    const history = await getHistory();

    if (history.length === 0) {
      return NextResponse.json({ success: false, error: "No history to undo" }, { status: 400 });
    }

    // Get the last history entry
    const lastEntry = history.pop();

    // Update team state to previous state
    console.log(`reverting state...`);
    console.log(lastEntry?.teamState);
    const result = await setTeamData(lastEntry.teamState);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to restore team state" },
        { status: 500 }
      );
    }

    // Remove the last history entry
    await redis.set("history", JSON.stringify(history));

    // Revalidate cached data
    revalidateTag("history-data");
    revalidateTag("team-data");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error undoing last assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to undo last assignment" },
      { status: 500 }
    );
  }
}
