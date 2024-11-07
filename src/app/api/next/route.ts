import { NextResponse } from "next/server";
import { getNextPerson } from "@/lib/roundRobin";
import { revalidateTag } from "next/cache";

function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-") // Replace any non-alphanumeric chars with hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .replace(/-/g, "-"); // Replace remaining hyphens with underscores
}

export async function POST(request: Request) {
  try {
    let requirement = "";

    try {
      const body = await request.json();
      requirement = toSnakeCase(body.requirement || "");
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
