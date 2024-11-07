"use server";

import { revalidateTag } from "next/cache";

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

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/team`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update team data");
    }

    // Revalidate the team data
    revalidateTag("team-data");

    return { success: true };
  } catch (error) {
    console.error("Error updating team member:", error);
    return { success: false, error };
  }
}
