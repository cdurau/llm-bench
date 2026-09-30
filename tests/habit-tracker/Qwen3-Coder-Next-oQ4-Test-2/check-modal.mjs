#!/usr/bin/env node
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  locale: 'de-DE',
});
const page = await ctx.newPage();

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if habit-add button exists
  const habitAddCount = await page.locator('[data-testid="habit-add"]').count();
  console.log('habit-add count:', habitAddCount);
  
  // Click habit-add
  if (habitAddCount > 0) {
    await page.locator('[data-testid="habit-add"]').first().click();
    await new Promise(r => setTimeout(r, 500));
    
    // Check for habit-name
    const habitNameCount = await page.locator('[data-testid="habit-name"]').count();
    console.log('habit-name count after click:', habitNameCount);
    
    // Check for habit-save
    const habitSaveCount = await page.locator('[data-testid="habit-save"]').count();
    console.log('habit-save count after click:', habitSaveCount);
  }
  
  // Check modal
  const modal = await page.evaluate(() => {
    const el = document.querySelector('div[inset-0]');
    return el ? 'found' : 'not found';
  });
  console.log('Modal found:', modal);
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
