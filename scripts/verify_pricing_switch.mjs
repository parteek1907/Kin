import { chromium } from 'playwright';

async function testPricingToggle() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Verify Lenis is active on window
  const hasLenis = await page.evaluate(() => typeof window.__lenis !== 'undefined');
  console.log('Lenis smooth scroll instance active:', hasLenis);
  if (!hasLenis) {
    throw new Error('Lenis instance window.__lenis not found!');
  }

  // Scroll to pricing using Lenis
  await page.evaluate(() => {
    const el = document.getElementById('pricing');
    if (window.__lenis && el) {
      window.__lenis.scrollTo(el, { immediate: true });
    } else if (el) {
      el.scrollIntoView();
    }
  });
  await page.waitForTimeout(800);

  // Check Annual State text & prices
  const annualContent = await page.locator('#pricing').textContent();
  console.log('--- Checking Annual State ---');
  if (annualContent.includes('$')) {
    throw new Error('Dollar sign $ found in pricing section!');
  }
  if (!annualContent.includes('FREE FOREVER') || !annualContent.includes('₹0')) {
    throw new Error('Student plan annual price incorrect!');
  }
  if (!annualContent.includes('799') || !annualContent.includes('₹9,588')) {
    throw new Error('Founder plan annual pricing (799 / ₹9,588) not found!');
  }
  if (!annualContent.includes('3,999') || !annualContent.includes('₹47,988')) {
    throw new Error('University plan annual pricing (3,999 / ₹47,988) not found!');
  }
  if (annualContent.includes('CAMPUS VERIFIED') || annualContent.includes('HIGH CONVICTION') || annualContent.includes('ENTERPRISE DEPLOYMENT')) {
    throw new Error('Pricing card badges (CAMPUS VERIFIED / HIGH CONVICTION / ENTERPRISE DEPLOYMENT) still present in pricing section!');
  }
  console.log('Confirmed: Pricing badges (CAMPUS VERIFIED / HIGH CONVICTION / ENTERPRISE DEPLOYMENT) successfully removed.');

  // Check Footer content
  const footerContent = await page.locator('footer').textContent();
  if (footerContent.includes('154 NODES ONLINE') || footerContent.includes('412 TRUST EDGES') || footerContent.includes('CAMPUS PROOF GRAPH')) {
    throw new Error('Footer still contains 154 NODES ONLINE • 412 TRUST EDGES or CAMPUS PROOF GRAPH!');
  }
  console.log('Confirmed: 154 NODES ONLINE • 412 TRUST EDGES and CAMPUS PROOF GRAPH successfully removed from footer.');

  const save20Badges = await page.locator('#pricing span:has-text("Save 20%")').count();
  console.log(`Found ${save20Badges} "Save 20%" badges in Annual state.`);
  if (save20Badges < 2) {
    throw new Error('Expected at least 2 Save 20% badges in Annual mode');
  }

  // Take screenshot in Annual state (default)
  await page.screenshot({ path: 'public/test_results/pricing_annual.png' });
  console.log('Captured Annual state screenshot.');

  // Click Monthly button
  const monthlyBtn = page.locator('#pricing button:has-text("Monthly")');
  await monthlyBtn.click();
  await page.waitForTimeout(600);

  // Check Monthly State text & prices
  const monthlyContent = await page.locator('#pricing').textContent();
  console.log('--- Checking Monthly State ---');
  if (monthlyContent.includes('$')) {
    throw new Error('Dollar sign $ found in monthly pricing section!');
  }
  if (!monthlyContent.includes('FREE FOREVER') || !monthlyContent.includes('₹0')) {
    throw new Error('Student plan monthly price incorrect!');
  }
  if (!monthlyContent.includes('999')) {
    throw new Error('Founder plan monthly price 999 not found!');
  }
  if (!monthlyContent.includes('4,999')) {
    throw new Error('University plan monthly price 4,999 not found!');
  }

  // Take screenshot in Monthly state
  await page.screenshot({ path: 'public/test_results/pricing_monthly.png' });
  console.log('Captured Monthly state screenshot.');

  // Click Annual button again
  const annualBtn = page.locator('button:has-text("Annual")');
  await annualBtn.click();
  await page.waitForTimeout(600);

  // Take screenshot in Annual state after toggle back
  await page.screenshot({ path: 'public/test_results/pricing_annual_after.png' });
  console.log('Captured Annual state after toggle.');

  await browser.close();
  console.log('>>> All pricing toggle checks and Lenis assertions completed successfully! <<<');
}

testPricingToggle().catch(err => {
  console.error(err);
  process.exit(1);
});
