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
    reasons: string[];
  };
};

export async function addHistoryEntry(
  teamState: TeamMember[],
  result?: HistoryEntry["result"]
): Promise<void> {
  try {
    const historyStr = await redis.get("history");
    const history: HistoryEntry[] = historyStr ? JSON.parse(historyStr) : [];

    const newEntry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      teamState,
      result: result ?? {
        request: { requirement: "", ae: "", company: "" },
        next: null,
        reasons: [],
      },
    };

    history.push(newEntry);
    // console.log(`saving history entry...`);
    // console.log(history.map((e) => e.teamState));
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

export async function exportHistory(): Promise<string> {
  try {
    const history = await getHistory();

    // Define CSV headers
    const headers = [
      "Timestamp",
      "Team State",
      "Request Requirement",
      "Request AE",
      "Request Company",
      "Next Person",
      "Is Exception",
      "Requirements",
      "Error",
      "Reasons",
    ].join(",");

    // Convert each history entry to CSV row
    const rows = history.map((entry) => {
      const teamState = JSON.stringify(entry.teamState).replace(/"/g, '""'); // Escape quotes for CSV
      const nextPerson = entry.result.next
        ? JSON.stringify(entry.result.next).replace(/"/g, '""')
        : "";
      const reasons = entry.result.reasons
        ? entry.result.reasons.join("; ").replace(/"/g, '""')
        : "";

      return [
        entry.timestamp,
        `"${teamState}"`, // Wrap in quotes to handle commas in JSON
        `"${entry.result.request.requirement}"`,
        `"${entry.result.request.ae}"`,
        `"${entry.result.request.company}"`,
        `"${nextPerson}"`,
        entry.result.isException || false,
        `"${entry.result.requirements || ""}"`,
        `"${entry.result.error || ""}"`,
        `"${reasons}"`,
      ].join(",");
    });

    // Combine headers and rows
    return [headers, ...rows].join("\n");
  } catch (error) {
    console.error("Error exporting history:", error);
    throw error;
  }
}
