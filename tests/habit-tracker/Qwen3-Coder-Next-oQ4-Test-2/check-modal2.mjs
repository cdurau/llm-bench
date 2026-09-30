#!/usr/bin/env node
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  locale: 'de-DE',
});
const page = await ctx.newPage();
const errors = [];

page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('Console error:', m.text());
});

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Navigate to settings
  await page.locator('[data-testid="nav-settings"]').first().click();
  await new Promise(r => setTimeout(r, 1000));
  
  // Check if settings page loaded
  const settingsTitle = await page.locator('h2:text("Einstellungen")').count();
  console.log('Settings title found:', settingsTitle);
  
  // Check habit-add button on settings
  const habitAddCount = await page.locator('[data-testid="habit-add"]').count();
  console.log('habit-add count on settings:', habitAddCount);
  
  // Click habit-add
  if (habitAddCount > 0) {
    await page.locator('[data-testid="habit-add"]').first().click();
    await new Promise(r => setTimeout(r, 1000));
    
    // Check for habit-name
    const habitNameCount = await page.locator('[data-testid="habit-name"]').count();
    console.log('habit-name count after click:', habitNameCount);
    
    // Check for habit-save
    const habitSaveCount = await page.locator('[data-testid="habit-save"]').count();
    console.log('habit-save count after click:', habitSaveCount);
    
    // Check for modal container
    const modalCount = await page.locator('div:has(> input[data-testid="habit-name"])').count();
    console.log('Modal container count:', modalCount);
  }
  
  console.log('Errors:', errors.length);
  errors.forEach(e => console.log('  -', e.substring(0, 100)));
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
