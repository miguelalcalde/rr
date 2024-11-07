import { NextResponse } from "next/server";
import { getNextPerson } from "@/lib/roundRobin";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const { language } = await request.json();
    const nextPerson = await getNextPerson(language);

    // Revalidate only team-data tagged cache entries
    revalidateTag("team-data");

    return NextResponse.json({ nextPerson });
  } catch (error) {
    console.error("Error advancing round robin:", error);
    return NextResponse.json(
      { error: "Failed to advance round robin" },
      { status: 500 }
    );
  }
}
