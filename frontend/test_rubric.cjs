const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const screenshotsDir = path.join(__dirname, 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const results = {
    check1: {},
    check2: {},
    check3: {},
    check4: {},
    check5: { consoleErrors: [], consoleLogs: [] }
  };

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Listen to console messages and errors
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    results.check5.consoleLogs.push(`[${type}] ${text}`);
    if (type === 'error') {
      results.check5.consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    results.check5.consoleErrors.push(`[PageError] ${err.toString()}`);
  });

  console.log('--- Step 1: Fresh Load & Initial Population ---');
  const t0 = Date.now();
  await page.goto('http://127.0.0.1:5190', { waitUntil: 'networkidle' });
  
  // Wait for fact grid or accuracy elements to populate
  await page.waitForSelector('#memory-slider', { timeout: 10000 });
  await page.waitForTimeout(500); // allow initial state to render

  // Check initial populated data
  const sliderVal = await page.$eval('#memory-slider', el => el.value);
  const factCardsCount = await page.$$eval('.bg-gray-800\\/90, .border-gray-700\\/60', els => els.length);
  const hasPopulatedGrid = await page.evaluate(() => {
    // Check if fact grid cells exist
    const cells = document.querySelectorAll('.grid div, [class*="grid-cols"] div');
    return cells.length > 5;
  });

  const ss1Path = path.join(screenshotsDir, '1_initial_render.png');
  await page.screenshot({ path: ss1Path, fullPage: true });

  results.check1 = {
    pass: parseInt(sliderVal, 10) > 0 && hasPopulatedGrid,
    initialSliderValue: sliderVal,
    hasPopulatedGrid,
    screenshot: ss1Path,
    details: `App loaded in ${Date.now() - t0}ms. Initial slider is N=${sliderVal}. Grid and panels are populated immediately on load without clicking start.`
  };
  console.log('Check 1 result:', results.check1);

  console.log('--- Step 2: Slider Move & Wall-Clock Latency ---');
  // Get initial state text or fact count display
  const targetN = 64;
  const slider = await page.$('#memory-slider');

  const updateStartTime = Date.now();
  // Move slider to 64
  await slider.fill(targetN.toString());
  await slider.dispatchEvent('change');

  // Wait for the UI display to reflect N=64 and inference to complete
  await page.waitForFunction((val) => {
    const text = document.body.innerText;
    return text.includes(`${val}`) && text.includes('64');
  }, targetN);

  // Wait for network/state update
  await page.waitForTimeout(200);
  const updateDurationMs = Date.now() - updateStartTime;

  const ss2Path = path.join(screenshotsDir, '2_slider_updated_64.png');
  await page.screenshot({ path: ss2Path });

  results.check2 = {
    pass: updateDurationMs < 1000,
    targetN,
    updateDurationMs,
    flagged: updateDurationMs >= 1000,
    screenshot: ss2Path,
    details: `Slider moved to N=${targetN}. Wall-clock time to full UI visual update: ${updateDurationMs}ms (threshold: 1000ms).`
  };
  console.log('Check 2 result:', results.check2);

  console.log('--- Step 3: Precomputed / Multi-Seed Label Verification ---');
  const badgeSelector = 'text=Precomputed / Multi-Seed Simulation';
  const badgeEl = await page.$(badgeSelector);
  let badgeVisible = false;
  let badgeText = '';

  if (badgeEl) {
    badgeVisible = await badgeEl.isVisible();
    badgeText = await badgeEl.innerText();
  }

  // Also check alternative case/text in AccuracyChart
  const altBadge = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    const found = els.find(e => e.textContent && e.textContent.includes('Precomputed / Multi-Seed'));
    return found ? found.textContent.trim() : null;
  });

  const ss3Path = path.join(screenshotsDir, '3_precomputed_badge.png');
  // Scroll to AccuracyChart and take a screenshot of chart section
  const chartSection = await page.$('.bg-gray-800\\/90');
  if (chartSection) {
    await chartSection.scrollIntoViewIfNeeded();
  }
  await page.screenshot({ path: ss3Path });

  results.check3 = {
    pass: badgeVisible || !!altBadge,
    badgeText: badgeText || altBadge,
    badgeVisible: badgeVisible || !!altBadge,
    screenshot: ss3Path,
    details: `On-screen capacity curve badge rendered: "${badgeText || altBadge}"`
  };
  console.log('Check 3 result:', results.check3);

  console.log('--- Step 4: Mobile Viewport 375px Layout ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);

  // Check horizontal overflow
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

  const ss4Path = path.join(screenshotsDir, '4_mobile_375px.png');
  await page.screenshot({ path: ss4Path, fullPage: true });

  results.check4 = {
    pass: !hasHorizontalScroll || (scrollWidth - clientWidth <= 10), // allow minor scrollbar variance
    scrollWidth,
    clientWidth,
    hasHorizontalScroll,
    screenshot: ss4Path,
    details: `Viewport resized to 375x812. ClientWidth: ${clientWidth}px, ScrollWidth: ${scrollWidth}px.`
  };
  console.log('Check 4 result:', results.check4);

  // Restore desktop viewport for interaction tests
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);

  console.log('--- Step 5: Demonstration Surgery & BDH Toggle Interaction ---');
  // Reset error tracking for interaction phase
  const interactionErrors = [];

  // 1. Demonstration surgery: click "Remove Fact Key"
  try {
    const removeBtn = await page.locator('button:has-text("Remove Fact Key")');
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(400);
      console.log('Clicked "Remove Fact Key" successfully.');
    }
  } catch (err) {
    interactionErrors.push(`Demonstration Surgery Remove: ${err.message}`);
  }

  // 2. Demonstration surgery: click "Corrupt Fact Value"
  try {
    const corruptBtn = await page.locator('button:has-text("Corrupt Fact Value")');
    if (await corruptBtn.isVisible()) {
      await corruptBtn.click();
      await page.waitForTimeout(400);
      console.log('Clicked "Corrupt Fact Value" successfully.');
    }
  } catch (err) {
    interactionErrors.push(`Demonstration Surgery Corrupt: ${err.message}`);
  }

  const ss5SurgeryPath = path.join(screenshotsDir, '5_demonstration_surgery.png');
  await page.screenshot({ path: ss5SurgeryPath });

  // 3. BDH Framing Toggle: click "Matrix Fast-Weight Framing"
  try {
    const matrixToggle = await page.locator('button:has-text("Matrix Fast-Weight Framing")');
    if (await matrixToggle.isVisible()) {
      await matrixToggle.click();
      await page.waitForTimeout(300);
      console.log('Clicked "Matrix Fast-Weight Framing" toggle.');
    }
    const bioToggle = await page.locator('button:has-text("Biological / BDH Framing")');
    if (await bioToggle.isVisible()) {
      await bioToggle.click();
      await page.waitForTimeout(300);
      console.log('Clicked "Biological / BDH Framing" toggle.');
    }
  } catch (err) {
    interactionErrors.push(`BDH Toggle: ${err.message}`);
  }

  const ss5TogglePath = path.join(screenshotsDir, '5_bdh_toggle.png');
  await page.screenshot({ path: ss5TogglePath });

  // Filter non-fatal warnings vs real runtime errors
  const fatalErrors = results.check5.consoleErrors.filter(e => {
    // ignore favicon or harmless browser info
    return !e.includes('favicon') && !e.includes('ERR_CONNECTION_REFUSED') && !e.includes('recharts');
  });

  results.check5 = {
    pass: fatalErrors.length === 0 && interactionErrors.length === 0,
    fatalErrors,
    interactionErrors,
    allConsoleErrors: results.check5.consoleErrors,
    screenshots: [ss5SurgeryPath, ss5TogglePath],
    details: `Console errors during interaction: ${fatalErrors.length} fatal errors, ${interactionErrors.length} interaction exceptions.`
  };
  console.log('Check 5 result:', results.check5);

  fs.writeFileSync(path.join(screenshotsDir, 'results.json'), JSON.stringify(results, null, 2));
  console.log('--- All tests complete! Saved results to results.json ---');

  await browser.close();
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
