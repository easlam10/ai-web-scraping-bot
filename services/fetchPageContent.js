const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromium = require("@sparticuz/chromium-min");

puppeteer.use(StealthPlugin());

async function fetchPageContent(url) {
  // Check if running on Heroku (process.env.DYNO exists)
  const isHeroku = !!process.env.DYNO;
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: isHeroku ? await chromium.executablePath() : undefined,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  const html = await page.content();
  await browser.close();
  return html;
}

module.exports = { fetchPageContent };
