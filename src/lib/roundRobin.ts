import redis from "@/lib/redis";

type TeamMember = {
  name: string;
  next: boolean;
  skip: number;
  OOO: string;
  languages: string;
};

export async function getNextPerson(language = "") {
  // Get team from Redis
  const teamJson = await redis.get("team");
  if (!teamJson) {
    throw new Error("Team data not found in Redis");
  }

  let team: TeamMember[] = JSON.parse(teamJson);
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

    // Save updated team state back to Redis
    await redis.set("team", JSON.stringify(team));

    return ` -> ${person.name} ${language ? "[" + language + "]" : ""}`;
  }
}
