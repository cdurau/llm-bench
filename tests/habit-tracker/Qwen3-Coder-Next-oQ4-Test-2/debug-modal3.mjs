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
  
  console.log('=== Testing full flow ===');
  
  const where = await onScreens(page, 'habit-add');
  console.log('Habit-add found on:', where);
  
  // Check what's visible before clicking
  const beforeHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('Before click - has habit-name:', beforeHTML.includes('data-testid="habit-name"'));
  
  await page.locator('[data-testid="habit-add"]').first().click();
  console.log('Clicked habit-add');
  
  // Wait and check again
  await sleep(500);
  const after100 = await page.evaluate(() => document.body.innerHTML);
  console.log('After 100ms - has habit-name:', after100.includes('data-testid="habit-name"'));
  
  await sleep(500);
  const after500 = await page.evaluate(() => document.body.innerHTML);
  console.log('After 500ms - has habit-name:', after500.includes('data-testid="habit-name"'));
  
  await sleep(500);
  const after1000 = await page.evaluate(() => document.body.innerHTML);
  console.log('After 1000ms - has habit-name:', after1000.includes('data-testid="habit-name"'));
  
  // Check if modal is visible
  const modal = await page.locator('[data-testid="habit-name"]');
  const is_visible = await modal.first().isVisible();
  console.log('Modal is visible:', is_visible);
  
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
} finally {
  await browser.close();
}
