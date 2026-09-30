const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/program/ui-ux', { waitUntil: 'networkidle2' });
  
  // 360px
  await page.setViewport({ width: 360, height: 800 });
  await page.screenshot({ path: 'C:/Users/USER/.gemini/antigravity-ide/brain/96c515d8-7284-4bd9-95fc-f2434c515c36/.user_uploaded/scr_360.png', fullPage: true });

  // 768px
  await page.setViewport({ width: 768, height: 1024 });
  await page.screenshot({ path: 'C:/Users/USER/.gemini/antigravity-ide/brain/96c515d8-7284-4bd9-95fc-f2434c515c36/.user_uploaded/scr_768.png', fullPage: true });

  // 1280px
  await page.setViewport({ width: 1280, height: 1024 });
  await page.screenshot({ path: 'C:/Users/USER/.gemini/antigravity-ide/brain/96c515d8-7284-4bd9-95fc-f2434c515c36/.user_uploaded/scr_1280.png', fullPage: true });

  await browser.close();
})();
