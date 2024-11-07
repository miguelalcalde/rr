import { getTeamData, setTeamData } from "@/actions/team";

export async function getNextPerson(language = "") {
  const result = await getTeamData();
  if (!result.success) {
    throw new Error("Failed to fetch team data");
  }

  let team = result.data;
  const today = new Date();
  let currentIndex = team.findIndex((person) => person.next);
  let startIndex = currentIndex;
  let isException = false;

  while (true) {
    const person = team[currentIndex];

    if (person.OOO && new Date(person.OOO) > today) {
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    }

    if (language && !person.languages.split(",").includes(language)) {
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

    await setTeamData(team);
    return ` -> ${person.name} ${language ? "[" + language + "]" : ""}`;
  }
}
