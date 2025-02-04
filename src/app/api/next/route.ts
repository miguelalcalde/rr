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
    const body = await request.json();
    let { requirement = "", ae = "", company = "" } = body;
    requirement = toSnakeCase(requirement);
    // ae should remain in email format
    const result = await getNextPerson(requirement, ae, company);
    revalidateTag("team-data");

    // If no one was assigned, return a specific status code and flag
    if (!result.next) {
      return NextResponse.json(
        {
          result,
          requiresManualOverride: true,
          message: "No eligible SE found. Manual assignment required.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      result,
      requiresManualOverride: false,
    });
  } catch (error) {
    console.error("Error advancing round robin:", error);
    return NextResponse.json(
      {
        error: "Failed to advance round robin",
        requiresManualOverride: true,
        message: "Error occurred during assignment. Manual intervention required.",
      },
      { status: 500 }
    );
  }
}
