import { getTeamData, setTeamData } from "@/actions/team";
import { TeamMember } from "@/types";

export async function getNextPerson(requirement = "") {
  const result = await getTeamData();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch team data");
  }

  let team = result.data as TeamMember[];
  const today = new Date();
  let currentIndex = team.findIndex((person: TeamMember) => person.next);
  let hasSpecialRequirement = requirement.length > 0;
  let isException = false; // this means we're moving on in the round robin to assign first person that meets the special requirements
  let firstSkippedIndex = -1;

  while (true) {
    let person = team[currentIndex];

    if (firstSkippedIndex === currentIndex) {
      return {
        next: null,
        error: "Error: No one available under current conditions",
      };
    }

    if (person.OOO && new Date(person.OOO) > today) {
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    }

    if (requirement && !person.requirements.includes(requirement)) {
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      isException = true;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    // Not taking into account special requirements.
    if (person.skip > 0 && !isException) {
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      person.skip--;
      person.next = false;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    if (isException) {
      // Find eligible person with lowest skip count
      const eligiblePeople = team.filter(
        (p) =>
          p.requirements.includes(requirement) &&
          (!p.OOO || new Date(p.OOO) <= today)
      );
      const lowestSkip = Math.min(...eligiblePeople.map((p) => p.skip));
      const bestPerson = eligiblePeople.find((p) => p.skip === lowestSkip);

      // Update current person to be the best candidate
      currentIndex = team.findIndex((p) => p.name === bestPerson?.name);
      person = team[currentIndex];
    }

    team[currentIndex].next = false;
    const nextIndex = (currentIndex + 1) % team.length;

    if (hasSpecialRequirement) person.skip++;
    if (!isException) team[nextIndex].next = true;

    const setResult = await setTeamData(team);
    if (!setResult.success) {
      throw new Error(setResult.error || "Failed to update team data");
    }

    // return ` -> ${person.name} ${requirement ? "[" + requirement + "]" : ""}`;
    return { next: person, requirements: requirement };
  }
}
