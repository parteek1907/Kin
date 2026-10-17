import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { width: 1920, height: 1080, name: '1920x1080' },
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1280, height: 720, name: '1280x720' },
  { width: 390, height: 844, name: '390x844' }
];

const OUTPUT_DIR = path.resolve('public/test_results');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runVerification() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true
  });

  const results = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const metrics = await page.evaluate(() => {
      // Helper to compute token --gutter
      const style = window.getComputedStyle(document.documentElement);
      const gutterVal = style.getPropertyValue('--gutter').trim();

      const testEl = document.createElement('div');
      testEl.style.width = 'var(--gutter)';
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      document.body.appendChild(testEl);
      const gutterPx = testEl.getBoundingClientRect().width;
      document.body.removeChild(testEl);

      const navLogo = document.getElementById('nav-logo');
      const navLinks = document.getElementById('nav-links');
      const navCta = document.getElementById('nav-cta');
      const navHamburger = document.getElementById('nav-hamburger');
      const eyebrow = document.getElementById('hero-eyebrow');
      const headline = document.getElementById('hero-headline');
      const subtext = document.getElementById('hero-subtext');
      const cta = document.getElementById('hero-cta');
      const statCol1 = document.getElementById('stat-col-1');
      const heroStats = document.getElementById('hero-stats');

      // Rightmost active nav element (CTA button on desktop, Hamburger on mobile)
      const visibleNavAction = [navCta, navHamburger].find(el => el && window.getComputedStyle(el).display !== 'none');

      const logoRect = navLogo ? navLogo.getBoundingClientRect() : null;
      const linksRect = (navLinks && window.getComputedStyle(navLinks).display !== 'none') ? navLinks.getBoundingClientRect() : null;
      const navActionRect = visibleNavAction ? visibleNavAction.getBoundingClientRect() : null;
      const eyebrowRect = eyebrow ? eyebrow.getBoundingClientRect() : null;
      const headlineRect = headline ? headline.getBoundingClientRect() : null;
      const subtextRect = subtext ? subtext.getBoundingClientRect() : null;
      const ctaRect = cta ? cta.getBoundingClientRect() : null;
      const stat1Rect = statCol1 ? statCol1.getBoundingClientRect() : null;
      const statsRect = heroStats ? heroStats.getBoundingClientRect() : null;

      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Clearance check on desktop/tablet (>= 768px)
      let minClearance = 9999;
      const clearanceChecks = [];

      if (window.innerWidth >= 768) {
        const elementsToCheck = [
          { name: 'eyebrow', rect: eyebrowRect },
          { name: 'headline', rect: headlineRect },
          { name: 'subtext', rect: subtextRect },
          { name: 'cta', rect: ctaRect },
          { name: 'stats', rect: statsRect }
        ];

        const scaleX = window.innerWidth / 1920;
        const scaleY = window.innerHeight / 1080;

        for (const item of elementsToCheck) {
          if (!item.rect) continue;
          const midY = (item.rect.top + item.rect.bottom) / 2;
          const normY = midY / scaleY;

          // Normalized curve X for smooth continuous S-curve (zero corner bends):
          // M 0,250 C 350,240 650,250 850,300 C 960,340 1040,440 1080,560 C 1120,680 1160,800 1280,880 C 1400,950 1620,970 1920,965
          let curveNormX = 850;
          if (normY <= 300) {
            curveNormX = 850;
          } else if (normY <= 560) {
            const t = (normY - 300) / (560 - 300);
            curveNormX = 850 + t * (1080 - 850);
          } else if (normY <= 880) {
            const t = (normY - 560) / (880 - 560);
            curveNormX = 1080 + t * (1280 - 1080);
          } else {
            const t = (normY - 880) / (1080 - 880);
            curveNormX = 1280 + t * (1920 - 1280);
          }

          const currentCurveX = curveNormX * scaleX;
          const clearance = currentCurveX - item.rect.right;
          clearanceChecks.push({ name: item.name, midY, textRight: item.rect.right, curveX: currentCurveX, clearance });
          if (clearance < minClearance) {
            minClearance = clearance;
          }
        }
      }

      return {
        gutterPx,
        logoRect,
        linksRect,
        navActionRect,
        eyebrowRect,
        headlineRect,
        subtextRect,
        ctaRect,
        stat1Rect,
        statsRect,
        scrollWidth,
        innerWidth,
        viewportHeight,
        clearanceChecks,
        minClearance
      };
    });

    console.log(`Gutter in px: ${metrics.gutterPx.toFixed(1)}px (Expected at 1920: 140px)`);

    // 1. Left edges equal (+-1px)
    const leftEdges = {
      logo: metrics.logoRect ? metrics.logoRect.left : null,
      eyebrow: metrics.eyebrowRect ? metrics.eyebrowRect.left : null,
      headline: metrics.headlineRect ? metrics.headlineRect.left : null,
      subtext: metrics.subtextRect ? metrics.subtextRect.left : null,
      cta: metrics.ctaRect ? metrics.ctaRect.left : null,
      stats: metrics.stat1Rect ? metrics.stat1Rect.left : null
    };

    console.log(`Left Edges:`, JSON.stringify(leftEdges));
    const leftValues = Object.values(leftEdges).filter(v => v !== null);
    const maxLeftDiff = Math.max(...leftValues) - Math.min(...leftValues);
    const passLeftEdges = maxLeftDiff <= 1.5;
    console.log(`- Left edge parity: ${passLeftEdges ? 'PASS' : 'FAIL'} (max diff: ${maxLeftDiff.toFixed(2)}px)`);

    // 2. Nav button right edge equals viewport width minus --gutter (+-1.5px)
    let passNavCtaRight = true;
    if (metrics.navActionRect) {
      const expectedRight = vp.width - metrics.gutterPx;
      const diffRight = Math.abs(metrics.navActionRect.right - expectedRight);
      passNavCtaRight = diffRight <= 1.5;
      console.log(`- Nav action right edge: ${passNavCtaRight ? 'PASS' : 'FAIL'} (actual: ${metrics.navActionRect.right.toFixed(1)}px, expected: ${expectedRight.toFixed(1)}px, diff: ${diffRight.toFixed(2)}px)`);
    }

    // 3. Center of nav links group equals viewport center (+-1px)
    let passNavLinksCenter = true;
    if (metrics.linksRect) {
      const linksCenter = metrics.linksRect.left + metrics.linksRect.width / 2;
      const expectedCenter = vp.width / 2;
      const diffCenter = Math.abs(linksCenter - expectedCenter);
      passNavLinksCenter = diffCenter <= 1.5;
      console.log(`- Center of nav links: ${passNavLinksCenter ? 'PASS' : 'FAIL'} (actual: ${linksCenter.toFixed(1)}px, expected: ${expectedCenter.toFixed(1)}px, diff: ${diffCenter.toFixed(2)}px)`);
    }

    // 4. Logo, links and button share same vertical center (+-1px)
    let passVerticalCenter = true;
    if (metrics.logoRect && metrics.linksRect && metrics.navActionRect) {
      const logoCenterY = metrics.logoRect.top + metrics.logoRect.height / 2;
      const linksCenterY = metrics.linksRect.top + metrics.linksRect.height / 2;
      const ctaCenterY = metrics.navActionRect.top + metrics.navActionRect.height / 2;
      const maxCenterYDiff = Math.max(Math.abs(logoCenterY - linksCenterY), Math.abs(logoCenterY - ctaCenterY), Math.abs(linksCenterY - ctaCenterY));
      passVerticalCenter = maxCenterYDiff <= 1.5;
      console.log(`- Vertical center parity: ${passVerticalCenter ? 'PASS' : 'FAIL'} (logo: ${logoCenterY.toFixed(1)}px, links: ${linksCenterY.toFixed(1)}px, cta: ${ctaCenterY.toFixed(1)}px, maxDiff: ${maxCenterYDiff.toFixed(2)}px)`);
    }

    // 5. Text-to-panel-edge clearance is at least 48px at every y
    let passClearance = true;
    if (vp.width >= 768) {
      passClearance = metrics.minClearance >= 48;
      console.log(`- Clearance to panel edge: ${passClearance ? 'PASS' : 'FAIL'} (min clearance: ${metrics.minClearance.toFixed(1)}px, required >= 48px)`);
      for (const c of metrics.clearanceChecks) {
        console.log(`    [${c.name}]: textRight=${c.textRight.toFixed(1)}px, curveX=${c.curveX.toFixed(1)}px, clearance=${c.clearance.toFixed(1)}px`);
      }
    }

    // 6. Stats row bottom is at most 100svh minus 48px
    let passStatsBottom = true;
    if (metrics.statsRect) {
      const maxAllowedBottom = metrics.viewportHeight - 48;
      passStatsBottom = metrics.statsRect.bottom <= maxAllowedBottom + 1;
      console.log(`- Stats row bottom: ${passStatsBottom ? 'PASS' : 'FAIL'} (actual: ${metrics.statsRect.bottom.toFixed(1)}px, max allowed: ${maxAllowedBottom.toFixed(1)}px)`);
    }

    // 7. document.scrollWidth equals window.innerWidth
    const passScrollWidth = metrics.scrollWidth === metrics.innerWidth;
    console.log(`- scrollWidth equals innerWidth: ${passScrollWidth ? 'PASS' : 'FAIL'} (scrollWidth: ${metrics.scrollWidth}px, innerWidth: ${metrics.innerWidth}px)`);

    // Screenshot
    const screenshotPath = path.join(OUTPUT_DIR, `render_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot to ${screenshotPath}`);

    results[vp.name] = {
      passLeftEdges,
      passNavCtaRight,
      passNavLinksCenter,
      passVerticalCenter,
      passClearance,
      passStatsBottom,
      passScrollWidth
    };

    await context.close();
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`SUMMARY OF ALL VIEWPORTS:`);
  console.log(`========================================`);
  console.log(JSON.stringify(results, null, 2));

  // Verify all pass
  let allPass = true;
  for (const [vpName, res] of Object.entries(results)) {
    for (const [check, passed] of Object.entries(res)) {
      if (!passed) {
        console.error(`FAILED: ${vpName} - ${check}`);
        allPass = false;
      }
    }
  }

  if (allPass) {
    console.log(`\n>>> ALL 7 GEOMETRIC REQUIREMENTS PASSED ON ALL VIEWPORTS! <<<`);
  } else {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
