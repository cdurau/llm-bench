import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  locale: 'de-DE',
});
const page = await ctx.newPage();

await page.goto('http://localhost:4173', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 800));

// Prüfe die DOM-Struktur
const html = await page.evaluate(() => document.body.innerHTML);
const hasNav = await page.evaluate(() => document.querySelector('[data-testid="nav-today"]') !== null);
const navItems = await page.evaluate(() => 
  Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'))
);

console.log('Has nav-today:', hasNav);
console.log('All data-testid attributes:', navItems);
console.log('Page title:', await page.title());
console.log('Body text (first 500 chars):', (await page.evaluate(() => document.body.innerText)).slice(0, 500));

await browser.close();
