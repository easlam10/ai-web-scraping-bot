const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer"); // for executablePath

puppeteerExtra.use(StealthPlugin());

async function fetchPageContent(url) {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const localRevisions = await browserFetcher.localRevisions();
  const executablePath = (await browserFetcher.revisionInfo(localRevisions[0]))
    .executablePath;

  const browser = await puppeteerExtra.launch({
    headless: "new",
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true, // required for cloud deployment
  });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2", timeout: 300000 });

  const html = await page.content();
  await browser.close();
  return html;
}

module.exports = { fetchPageContent };
