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
  
  const hasRootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root && root.children.length > 0;
  });
  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
  
  console.log('Root has content:', hasRootContent);
  console.log('Body text length:', bodyText.length);
  console.log('Body text (first 200 chars):', bodyText.substring(0, 200));
  
  const navToday = await page.evaluate(() => document.querySelector('[data-testid="nav-today"]'));
  console.log('nav-today found:', !!navToday);
  
  const progress = await page.evaluate(() => document.querySelector('[data-testid="progress"]'));
  console.log('progress found:', !!progress);
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
