const scrapNust = require("./scrapers/nustScraper");
const scrapNums = require("./scrapers/numsScraper");
const scrapPieas = require("./scrapers/pieasScraper");
const scrapGiki = require("./scrapers/gikiScraper");
const scrapFast = require("./scrapers/fastScraper");
const { sendMetaCloudTemplateMessage } = require("./services/metaCloudService");

// Function to run all scrapers
async function runScrapers() {
  console.log(
    "Starting scrapers with WHATSAPP_RECIPIENT_NUMBER:",
    process.env.WHATSAPP_RECIPIENT_NUMBER
  );
  try {
    try {
      console.log("Running NUST scraper...");
      await scrapNust();
      console.log("NUST scraper completed successfully");
    } catch (nustError) {
      console.error("NUST scraper error:", nustError.message);
      // Continue with other scrapers even if NUST fails
    }

    
    // try {
    //   console.log("Running NUMS scraper...");
    //   await scrapNums();
    //   console.log("NUMS scraper completed successfully");
    // } catch (numsError) {
    //   console.error("NUMS scraper error:", numsError.message);
    // }

    try {
      console.log("Running PIEAS scraper...");
      await scrapPieas();
      console.log("PIEAS scraper completed successfully");
    } catch (pieasError) {
      console.error("PIEAS scraper error:", pieasError.message);
    }

    try {
      console.log("Running GIKI scraper...");
      await scrapGiki();
      console.log("GIKI scraper completed successfully");
    } catch (gikiError) {
      console.error("GIKI scraper error:", gikiError.message);
    }

    try {
      console.log("Running FAST scraper...");
      await scrapFast();
      console.log("FAST scraper completed successfully");
    } catch (fastError) {
      console.error("FAST scraper error:", fastError.message);
    }

    console.log("All scrapers completed!");
    return { success: true };
  } catch (error) {
    console.error("Scraper error:", error.message);
    console.error("Error stack:", error.stack);
    // Don't throw the error, just return failure status
    return { success: false, error: error.message };
  }
}
runScrapers();
// // Function to send consent request message
// async function sendConsentRequest(phoneNumber) {
//   console.log(`Sending consent request to: ${phoneNumber}`);
//   console.log("Environment variables before sending:");
//   console.log(
//     "- WHATSAPP_PHONE_NUMBER_ID:",
//     process.env.WHATSAPP_PHONE_NUMBER_ID
//   );
//   console.log(
//     "- WHATSAPP_TOKEN:",
//     process.env.WHATSAPP_TOKEN ? "✓ Set" : "❌ Not set"
//   );

//   try {
//     // Temporarily store the recipient number
//     const originalRecipient = process.env.WHATSAPP_RECIPIENT_NUMBER;

//     // Set recipient to the target phone number
//     process.env.WHATSAPP_RECIPIENT_NUMBER = phoneNumber;
//     console.log("- Set WHATSAPP_RECIPIENT_NUMBER to:", phoneNumber);

//     // Send template message with Yes button
//     // Template must be pre-approved in Meta Business Manager
//     const result = await sendMetaCloudTemplateMessage("consent_message", []);
//     console.log("Consent request sent successfully");
//     console.log("API response:", JSON.stringify(result, null, 2));

//     // Restore original recipient if there was one
//     if (originalRecipient) {
//       process.env.WHATSAPP_RECIPIENT_NUMBER = originalRecipient;
//       console.log("Restored original recipient number");
//     }

//     return { success: true, result };
//   } catch (error) {
//     console.error("Failed to send consent request:", error);
//     console.error("Error details:", error.response?.data || error.message);
//     return {
//       success: false,
//       error: error.message,
//       details: error.response?.data,
//     };
//   }
// }

// // Run from command line if not being imported
// if (require.main === module) {
//   const command = process.argv[2];
//   const param = process.argv[3];

//   if (command === "run-scrapers") {
//     runScrapers()
//       .then(() => console.log("All scrapers completed successfully"))
//       .catch((err) => console.error("Error running scrapers:", err));
//   } else if (command === "send-consent" && param) {
//     sendConsentRequest(param)
//       .then((result) =>
//         console.log(
//           `Consent request result: ${result.success ? "Success" : "Failed"}`
//         )
//       )
//       .catch((err) => console.error("Error sending consent request:", err));
//   } else {
//     // Default behavior: send consent message using recipient from env
//     const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;
//     if (recipientNumber) {
//       console.log(
//         `Sending consent message to ${recipientNumber} from environment variable`
//       );
//       sendConsentRequest(recipientNumber)
//         .then((result) =>
//           console.log(
//             `Consent request result: ${result.success ? "Success" : "Failed"}`
//           )
//         )
//         .catch((err) => console.error("Error sending consent request:", err));
//     } else {
//       console.log("Available commands:");
//       console.log("  node index.js run-scrapers");
//       console.log("  node index.js send-consent PHONE_NUMBER");
//       console.log("  node index.js (uses WHATSAPP_RECIPIENT_NUMBER from .env)");
//     }
//   }
// }

// Export for use in API routes
module.exports = { runScrapers, 
  // sendConsentRequest 
};
