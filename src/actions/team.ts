"use server";
import { revalidateTag } from "next/cache";
import redis from "@/lib/redis";
import state from "../../standalone/state.json";
import { TeamMember, TeamDataResponse } from "@/types";

export async function getTeamData(): Promise<TeamDataResponse> {
  try {
    const teamStr = await redis.get("team");
    let team = teamStr ? JSON.parse(teamStr) : null;

    if (!team) {
      team = state;
      try {
        await redis.set("team", JSON.stringify(state));
      } catch (error) {
        console.error("Failed to set initial state in Redis:", error);
        return {
          success: false,
          data: [],
          error: "Failed to initialize team data",
        };
      }
    }
    return { success: true, data: team };
  } catch (error) {
    console.error("Error fetching team data:", error);
    return { success: false, data: [], error: "Failed to fetch team data" };
  }
}

export async function setTeamData(
  teamData: TeamMember[] | undefined
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!teamData) throw "Undefined team data";
    const sanitizedData = JSON.stringify(teamData);
    await redis.set("team", sanitizedData);
    revalidateTag("team-data");
    return { success: true };
  } catch (error) {
    console.error("Error updating team data:", error);
    return { success: false, error: "Failed to update team data" };
  }
}

export async function updateTeamMember(
  teamData: TeamMember[],
  index: number,
  field: keyof TeamMember,
  value: any
) {
  const newData = [...teamData];

  if (field === "next" && value === true) {
    newData.forEach((item, i) => {
      item.next = i === index;
    });
  } else {
    // @ts-expect-error
    newData[index][field] = value;
  }

  return setTeamData(newData);
}
