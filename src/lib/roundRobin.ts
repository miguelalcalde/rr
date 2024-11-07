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
  let startIndex = currentIndex;
  let isException = false;

  while (true) {
    const person = team[currentIndex];

    if (person.OOO && new Date(person.OOO) > today) {
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    }

    if (language && !person.languages.includes(language)) {
      currentIndex = (currentIndex + 1) % team.length;
      isException = true;
      continue;
    }

    if (person.skip > 0) {
      person.skip--;
      person.next = false;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    team[currentIndex].next = false;
    const nextIndex = (currentIndex + 1) % team.length;

    if (isException) person.skip++;
    if (!isException) team[nextIndex].next = true;

    const setResult = await setTeamData(team);
    if (!setResult.success) {
      throw new Error(setResult.error || "Failed to update team data");
    }

    return ` -> ${person.name} ${language ? "[" + language + "]" : ""}`;
  }
}
