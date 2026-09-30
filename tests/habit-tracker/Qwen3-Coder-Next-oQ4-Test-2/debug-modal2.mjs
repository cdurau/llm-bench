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
  
  console.log('=== Navigating to Settings ===');
  await go(page, 'nav-settings');
  await sleep(1000);
  
  const habitAddCount = await page.locator('[data-testid="habit-add"]').count();
  console.log('habit-add count on settings:', habitAddCount);
  
  console.log('=== Clicking habit-add ===');
  await page.locator('[data-testid="habit-add"]').first().click();
  await sleep(1000);
  
  const modalExists = await page.evaluate(() => {
    return document.querySelector('input[data-testid="habit-name"]') !== null;
  });
  console.log('Modal input exists:', modalExists);
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  const hasModal = bodyHTML.includes('data-testid="habit-name"');
  console.log('Body contains habit-name:', hasModal);
  
  // Check for any input
  const inputs = await page.evaluate(() => document.querySelectorAll('input').length);
  console.log('Input count:', inputs);
  
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
} finally {
  await browser.close();
}
