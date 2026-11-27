// Smoke test for the Rhythm PWA (runs against `npm run preview` on :4173).
// Run: bun tests/smoke.mjs
// Uses the pre-cached headless chromium if CHROMIUM_EXE is not set.
import { chromium } from 'playwright';

const EXE =
  process.env.CHROMIUM_EXE ||
  '/Users/cedi/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const fails = [];
const ok = (name) => console.log(`  ✓ ${name}`);
const fail = (name, err) => {
  fails.push(name);
  console.error(`  ✗ ${name}: ${err}`);
};

async function expectText(page, text, ctx = '') {
  const sel = page.getByText(text, { exact: false }).first();
  try {
    await sel.waitFor({ state: 'visible', timeout: 5000 });
    return true;
  } catch {
    fail(`text: ${text}${ctx ? ` (${ctx})` : ''}`, 'not visible');
    return false;
  }
}

let pageErrors = [];
try {
  const browser = await chromium.launch({
    executablePath: EXE,
    headless: true,
    args: ['--no-sandbox']
  });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: 'de-DE',
    deviceScaleFactor: 1
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  console.log('\n— Load —');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  // 1. Title / lang
  const title = await page.title();
  if (title.toLowerCase().includes('rhythm')) ok('title contains Rhythm');
  else fail('title contains Rhythm', title);

  const lang = await page.locator('html').getAttribute('lang');
  if (lang === 'de') ok('lang=de');
  else fail('lang=de', lang);

  // 2. Nav tabs
  const tabs = await page
    .getByRole('button', { name: /^(Heute|Woche|Einstellungen)$/ })
    .allTextContents();
  if (
    tabs.length === 3 &&
    tabs.includes('Heute') &&
    tabs.includes('Woche') &&
    tabs.includes('Einstellungen')
  ) {
    ok('3 tabs: Heute / Woche / Einstellungen');
  } else {
    fail('nav tabs', JSON.stringify(tabs));
  }

  // 3. Empty state
  await expectText(page, 'Noch keine Gewohnheiten', 'today');

  // 4. Add a habit via modal
  await page.getByRole('button', { name: /Gewohnheit anlegen/ }).first().click();
  await page.getByRole('dialog').waitFor({ timeout: 5000 });
  await page.locator('#habit-name').fill('Laufen');
  await page.getByRole('button', { name: 'Anlegen', exact: true }).click();
  await page
    .getByRole('dialog')
    .waitFor({ state: 'hidden', timeout: 5000 })
    .catch(() => {});
  ok('habit editor opens and closes');

  await page.getByText('Laufen').first().waitFor({ timeout: 5000 });
  ok('habit appears in list');

  // 5. Progress + toggle habit
  await expectText(page, '0 von 1');
  const toggle = page.getByRole('button', { name: /Laufen/ }).first();
  const pressedBefore = await toggle.getAttribute('aria-pressed');
  await toggle.click();
  await page.waitForTimeout(900);
  const pressedAfter = await page
    .getByRole('button', { name: /Laufen/ })
    .first()
    .getAttribute('aria-pressed');
  if (pressedBefore !== pressedAfter && pressedAfter === 'true') ok('habit toggles to done');
  else fail('habit toggles to done', `${pressedBefore} -> ${pressedAfter}`);
  await expectText(page, '1 von 1');

  // 6. Mood selection
  const moodButton = page.getByRole('radio', { name: /Stimmung 5/ });
  await moodButton.click();
  await page.waitForTimeout(500);
  const noteBox = page.getByLabel('Kurznotiz zur Stimmung');
  if (await noteBox.isVisible().catch(() => false)) ok('mood selected → note field appears');
  else fail('mood selected → note field', 'note field not visible');
  await noteBox.fill('Gute Morgenroutine');
  await page.waitForTimeout(700); // debounce

  // 7. Week screen
  console.log('\n— Woche —');
  await page.getByRole('button', { name: 'Woche', exact: true }).click();
  await page.getByRole('heading', { name: 'Woche', level: 1 }).waitFor({ timeout: 5000 });
  ok('Woche screen renders');
  const chartSection = page.getByLabel('Wochenübersicht').first();
  await chartSection.waitFor({ timeout: 5000 });
  const svg = chartSection.locator('svg');
  try {
    await svg.first().waitFor({ state: 'visible', timeout: 10000 });
    ok('chart svg rendered');
  } catch {
    fail('chart svg rendered', '0 svgs');
  }
  await expectText(page, 'Erledigt');

  // 8. Settings: theme toggle persists
  console.log('\n— Einstellungen —');
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('heading', { name: 'Einstellungen', level: 1 }).waitFor({ timeout: 5000 });
  const darkBtn = page.getByRole('radio', { name: /Dunkel/ });
  await darkBtn.click();
  await page.waitForTimeout(400);
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const stored = await page.evaluate(() => localStorage.getItem('rhythm-theme'));
  if (isDark && stored === 'dark') ok('theme toggle: dark applied + persisted');
  else fail('theme toggle: dark applied + persisted', `dark=${isDark} stored=${stored}`);

  await page.reload({ waitUntil: 'networkidle' });
  const darkAfterReload = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  if (darkAfterReload) ok('dark theme survives reload');
  else fail('dark theme survives reload', 'not dark after reload');
  // reload resets tab to Heute — navigate back to settings to reset theme
  await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
  await page.getByRole('heading', { name: 'Einstellungen', level: 1 }).waitFor({ timeout: 5000 });
  await page.getByRole('radio', { name: /System/ }).click(); // restore
  await page.waitForTimeout(300);

  // 9. Export button present
  await expectText(page, 'Export');

  // 10. Offline smoke: reload with network off
  console.log('\n— Offline —');
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const heading = await page.getByRole('heading', { name: 'Heute', level: 1 }).count();
  if (heading > 0) ok('app still loads offline (service worker)');
  else fail('app fully offline', 'Heute heading missing');
  await ctx.setOffline(false);

  console.log('\n— Icons / manifest —');
  const manifestLink = await page.locator('link[rel="manifest"]').count();
  if (manifestLink > 0) ok('manifest linked');
  else fail('manifest linked', 'no link[rel=manifest]');

  await browser.close();

  console.log('\n— Result —');
  if (fails.length === 0) {
    console.log('All smoke checks passed ✓');
  } else {
    console.error(`Failed checks: ${fails.length}\n - ${fails.join('\n - ')}`);
    process.exit(1);
  }
  if (pageErrors.length > 0) {
    console.error('\nBrowser page errors:\n ' + pageErrors.join('\n '));
    process.exit(1);
  }
} catch (e) {
  console.error('\nSmoke test crashed:', String(e).split('\n').slice(0, 12).join('\n'));
  process.exit(1);
}
