// const cron = require("node-cron");
const scrapNust = require("./scrapers/nustScraper");
const scrapNums = require("./scrapers/numsScraper");
const scrapPieas = require("./scrapers/pieasScraper");
const scrapGiki = require("./scrapers/gikiScraper");
const scrapFast = require("./scrapers/fastScraper");

async function main() {
  await scrapNust();
  await scrapNums();
  await scrapPieas();
  await scrapGiki();
  await scrapFast();
}

main();
// cron.schedule("30 6 * * 1", async () => {
//   console.log("⏳ Running scheduled job at", new Date().toLocaleTimeString());
//   await main();
// });
