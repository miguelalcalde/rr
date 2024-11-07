"use server";

import { revalidateTag } from "next/cache";
import redis from "@/lib/redis";
import state from "../../standalone/state.json";

export async function getTeamData() {
  try {
    let team = await redis.json.get("team", "$");
    if (!team) {
      await redis.json.set("team", "$", state);
      team = state;
    }
    return { success: true, data: team };
  } catch (error) {
    console.error("Error fetching team data:", error);
    return { success: false, error };
  }
}

export async function setTeamData(teamData: any) {
  try {
    await redis.json.set("team", "$", teamData);
    revalidateTag("team-data");
    return { success: true };
  } catch (error) {
    console.error("Error updating team data:", error);
    return { success: false, error };
  }
}

export async function updateTeamMember(
  teamData: any[],
  index: number,
  field: string,
  value: any
) {
  const newData = [...teamData];

  if (field === "next" && value === true) {
    newData.forEach((item, i) => {
      item.next = i === index;
    });
  } else {
    newData[index][field] = value;
  }

  return setTeamData(newData);
}
