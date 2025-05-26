import puppeteer from 'puppeteer';

const EMAIL = process.env.OUTLOOK_EMAIL || 'easlam10@outlook.com';
const PASSWORD = process.env.OUTLOOK_PASSWORD || 'Ehtishamaslam10';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Step 1: Go to Outlook homepage
  await page.goto('https://outlook.live.com/', { waitUntil: 'networkidle2' });

  // Step 2: Click "Sign in" link (opens in new tab)
  const [popup] = await Promise.all([
    new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
    page.click('a[href*="LinkID=2125442"]'),
  ]);

  const loginPage = await popup;
  await loginPage.bringToFront();

  // Step 3: Enter email
  await loginPage.waitForSelector('input[name="loginfmt"]');
  await loginPage.type('input[name="loginfmt"]', EMAIL);
  await loginPage.click('input[type="submit"]');
  await loginPage.waitForNavigation({ waitUntil: 'networkidle2' });

  // Step 4: Enter password
  await loginPage.waitForSelector('input[name="passwd"]');
  await loginPage.type('input[name="passwd"]', PASSWORD);
  await loginPage.click('input[type="submit"]');
  await loginPage.waitForNavigation({ waitUntil: 'networkidle2' });

  // Step 5: Handle "Stay signed in?" prompt
  const staySignedIn = await loginPage.$('input[id="idSIButton9"]');
  if (staySignedIn) {
    await staySignedIn.click();
    await loginPage.waitForNavigation({ waitUntil: 'networkidle2' });
  }

  // Final step: go to inbox (if not auto-redirected)
  await loginPage.goto('https://outlook.live.com/mail/', { waitUntil: 'networkidle2' });

  console.log('✅ Successfully logged in and navigated to inbox');
  await loginPage.screenshot({ path: 'inbox.png' });

  await browser.close();
})();
