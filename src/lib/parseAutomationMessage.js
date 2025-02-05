// Function to parse Slack automation messages into structured data
async function parseAutomationMessage(message) {
  // Remove the usage line in parentheses at the end
  message = message.replace(/\(used in #.*\)$/s, "").trim();

  // Extract requester from first line
  const requesterMatch = message.match(/^Requester: (.+)/);
  const requester = requesterMatch ? requesterMatch[1].trim() : "";

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
  const sfOpportunityId = sfOpportunityLink.match(/Opportunity\/(.*?)\//)
    ? sfOpportunityLink.match(/Opportunity\/(.*?)\//)[1]
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
const testMessage = `Requester: zachary.chukwumah@vercel.com

*Account Name*
Ninja Vista

*SF Opportunity link*
https://vercel.lightning.force.com/lightning/r/Opportunity/006PZ00000FjU1KYAV/view

*Description*
Working with an agency who manage the sites for a number of large customers in SA. They are scaling one of their customers and need to go through a security and compliance evaluation for their security team. This is high priority given they've experienced outages in the past. Next call is to review their security requirements in full, assisting them with the right documentation and then a recommendation for Vercel Enterprise.

*Next call*
2025-02-07 1.30pm (UK)

*Flexibility*


*Other requirements*


(used in # – https://vercel.slack.com/archives/C02SRK8P45C/p1738692473129339 - https://vercel.slack.com/archives/C02SRK8P45C/p1738692473129339)`;

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
