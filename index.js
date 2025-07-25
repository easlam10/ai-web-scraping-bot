const scrapNust = require("./scrapers/nustScraper");
const scrapNums = require("./scrapers/numsScraper");
const scrapPieas = require("./scrapers/pieasScraper");
const scrapGiki = require("./scrapers/gikiScraper");
const scrapFast = require("./scrapers/fastScraper");


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

    // try {
    //   console.log("Running PIEAS scraper...");
    //   await scrapPieas();
    //   console.log("PIEAS scraper completed successfully");
    // } catch (pieasError) {
    //   console.error("PIEAS scraper error:", pieasError.message);
    // }

//     try {
//       console.log("Running GIKI scraper...");
//       await scrapGiki();
//       console.log("GIKI scraper completed successfully");
//     } catch (gikiError) {
//       console.error("GIKI scraper error:", gikiError.message);
//     }

//     try {
//       console.log("Running FAST scraper...");
//       await scrapFast();
//       console.log("FAST scraper completed successfully");
//     } catch (fastError) {
//       console.error("FAST scraper error:", fastError.message);
//     }

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

// Export for use in API routes
module.exports = { runScrapers };
