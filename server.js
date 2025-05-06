
// const scrapNust = require("./scrapers/nustScraper");
// const scrapNums = require("./scrapers/numsScraper");
// const scrapPieas = require("./scrapers/pieasScraper");
// const scrapGiki = require("./scrapers/gikiScraper");
const scrapFast = require("./scrapers/fastScraper");



async function runScrapers() {
  try {
    console.log('Starting scrapers...');
    // await scrapNust();
    // await scrapNums();
    // await scrapPieas();
    // await scrapGiki();
    await scrapFast();
    console.log('All scrapers completed successfully');
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('Scraper failed:', error);
    process.exit(1); // Exit with error
  }
}

// Run immediately when invoked directly
if (require.main === module) {
  runScrapers();
}

// Export for potential HTTP endpoint
module.exports = runScrapers;


