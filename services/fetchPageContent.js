const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function fetchPageContent(url) {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const localRevisions = await browserFetcher.localRevisions();
  const executablePath = (await browserFetcher.revisionInfo(localRevisions[0]))
    .executablePath;

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  // ⏱ Increase timeout to 5 minutes (300,000 ms)
  await page.goto(url, { waitUntil: "networkidle2", timeout: 300000 });

  const html = await page.content();
  await browser.close();
  return html;
}

module.exports = { fetchPageContent };
