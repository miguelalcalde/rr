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
    let { requirement = "", ae = "" } = body;
    requirement = toSnakeCase(requirement);
    ae = toSnakeCase(ae);
    const result = await getNextPerson(requirement, ae);
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
