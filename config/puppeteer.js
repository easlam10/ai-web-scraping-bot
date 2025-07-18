/**
 * Puppeteer configuration for Heroku deployment
 */
const chromium = require('@sparticuz/chromium-min');

// Configure Puppeteer for Heroku environment
const configurePuppeteer = () => {
  // Check if running on Heroku
  const isHeroku = !!process.env.DYNO;
  
  if (isHeroku) {
    console.log('Running on Heroku, configuring Puppeteer...');
    
    // Set environment variables for Chromium
    process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
    process.env.PUPPETEER_EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH || '/app/.apt/usr/bin/google-chrome';
    
    console.log(`Chromium executable path set to: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  }
};

module.exports = { configurePuppeteer };