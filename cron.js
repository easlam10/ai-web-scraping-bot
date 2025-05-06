const runScrapers = require('./server');

// This will be called by Render's cron job
module.exports = async () => {
  return await runScrapers();
};