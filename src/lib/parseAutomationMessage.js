// Function to parse Slack automation messages into structured data
async function parseAutomationMessage(message) {
  // Remove the usage line in parentheses at the end
  message = message.replace(/\(used in #.*\)$/s, "").trim();

  // Extract requester from first line
  const requesterMatch = message.match(/^Requester: (.+)/);
  let requester = requesterMatch ? requesterMatch[1].trim() : "";

  // Helper function to extract field content
  const extractField = (field) => {
    const regex = new RegExp(`\\*${field}\\*\\n([\\s\\S]*?)(?=\\n\\*|$)`);
    const match = message.match(regex);
    if (!match) return "";

    const content = match[1].trim();
    // Check if field is empty (contains only newlines or whitespace)
    if (!content || content.replace(/\s+/g, "").length === 0) return "";

    return content;
  };

  // Extract basic fields
  const accountName = extractField("Account Name");
  const sfOpportunityLink = extractField("SF Opportunity link");
  const description = extractField("Description");
  const nextCallRaw = extractField("Next call");
  const flexibilityRaw = extractField("Flexibility");
  const otherRequirements = extractField("Other requirements");

  // Extract SF Opportunity ID from link
  const sfOpportunityId = sfOpportunityLink.match(/Opportunity\/(.*?)(?:\/|$)/)
    ? sfOpportunityLink.match(/Opportunity\/(.*?)(?:\/|$)/)[1]
    : "";

  // Parse next call date
  let nextCall = null;
  if (nextCallRaw) {
    // Try to parse various date formats
    const dateMatch = nextCallRaw.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      // If we have just a date, set it to noon UTC
      nextCall = new Date(dateMatch[1] + "T12:00:00Z").toISOString();
    } else {
      // Try to parse more complex date formats
      const date = new Date(nextCallRaw);
      if (!isNaN(date.getTime())) {
        nextCall = date.toISOString();
      }
    }
  }

  // Parse flexibility (true means IS flexible, false means NOT flexible)
  const flexibility = !flexibilityRaw.includes("NOT flexible");

  // Map requirements to the format expected by the API
  const requirementMapping = {
    German: "german",
    Italian: "italian",
    Spanish: "spanish",
    "United Kingdom on-site required": "uk-based",
    "German on-site required": "german-based",
    "Spain on-site required": "spain-based",
    "Holland on-site required": "holland-based",
  };

  // Extract requirement from otherRequirements field
  let requirement = "";
  for (const [key, value] of Object.entries(requirementMapping)) {
    if (otherRequirements.includes(key)) {
      requirement = value;
      break;
    }
  }

  // Format requester as email if it's not already
  const formattedRequester = requester.includes("@")
    ? requester
    : `${requester.toLowerCase().replace(/\s+/g, ".")}@vercel.com`;

  // Prepare the parsed message data
  const parsedData = {
    requester: formattedRequester,
    accountName,
    sfOpportunityLink,
    sfOpportunityId,
    description,
    nextCall,
    flexibility,
    otherRequirements: requirement,
  };

  try {
    // Make API call to get the next person
    const response = await fetch("https://rr-emea.vercel.app/api/next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-protection-bypass": "09aa9f62477942d6a5321f24196925cf",
      },
      body: JSON.stringify({
        requirement,
        ae: formattedRequester,
        company: accountName,
      }),
    });

    const apiResponse = await response.json();

    // Return combined data
    return {
      parsed: parsedData,
      api: apiResponse,
    };
  } catch (error) {
    // Return parsed data with error information if API call fails
    return {
      parsed: parsedData,
      api: {
        error: "Failed to make API call",
        details: error.message,
      },
    };
  }
}

// Test the function with the example message
const testMessage = `Requester: lasse.pedersen@vercel.com

*Account Name*
Robert Bosch GmbH

*SF Opportunity link*
https://vercel.lightning.force.com/lightning/r/Opportunity/006PZ00000Fqk7mYAB

*Description*
Robert Bosch is a engineering and technology company that focuses on automotive components and industrial products.

We had a first exchange with a swedish Senior Software Engineer who is part of a software evaluation committee for the whole group (based in Germany) and has shown first interest in v0. However, higher management approval is needed for company-wide adoption and we will face strict data protection policies. The contact also requested more technical details on how v0 compares to existing AI code assistants.

Next Steps are a technical deep dive in the next week (if possible), to understand their requirements, give more context around v0 and demo the technology. We should be prepared to address the data security concerns (most likely GDPR). This is part of a long-term engagement with Bosch and the goal is to trigger interest and discussion with the HQ in Germany.

*Next call*
 

*Flexibility*


*Other requirements:*


(used in # – https://vercel.slack.com/archives/C02SRK8P45C/p1738867457599059 - https://vercel.slack.com/archives/C02SRK8P45C/p1738867457599059)`;

// Run the test
(async () => {
  try {
    const result = await parseAutomationMessage(testMessage);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
})();

module.exports = parseAutomationMessage;
