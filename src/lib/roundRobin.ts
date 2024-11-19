import { getTeamData, setTeamData } from "@/actions/team";
import { TeamMember } from "@/types";
import { toast } from "sonner";
import { addHistoryEntry } from "@/actions/history";
import { format } from "date-fns";

const meetsRequirements = (person: any, requirement: string) => {
  return !requirement || person.requirements.includes(requirement);
};

const worksWithAE = (person: any, ae: string) => {
  return !ae || person.aes.length <= 0 || person.aes.includes(ae);
};

const logState = (person: any, currentIndex: number) => {
  console.debug(`currentIndex: ${currentIndex}, person ↓`);
  console.debug(person);
};

type Result = {
  request: {
    company: string;
    requirement: string;
    ae: string;
  };
  isException?: boolean;
  next: any;
  reasons: string[];
  error?: string;
};

export async function getNextPerson(requirement = "", ae = "", company = ""): Promise<Result> {
  const result = await getTeamData();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch team data");
  }
  let oldTeam = JSON.parse(JSON.stringify(result.data)); // deep clone result.data
  let team = result.data as TeamMember[];
  const today = new Date();
  let currentIndex = team.findIndex((person: TeamMember) => person.next);
  let hasSpecialRequirement = requirement.length > 0;
  let isException = false; // this means we're moving on in the round robin to assign first person that meets the special requirements
  let firstSkippedIndex = -1;
  let reasons = [];

  while (true) {
    let person = team[currentIndex];
    console.debug("loop start");
    logState(person, currentIndex);

    if (firstSkippedIndex === currentIndex) {
      const errorResult = {
        request: { requirement, ae, company },
        isException,
        next: null,
        reasons,
        error: "Error: No one available under current conditions",
      };
      await addHistoryEntry(oldTeam, errorResult);
      return errorResult;
    }

    if (person.OOO && new Date(person.OOO).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)) {
      reasons.push(`Skip: ${person.name} is OOO until ${format(new Date(person.OOO), "PPP")}`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    } else if (person.OOO) {
      person.OOO = "";
    }

    if (requirement && !meetsRequirements(person, requirement)) {
      reasons.push(`Skip: ${person.name} doesn't meet the requirement ${requirement}`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      isException = true;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    if (ae && !worksWithAE(person, ae)) {
      reasons.push(`Skip: ${person.name} doesn't work with ${ae}`);
      console.debug(`Skip: AE`);
      if (firstSkippedIndex === -1) firstSkippedIndex = currentIndex;
      isException = true;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    // Not taking into account special requirements.
    if (person.skip > 0 && !isException) {
      reasons.push(`Skip: ${person.name} must be skipped ${person.skip} times`);
      reasons.push(`Edit: Decreasing ${person.name} skip count`);
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
          (!p.OOO || new Date(p.OOO).setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0))
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
      reasons.push(
        "Assign: Assigning out of order to the candidate with the lowest skip value: " +
          `${bestPerson?.name} (${bestPerson?.skip}) out of [${eligiblePeople
            .map((e) => `${e?.name} (${e?.skip})`)
            .join(", ")}]`
      );
      // Update current person to be the best candidate
      currentIndex = team.findIndex((p) => p.name === bestPerson?.name);
      person = team[currentIndex];
    }

    console.debug("loop end");
    logState(person, currentIndex);
    team[currentIndex].next = false;
    const nextIndex = (currentIndex + 1) % team.length;

    if (isException) {
      reasons.push(`Edit: Increasing skip for ${person.name}, assigning out of order`);
      // ensure next remains where it was before assignment
      team.find((p) => p.name === oldTeam.find((q) => q.next).name).next = true;
      person.skip++;
    }
    if (!isException) team[nextIndex].next = true;
    console.log(`SETTING TEAM...`);
    const setResult = await setTeamData(team);
    if (!setResult.success) {
      const errorResult = {
        request: { requirement, ae, company },
        isException,
        next: null,
        reasons,
        error: setResult.error || "Failed to update team data",
      };
      await addHistoryEntry(oldTeam, errorResult);
      return errorResult;
    }

    const roundRobinResult = {
      request: { requirement, ae, company },
      isException,
      next: person,
      reasons,
      requirements: requirement,
    };

    await addHistoryEntry(oldTeam, roundRobinResult);
    return roundRobinResult;
  }
}
