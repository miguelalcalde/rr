import { getTeamData, setTeamData } from "@/actions/team";
import { TeamMember } from "@/types";

export async function getNextPerson(language = "") {
  const result = await getTeamData();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch team data");
  }

  let team = result.data as TeamMember[];
  const today = new Date();
  let currentIndex = team.findIndex((person: TeamMember) => person.next);
  let hasSpecialRequirement = language.length > 0;
  let firstSkippedIndex = -1;

  while (true) {
    const person = team[currentIndex];

    if (firstSkippedIndex === currentIndex) {
      return "Error: No one available under current conditions";
    }

    if (person.OOO && new Date(person.OOO) > today) {
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    }

    if (language && !person.languages.includes(language)) {
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    // Not taking into account special requirements.
    if (person.skip > 0 && !hasSpecialRequirement) {
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      person.skip--;
      person.next = false;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    team[currentIndex].next = false;
    const nextIndex = (currentIndex + 1) % team.length;

    if (hasSpecialRequirement) person.skip++;
    if (!hasSpecialRequirement) team[nextIndex].next = true;

    const setResult = await setTeamData(team);
    if (!setResult.success) {
      throw new Error(setResult.error || "Failed to update team data");
    }

    return ` -> ${person.name} ${language ? "[" + language + "]" : ""}`;
  }
}
