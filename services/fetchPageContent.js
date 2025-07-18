const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromium = require("@sparticuz/chromium-min");

puppeteer.use(StealthPlugin());

async function fetchPageContent(url) {
  // Check if running on Heroku (process.env.DYNO exists)
  const isHeroku = !!process.env.DYNO;
  
  const launchOptions = {
    headless: "new",
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    ignoreHTTPSErrors: true,
  };
  
  // Only set executablePath for Heroku and handle potential errors
  if (isHeroku) {
    try {
      launchOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath();
    } catch (error) {
      console.warn("Warning: Could not get Chromium path, falling back to system Chrome", error.message);
      // Let Puppeteer find the Chrome installation on Heroku
    }
  }
  
  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  const html = await page.content();
  await browser.close();
  return html;
}

module.exports = { fetchPageContent };
