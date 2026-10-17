import { chromium } from 'playwright';

async function captureLandingPage() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Screenshot hero
  await page.screenshot({ path: 'public/test_results/section_hero.png' });

  // Click HOW IT WORKS in nav
  const howItWorksBtn = page.locator('#nav-links button:has-text("HOW IT WORKS")');
  if (await howItWorksBtn.count() > 0) {
    await howItWorksBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'public/test_results/section_network_clicked.png' });
  }

  // Click PRICING in nav
  const pricingBtn = page.locator('#nav-links button:has-text("PRICING")');
  if (await pricingBtn.count() > 0) {
    await pricingBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'public/test_results/section_pricing_clicked.png' });
  }

  // Scroll to footer
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'public/test_results/section_footer_clicked.png' });

  // Full page screenshot
  await page.screenshot({ path: 'public/test_results/full_page.png', fullPage: true });

  console.log('Screenshots captured successfully.');
  await browser.close();
}

captureLandingPage().catch(err => {
  console.error(err);
  process.exit(1);
});
