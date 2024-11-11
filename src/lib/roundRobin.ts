import { getTeamData, setTeamData } from "@/actions/team";
import { TeamMember } from "@/types";
import { toast } from "sonner";
import { addHistoryEntry } from "@/actions/history";

const meetsRequirements = (person: any, requirement: string) => {
  return !requirement || person.requirements.includes(requirement);
};

const worksWithAE = (person: any, ae: string) => {
  return !ae || person.aes.length <= 0 || person.aes.includes(ae);
};

const logState = (person: any, currentIndex: number) => {
  console.log(`currentIndex: ${currentIndex}, person ↓`);
  console.log(person);
};

export async function getNextPerson(requirement = "", ae = "") {
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
    console.log("loop start");
    logState(person, currentIndex);

    if (firstSkippedIndex === currentIndex) {
      const errorResult = {
        request: { requirement, ae },
        next: null,
        error: "Error: No one available under current conditions",
      };
      await addHistoryEntry(team, errorResult);
      return errorResult;
    }

    if (person.OOO && new Date(person.OOO) > today) {
      console.log(`Skip: OOO`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    }

    if (requirement && !meetsRequirements(person, requirement)) {
      console.log(`Skip: requirements`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      isException = true;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    if (ae && !worksWithAE(person, ae)) {
      console.log(`Skip: AE`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      isException = true;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    // Not taking into account special requirements.
    if (person.skip > 0 && !isException) {
      console.log(`Skip: Skip`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      person.skip--;
      person.next = false;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    if (isException) {
      // Find eligible people
      const eligiblePeople = team.filter((p) => {
        return (
          meetsRequirements(p, requirement) &&
          worksWithAE(p, ae) &&
          (!p.OOO || new Date(p.OOO) <= today)
        );
      });

      // Find the index of the person marked as next
      const nextPersonIndex = team.findIndex((p) => p.next);

      // Reorder eligible people starting from the next person
      const reorderedEligible = [
        ...eligiblePeople.filter((_, i) => team.indexOf(_) >= nextPersonIndex),
        ...eligiblePeople.filter((_, i) => team.indexOf(_) < nextPersonIndex),
      ];

      const lowestSkip = Math.min(...reorderedEligible.map((p) => p.skip));
      const bestPerson = reorderedEligible.find((p) => p.skip === lowestSkip);

      // Update current person to be the best candidate
      currentIndex = team.findIndex((p) => p.name === bestPerson?.name);
      person = team[currentIndex];
    }
    console.log("loop end");
    logState(person, currentIndex);
    team[currentIndex].next = false;
    const nextIndex = (currentIndex + 1) % team.length;

    if (isException) person.skip++;
    if (!isException) team[nextIndex].next = true;

    const setResult = await setTeamData(team);
    if (!setResult.success) {
      const errorResult = {
        request: { requirement, ae },
        next: null,
        error: setResult.error || "Failed to update team data",
      };
      await addHistoryEntry(team, errorResult);
      return errorResult;
    }

    const roundRobinResult = {
      request: { requirement, ae },
      next: person,
      requirements: requirement,
    };

    await addHistoryEntry(team, roundRobinResult);
    return roundRobinResult;
  }
}
