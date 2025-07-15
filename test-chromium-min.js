const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");

async function testChromiumMin() {
  console.log("Testing @sparticuz/chromium-min setup...");

  try {
    console.log("Chromium args:", chromium.args);
    console.log("Chromium defaultViewport:", chromium.defaultViewport);
    console.log("Chromium headless:", chromium.headless);

    const executablePath = await chromium.executablePath();
    console.log("Chromium executablePath:", executablePath);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    console.log("✅ Browser launched successfully");

    const page = await browser.newPage();
    console.log("✅ Page created successfully");

    await page.goto("https://example.com", { waitUntil: "networkidle2" });
    console.log("✅ Page loaded successfully");

    const title = await page.title();
    console.log(`✅ Page title: ${title}`);

    await browser.close();
    console.log("✅ Browser closed successfully");

    console.log(
      "🎉 All tests passed! @sparticuz/chromium-min is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);
  }
}

testChromiumMin();
