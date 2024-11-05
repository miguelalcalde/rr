
function getNextPerson(language = "") {
  const today = new Date();
  let currentIndex = team.findIndex((person) => person.next);
  let startIndex = currentIndex;
  let isException = false;

  while (true) {
    const person = team[currentIndex];

    // Check if the person is available (not OOO)
    if (person.OOO && new Date(person.OOO) > today) {
      currentIndex = (currentIndex + 1) % team.length;
      person.next = false;
      continue;
    }

    // If a language is specified, check if the person speaks it
    if (language && !person.languages.split(",").includes(language)) {
      currentIndex = (currentIndex + 1) % team.length;
      isException = true;
      continue;
    }

    // If the person should be skipped, decrement the skip counter
    if (person.skip > 0) {
      person.skip--;
      person.next = false;
      currentIndex = (currentIndex + 1) % team.length;
      continue;
    }

    // Update the next person and increment the skip counter for the next person
    team[currentIndex].next = false;
    const nextIndex = (currentIndex + 1) % team.length;

    if (isException) person.skip++;
    if (!isException) team[nextIndex].next = true;
    return `${person.name} (${language})`;
  }
}

function printTeamTable(team) {
  // Get the maximum length of each property to align the columns
  const maxLengths = {
    name: Math.max(...team.map((member) => member.name.length), 4), // 4 is the length of the header "Name"
    next: Math.max(...team.map((member) => member.next.toString().length), 4), // 4 is the length of the header "Next"
    skip: Math.max(...team.map((member) => member.skip.toString().length), 4), // 4 is the length of the header "Skip"
    OOO: Math.max(...team.map((member) => member.OOO.length), 3), // 3 is the length of the header "OOO"
    languages: Math.max(...team.map((member) => member.languages.length), 9), // 9 is the length of the header "Languages"
  };

  // Print the header row
  const headerRow = `| ${padString("Name", maxLengths.name)} | ${padString(
    "Next",
    maxLengths.next
  )} | ${padString("Skip", maxLengths.skip)} | ${padString(
    "OOO",
    maxLengths.OOO
  )} | ${padString("Languages", maxLengths.languages)} |`;
  console.log(headerRow);
  console.log(`|${"-".repeat(headerRow.length - 2)}|`); // Print the separator line

  // Print each team member row
  team.forEach((member) => {
    const row = `| ${padString(member.name, maxLengths.name)} | ${padString(
      member.next.toString(),
      maxLengths.next
    )} | ${padString(member.skip.toString(), maxLengths.skip)} | ${padString(
      member.OOO,
      maxLengths.OOO
    )} | ${padString(member.languages, maxLengths.languages)} |`;
    console.log(row);
  });
}

// Helper function to pad a string with spaces
function padString(str, length) {
  return "\n" + str.padEnd(length, " ") + "\n";
}

// Example usage
console.log(getNextPerson()); // Output: Alice De Mauro
printTeamTable(team);
console.log(getNextPerson("german")); // Output: Matt Reid
printTeamTable(team);
console.log(getNextPerson()); // Output: Matt Froggett
printTeamTable(team);
console.log(getNextPerson("italian")); // Output: Matt Reid
printTeamTable(team);
console.log(getNextPerson());
printTeamTable(team);
console.log(getNextPerson());
printTeamTable(team);
console.log(getNextPerson());
printTeamTable(team);
console.log(getNextPerson());
printTeamTable(team);
console.log(getNextPerson());
printTeamTable(team);
console.log(getNextPerson());
printTeamTable(team);
