#!/usr/bin/env node
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  locale: 'de-DE',
});
const page = await ctx.newPage();

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function go(page, navId) {
  await page.locator(`[data-testid="${navId}"]`).first().click();
  await sleep(350);
}

async function onScreens(page, id, screens = ['nav-today', 'nav-settings', 'nav-week']) {
  for (const s of screens) {
    try {
      await go(page, s);
    } catch {
      continue;
    }
    if ((await page.locator(`[data-testid="${id}"]`).count()) > 0) return s;
  }
  return null;
}

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await sleep(2000);
  
  console.log('=== Testing Habit Add Flow ===');
  
  const where = await onScreens(page, 'habit-add');
  console.log('Habit-add found on:', where);
  
  const habitAddCountBefore = await page.locator('[data-testid="habit-add"]').count();
  console.log('habit-add count before click:', habitAddCountBefore);
  
  await page.locator('[data-testid="habit-add"]').first().click();
  await sleep(500);
  
  // Check current page
  const currentPath = await page.evaluate(() => window.location.pathname);
  console.log('Current path after click:', currentPath);
  
  const habitAddCountAfter = await page.locator('[data-testid="habit-add"]').count();
  console.log('habit-add count after click:', habitAddCountAfter);
  
  const habitNameCount = await page.locator('[data-testid="habit-name"]').count();
  console.log('habit-name count:', habitNameCount);
  
  const habitSaveCount = await page.locator('[data-testid="habit-save"]').count();
  console.log('habit-save count:', habitSaveCount);
  
  // Check if modal exists
  const modalExists = await page.evaluate(() => {
    return document.querySelector('input[data-testid="habit-name"]') !== null;
  });
  console.log('Modal input exists in DOM:', modalExists);
  
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
} finally {
  await browser.close();
}
