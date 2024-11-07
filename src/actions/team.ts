"use server";

import { revalidateTag } from "next/cache";
import redis from "@/lib/redis";
import state from "../../standalone/state.json";

export async function getTeamData() {
  try {
    let team = await redis.json.get("team", "$");
    if (!team) {
      console.log("Using local state fallback");
      team = state;
      try {
        await redis.json.set("team", "$", state);
      } catch (error) {
        console.warn("Failed to set initial state in Redis:", error);
      }
    }
    return { success: true, data: JSON.parse(JSON.stringify(team)) };
  } catch (error) {
    console.error("Error fetching team data:", error);
    return { success: true, data: JSON.parse(JSON.stringify(state)) };
  }
}

export async function setTeamData(teamData: any) {
  try {
    const sanitizedData = JSON.parse(JSON.stringify(teamData));
    await redis.json.set("team", "$", sanitizedData);
    revalidateTag("team-data");
    return { success: true };
  } catch (error) {
    console.error("Error updating team data:", error);
    return { success: false, error: "Failed to update team data" };
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
