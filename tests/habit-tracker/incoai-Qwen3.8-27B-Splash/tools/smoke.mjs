// Kurzer Runtime-Selbsttest für Rhythm: rendert die App, durchspielt alle
// Kernfeatures und meldet Konsolen-/Service-Worker-Fehler.
// Aufruf: node tools/smoke.mjs [url]  (Default: http://localhost:4173)
import { chromium } from '/Users/cedi/Clouds/Projekte/KI/LLM-Bench/tests/habit-tracker/tools/verify/node_modules/playwright-core/index.mjs'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const url = process.argv[2] ?? 'http://localhost:4173'

// Verwende den lokal cacheden Chromium (für den Fall, dass die Playwright-Version
// hier eine andere Browserversion erwartet).
const cachedChromium = join(
  homedir(),
  'Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
)
const launchOptions = existsSync(cachedChromium)
  ? { headless: true, executablePath: cachedChromium }
  : { headless: true }
const results = []
const consoleErrors = []
const pageErrors = []

function check(name, ok, extra = '') {
  results.push({ name, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`)
}

const browser = await chromium.launch(launchOptions)
const page = await browser.newPage({ viewport: { width: 375, height: 740 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => pageErrors.push(String(err)))

try {
  await page.goto(url, { waitUntil: 'networkidle' })

  // 1. Heutiges Datum als Überschrift
  const h1 = await page.textContent('h1')
  check('Heute-Screen rendert Datum', /Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag/.test(h1 ?? ''), h1?.trim())

  // 2. Leerzustand + erstes Habit anlegen
  check('Leerzustand sichtbar', (await page.textContent('body'))?.includes('Noch keine Gewohnheiten'))
  await page.click('button:has-text("Erste Gewohnheit anlegen")')
  await page.waitForSelector('[role="dialog"]')
  await page.fill('#habit-name', 'Wasser trinken')
  await page.click('button[aria-label="Symbol 🏃"]')
  await page.click('button[aria-label="Farbe See"]')
  await page.click('[role="dialog"] button:has-text("Hinzufügen")')
  await page.waitForSelector('li')
  const habitName = await page.textContent('button[aria-label*="Wasser trinken"] > span')
  check('Habit angelegt (Zeile sichtbar)', habitName?.includes('Wasser trinken'), habitName?.trim())

  // 3. Abhaken + Fortschritt
  await page.click('button[aria-pressed="false"][aria-label*="Wasser trinken"]')
  await page.waitForTimeout(150)
  const progressText = await page.textContent('[role="progressbar"] + span')
  check('Fortschritt „1 von 1“', progressText?.includes('1 von 1'), progressText?.trim())
  check('Checkkreis gefüllt', await page.getAttribute('button[aria-pressed="true"]', 'aria-label'))

  // 4. Streak am Habit
  check('Streak sichtbar', (await page.textContent('li'))?.includes('Serie 1 Tag'))

  // 5. Stimmung
  await page.click('button[aria-label="Stimmung 4 von 5 – Gut"]')
  await page.waitForTimeout(150)
  check('Stimmung gespeichert', (await page.textContent('body'))?.includes('Gut'))

  // 6. Woche: Chart
  await page.click('button[aria-current="page"], button:has-text("Woche")').catch(() => {})
  await page.click('nav button:has-text("Woche")')
  await page.waitForSelector('.recharts-wrapper', { timeout: 5000 })
  const bars = await page.locator('.recharts-bar-rectangle').count()
  check('Wochen-Chart mit Balken', bars > 0, `${bars} Balken`)
  check('Wochen-Chart mit Stimmungs-Linie', (await page.locator('.recharts-line-curve').count()) > 0)

  // 7. Einstellungen + Dark Mode
  await page.click('nav button:has-text("Einstellungen")')
  await page.click('button[role="radio"]:has-text("Dunkel")')
  await page.waitForTimeout(100)
  check('Dark Mode aktiv', await page.evaluate(() => document.documentElement.classList.contains('dark')))
  const stored = await page.evaluate(() => localStorage.getItem('rhythm-theme'))
  check('Theme-Präferenz gespeichert', stored === 'dark', String(stored))

  // 8. Service Worker registriert
  await page.evaluate(() => navigator.serviceWorker.ready)
  const swScope = await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r?.scope))
  check('Service Worker aktiv', swScope === url.replace(/\/$/, '') + '/', String(swScope))

  // 9. Persistenz nach Reload
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  check('Habit bleibt nach Reload (IndexedDB)', (await page.textContent('body'))?.includes('Wasser trinken'))
  check('Stimmung bleibt nach Reload', (await page.textContent('body'))?.includes('Gut'))

  check('Keine Page-Errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '))
  check('Keine Konsolen-Errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
} catch (error) {
  check('Laufzeit ohne Exception', false, String(error).slice(0, 200))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} Bestanden${failed.length ? ` – fehlgeschlagen: ${failed.map((f) => f.name).join(', ')}` : ''}`)
process.exit(failed.length > 0 ? 1 : 0)
