
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
    console.log("✅ GitHub Action script ran successfully at", new Date().toISOString());
    console.log('All scrapers completed successfully');
  } catch (error) {
    console.error('Scraper failed:', error);
    
  }
}
  runScrapers();

// Export for potential HTTP endpoint
module.exports = runScrapers;


