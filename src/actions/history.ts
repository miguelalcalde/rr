"use server";
import redis from "@/lib/redis";
import { TeamMember } from "@/types";
import { revalidateTag } from "next/cache";

export type HistoryEntry = {
  timestamp: string;
  teamState: TeamMember[];
  result: {
    request: { requirement: string; ae: string; company: string };
    next: TeamMember | null;
    isException?: boolean;
    requirements?: string;
    error?: string;
  };
};

export async function addHistoryEntry(teamState: TeamMember[], result?: HistoryEntry["result"]): Promise<void> {
  try {
    const historyStr = await redis.get("history");
    const history: HistoryEntry[] = historyStr ? JSON.parse(historyStr) : [];

    const newEntry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      teamState,
      result: result ?? {
        request: { requirement: "", ae: "", company: "" },
        next: null,
      },
    };

    history.push(newEntry);
    await redis.set("history", JSON.stringify(history));
    revalidateTag("history-data");
  } catch (error) {
    console.error("Error adding history entry:", error);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const historyStr = await redis.get("history");
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
}
