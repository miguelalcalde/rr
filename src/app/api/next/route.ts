import { NextResponse } from "next/server";
import { getNextPerson } from "@/lib/roundRobin";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    let requirement = "";

    try {
      const body = await request.json();
      requirement = body.requirement || "";
    } catch {
      // If JSON parsing fails or body is empty, continue with default empty requirement
    }

    const result = await getNextPerson(requirement);
    revalidateTag("team-data");

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error advancing round robin:", error);
    return NextResponse.json(
      { error: "Failed to advance round robin" },
      { status: 500 }
    );
  }
}
