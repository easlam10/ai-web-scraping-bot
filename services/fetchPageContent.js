const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromium = require("@sparticuz/chromium-min");

// Apply stealth plugin
puppeteer.use(StealthPlugin());

async function fetchPageContent(url) {
  const browser = await puppeteer.launch({
    headless: chromium.headless,
    executablePath: await chromium.executablePath(),
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process"
    ],
    ignoreHTTPSErrors: true,
    timeout: 60000
  });

  try {
    const page = await browser.newPage();
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    
    // Configure stealth behaviors
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    });

    await page.goto(url, { 
      waitUntil: "networkidle2",
      timeout: 60000 
    });
    
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

module.exports = { fetchPageContent };