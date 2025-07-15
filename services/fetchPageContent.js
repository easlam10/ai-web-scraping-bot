const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

async function fetchPageContent(url) {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    args: [
      ...chromium.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

module.exports = { fetchPageContent };
