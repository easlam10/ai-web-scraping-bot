/**
 * Puppeteer configuration for Heroku deployment
 */

// Configure Puppeteer for Heroku environment
const configurePuppeteer = () => {
  // Check if running on Heroku
  const isHeroku = !!process.env.DYNO;
  
  if (isHeroku) {
    console.log('Running on Heroku, configuring Puppeteer...');
    
    // Set environment variables for Puppeteer on Heroku
    process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
    // The puppeteer-heroku-buildpack installs Chrome in /app/.apt/usr/bin/google-chrome
    process.env.PUPPETEER_EXECUTABLE_PATH = '/app/.apt/usr/bin/google-chrome';
    
    console.log(`Chrome executable path set to: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  }
};

module.exports = { configurePuppeteer };