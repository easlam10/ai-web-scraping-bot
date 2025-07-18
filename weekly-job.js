// weekly-job.js
const now = new Date();

if (now.getDay() === 1) { // Only run on Monday (0=Sunday, 1=Monday, etc.)
  console.log('Running weekly task...');
  
//   // Option 1: Directly require and run your weekly task
//   require('./index.js'); // This executes your index.js file
  
//   OR Option 2: If you need to run it as a separate process
  const { exec } = require('child_process');
  exec('node index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(`Output: ${stdout}`);
    if (stderr) console.error(`Stderr: ${stderr}`);
  });
} else {
  console.log(`Not scheduled to run today (Day ${now.getDay()})`);
  console.log(`Current UTC time: ${now.toUTCString()}`);
}