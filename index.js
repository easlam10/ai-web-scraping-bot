
const scrapNust = require("./scrapers/nustScraper");
const scrapNums = require("./scrapers/numsScraper");
const scrapPieas = require("./scrapers/pieasScraper");
const scrapGiki = require("./scrapers/gikiScraper");
const scrapFast = require("./scrapers/fastScraper");







async function runScrapers() {
  
    console.log('Starting scrapers...');
    await scrapNust();
    await scrapNums();
    await scrapPieas();
    await scrapGiki();
    await scrapFast();
}
  runScrapers();


// Export for potential HTTP endpoint
module.exports = runScrapers;


