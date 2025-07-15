// Configuration for Puppeteer in serverless environments
const chromium = require("@sparticuz/chromium-min");

// This file provides a single place to configure Puppeteer options
const puppeteerConfig = {
  // Launch options optimized for serverless
  launch: {
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || null, // Will use chromium.executablePath() when null
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  },

  // Page options
  page: {
    timeout: 15000,
    waitUntil: "networkidle2",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
};

module.exports = puppeteerConfig;
