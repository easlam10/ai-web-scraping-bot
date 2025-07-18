const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function fetchPageContent(url) {
  // Check if running on Heroku (process.env.DYNO exists)
  const isHeroku = !!process.env.DYNO;
  
  const launchOptions = {
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    defaultViewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  };
  
  // Set executablePath for Heroku
  if (isHeroku && process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    console.log(`Using Chrome executable path: ${launchOptions.executablePath}`);
  }
  
  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  const html = await page.content();
  await browser.close();
  return html;
}

module.exports = { fetchPageContent };
