#!/usr/bin/env node
// verify.mjs – Smoke-Test für die Habit-Tracker-PWA "Rhythm" (LLM-Bench).
//
// Aufruf:   node verify.mjs [URL]      (Standard: http://localhost:4173)
// Optionen: --json   Ergebnis zusätzlich als JSON auf stdout (letzte Zeile)
// Umgebung: CHROME_PATH=/pfad/zu/chrome   statt des installierten Google Chrome
//
// Das Skript öffnet die laufende App (z. B. `npm run preview`) in einem headless Chrome bei 375 px Breite,
// bedient sie wie ein Nutzer und meldet pro Prüfung PASS oder FAIL. Es ändert nichts an der App.
// Die App muss dafür die in der Aufgabe genannten data-testid-Attribute und aria-pressed setzen.

import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const url = args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4173';
const origin = new URL(url).origin;

const VIEWPORT = { width: 375, height: 812 };
const T = 4000; // Timeout pro Nutzeraktion in ms

const results = [];
const warnings = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function check(name, fn) {
  try {
    const note = await fn();
    results.push({ name, ok: true, note: note ?? '' });
    console.log(`PASS  ${name}${note ? '  (' + note + ')' : ''}`);
  } catch (e) {
    const full = String(e.message ?? e).replace(/\u001b\[[0-9;]*m/g, '');
    let msg = full.split('\n')[0].slice(0, 300);
    // Playwright-Timeouts verstecken den Grund im Call-Log: Ziel-Element und Grund mit ausgeben
    const target = full.match(/locator resolved to (<[^\n]{0,140})/);
    const why = [...full.matchAll(/(element is not visible|element is not enabled|element is not stable|element is outside of the viewport|element was detached from the DOM|<[^>\n]{0,80}>[^\n]{0,80}intercepts pointer events)/g)].pop();
    if (target) msg += ` | Ziel: ${target[1].replace(/\s+/g, ' ')}`;
    if (why) msg += ` | Grund: ${why[1].replace(/\s+/g, ' ')}`;
    msg = msg.slice(0, 600);
    results.push({ name, ok: false, note: msg });
    console.log(`FAIL  ${name}\n        ${msg}`);
  }
}

const launchOpts = process.env.CHROME_PATH
  ? { executablePath: process.env.CHROME_PATH }
  : { channel: 'chrome' };

let browser;
try {
  browser = await chromium.launch({ headless: true, ...launchOpts });
} catch (e) {
  console.error('Chrome konnte nicht gestartet werden: ' + String(e.message).split('\n')[0]);
  console.error('Tipp: Google Chrome installieren oder CHROME_PATH setzen.');
  process.exit(2);
}

async function newSession({ colorScheme = 'light' } = {}) {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'de-DE',
    colorScheme,
    serviceWorkers: 'allow',
  });
  ctx.setDefaultTimeout(T);
  const page = await ctx.newPage();
  const errors = [];
  const sameOrigin = (u) => {
    try {
      const x = new URL(u);
      return x.origin === origin && x.pathname !== '/favicon.ico';
    } catch {
      return false;
    }
  };
  page.on('pageerror', (e) => errors.push(`JS-Fehler: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && sameOrigin(m.location().url || url)) errors.push(`console.error: ${m.text()}`);
  });
  page.on('requestfailed', (r) => {
    if (sameOrigin(r.url())) errors.push(`Request fehlgeschlagen: ${r.url()}`);
  });
  page.on('response', (r) => {
    if (sameOrigin(r.url()) && r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  return { ctx, page, errors };
}

const tid = (page, id) => page.getByTestId(id);
async function go(page, navId) {
  await tid(page, navId).first().click({ timeout: T });
  await sleep(350);
}
async function onScreens(page, id, screens = ['nav-today', 'nav-settings', 'nav-week']) {
  for (const s of screens) {
    try {
      await go(page, s);
    } catch {
      continue;
    }
    if ((await tid(page, id).count()) > 0) return s;
  }
  return null;
}
const bodyText = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
const reload = async (page) => {
  await page.reload({ waitUntil: 'load' });
  await sleep(600);
};
const pressed = async (loc) => {
  const v = (await loc.getAttribute('aria-pressed')) ?? (await loc.getAttribute('aria-checked'));
  return v === 'true';
};
const progress = async (page) => {
  const txt = (await tid(page, 'progress').first().innerText()).replace(/\s+/g, ' ');
  const m = txt.match(/(\d+)\s*von\s*(\d+)/i);
  assert(m, `Fortschritt "${txt}" passt nicht zu "X von Y"`);
  return { done: +m[1], total: +m[2], txt };
};
// effektive Hintergrundluminanz (0 = schwarz, 1 = weiß) links in der Bildschirmmitte
const luminance = (page) =>
  page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const g = c.getContext('2d', { willReadFrequently: true });
    const chain = [];
    for (let el = document.elementFromPoint(2, window.innerHeight / 2); el; el = el.parentElement) chain.push(el);
    // Hintergrund von <body> wird vom Browser auf die ganze Fläche übertragen, auch wenn der Punkt unter dem Body liegt
    chain.push(document.body, document.documentElement);
    for (const el of chain) {
      const col = getComputedStyle(el).backgroundColor;
      g.clearRect(0, 0, 1, 1);
      g.fillStyle = '#000';
      g.fillStyle = col;
      g.fillRect(0, 0, 1, 1);
      const [r, gr, b, a] = g.getImageData(0, 0, 1, 1).data;
      if (a > 250) return (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255;
    }
    return 1;
  });

console.log(`Smoke-Test gegen ${url}  (Viewport ${VIEWPORT.width}x${VIEWPORT.height})\n`);

// ---------------------------------------------------------------- Sitzung 1: frischer Zustand
const s1 = await newSession();
const { page } = s1;

await check('Seite lädt und rendert Inhalt', async () => {
  await page.goto(url, { waitUntil: 'load' });
  await sleep(800);
  const t = await bodyText(page);
  assert(t.length > 10, 'Seite bleibt (fast) leer');
});

await check('Keine JS-Fehler und keine fehlgeschlagenen Requests beim Laden', async () => {
  assert(s1.errors.length === 0, s1.errors.slice(0, 3).join(' | '));
});

await check('Stylesheet ist verarbeitet (keine rohen Direktiven)', async () => {
  const css = await page.evaluate(async () => {
    const out = [];
    for (const l of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (new URL(l.href).origin !== location.origin) continue;
      out.push(await (await fetch(l.href)).text());
    }
    for (const s of document.querySelectorAll('style')) out.push(s.textContent || '');
    return out.join('\n');
  });
  assert(css.length > 0, 'Keine eigenen Stylesheets gefunden');
  const m = css.match(/@theme\b|@tailwind\b|@import\s+["']tailwindcss|@apply\b/);
  assert(!m, `Stylesheet enthält unverarbeitete Direktive "${m?.[0]}"`);
});

await check('Bottom-Navigation: 3 Tabs sichtbar am unteren Bildschirmrand', async () => {
  const boxes = [];
  for (const id of ['nav-today', 'nav-week', 'nav-settings']) {
    const loc = tid(page, id).first();
    assert((await tid(page, id).count()) > 0, `data-testid="${id}" nicht gefunden`);
    assert(await loc.isVisible(), `${id} nicht sichtbar`);
    boxes.push({ id, ...(await loc.boundingBox()) });
  }
  for (const b of boxes) {
    assert(b.y + b.height <= VIEWPORT.height + 1, `${b.id} liegt unterhalb des sichtbaren Bereichs (y=${Math.round(b.y)})`);
    assert(b.y > VIEWPORT.height * 0.75, `${b.id} liegt nicht am unteren Rand (y=${Math.round(b.y)})`);
  }
  const ys = boxes.map((b) => Math.round(b.y));
  assert(Math.max(...ys) - Math.min(...ys) < 12, 'Tabs stehen nicht in einer Zeile');
});

await check('Tab-Navigation: Klick wechselt den Bildschirm', async () => {
  const today0 = await bodyText(page);
  await go(page, 'nav-week');
  const week = await bodyText(page);
  assert(week !== today0, 'Klick auf "nav-week" ändert nichts am Inhalt');
  await go(page, 'nav-settings');
  const sett = await bodyText(page);
  assert(sett !== week, 'Klick auf "nav-settings" ändert nichts am Inhalt');
  await go(page, 'nav-today');
  const back = await bodyText(page);
  assert(back !== sett, 'Klick auf "nav-today" ändert nichts am Inhalt');
});

await check('Kein horizontales Scrollen, Seitenbreite passt in 375 px', async () => {
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(w <= VIEWPORT.width + 1, `Seite ist ${w}px breit`);
});

await check('Touch-Ziele mindestens 44x44 px (Tabs)', async () => {
  const small = [];
  for (const id of ['nav-today', 'nav-week', 'nav-settings']) {
    const b = await tid(page, id).first().boundingBox();
    if (!b || b.width < 44 || b.height < 44) small.push(`${id}=${Math.round(b?.width)}x${Math.round(b?.height)}`);
  }
  assert(small.length === 0, small.join(', '));
});

await check('Habit anlegen (Name, Speichern) und erscheint auf dem Heute-Screen', async () => {
  const where = await onScreens(page, 'habit-add');
  assert(where, 'data-testid="habit-add" auf keinem Bildschirm gefunden');
  for (const name of ['Wasser trinken', 'Lesen']) {
    await tid(page, 'habit-add').first().click({ timeout: T });
    await sleep(250);
    await tid(page, 'habit-name').first().fill(name, { timeout: T });
    await tid(page, 'habit-save').first().click({ timeout: T });
    await sleep(400);
  }
  await go(page, 'nav-today');
  const n = await tid(page, 'habit-item').count();
  assert(n === 2, `Erwartet 2 habit-item, gefunden ${n}`);
  const t = await bodyText(page);
  assert(t.includes('Wasser trinken') && t.includes('Lesen'), 'Habit-Namen nicht sichtbar');
});

await check('Fortschritt "X von Y" zeigt 0 von 2 und Datum ist sichtbar', async () => {
  const p = await progress(page);
  assert(p.done === 0 && p.total === 2, `Angezeigt: "${p.txt}"`);
  const t = await bodyText(page);
  assert(/\b(20\d\d)\b|\b\d{1,2}\.\s?\d{1,2}\.|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag/.test(t), 'Kein Datum erkennbar');
});

await check('Abhaken gilt pro Habit (nur das angetippte wird erledigt)', async () => {
  const items = tid(page, 'habit-item');
  const t1 = items.nth(0).getByTestId('habit-toggle');
  const t2 = items.nth(1).getByTestId('habit-toggle');
  assert((await t1.count()) === 1 && (await t2.count()) === 1, 'habit-toggle je habit-item nicht genau einmal gefunden');
  await t1.click({ timeout: T });
  await sleep(500);
  const p = await progress(page);
  assert(p.done === 1 && p.total === 2, `Nach Tippen auf Habit 1 angezeigt: "${p.txt}"`);
  assert(await pressed(items.nth(0).getByTestId('habit-toggle')), 'Habit 1 nicht als erledigt markiert (aria-pressed)');
  assert(!(await pressed(items.nth(1).getByTestId('habit-toggle'))), 'Habit 2 ist fälschlich erledigt markiert');
  await t1.click({ timeout: T });
  await sleep(400);
  assert((await progress(page)).done === 0, 'Erneutes Tippen macht das Abhaken nicht rückgängig');
  await t1.click({ timeout: T });
  await sleep(400);
});

await check('Streak ist am Habit sichtbar (aktuell und längste Serie)', async () => {
  const s = tid(page, 'habit-streak').first();
  assert((await tid(page, 'habit-streak').count()) >= 2, 'data-testid="habit-streak" nicht an jedem Habit');
  const txt = (await s.innerText()).replace(/\s+/g, ' ');
  const nums = (txt.match(/\d+/g) ?? []).map(Number);
  assert(nums.length >= 2, `Streak-Text "${txt}" zeigt nicht zwei Zahlen (aktuell, längste)`);
  assert(nums.some((n) => n >= 1), `Nach Abhaken keine Serie >= 1 sichtbar: "${txt}"`);
});

await check('Daten bleiben nach Reload erhalten (Habits, Abhaken)', async () => {
  await reload(page);
  assert((await tid(page, 'habit-item').count()) === 2, 'Habits nach Reload nicht mehr da');
  const p = await progress(page);
  assert(p.done === 1 && p.total === 2, `Nach Reload angezeigt: "${p.txt}"`);
  assert(await pressed(tid(page, 'habit-item').nth(0).getByTestId('habit-toggle')), 'Abhaken nach Reload verloren');
});

await check('Stimmung 1 bis 5 wählbar, genau eine aktiv, bleibt nach Reload', async () => {
  const where = await onScreens(page, 'mood-1');
  assert(where, 'data-testid="mood-1" auf keinem Bildschirm gefunden');
  for (let i = 1; i <= 5; i++) assert((await tid(page, `mood-${i}`).count()) === 1, `mood-${i} fehlt`);
  await tid(page, 'mood-4').click({ timeout: T });
  await sleep(400);
  for (let i = 1; i <= 5; i++) {
    const on = await pressed(tid(page, `mood-${i}`));
    assert(on === (i === 4), `mood-${i} aria-pressed=${on}, erwartet ${i === 4}`);
  }
  await tid(page, 'mood-2').click({ timeout: T });
  await sleep(300);
  assert(await pressed(tid(page, 'mood-2')) && !(await pressed(tid(page, 'mood-4'))), 'Umwählen (4 -> 2) funktioniert nicht');
  await reload(page);
  await onScreens(page, 'mood-1');
  assert(await pressed(tid(page, 'mood-2')), 'Stimmung nach Reload verloren');
});

await check('Woche-Screen zeigt ein Chart mit sichtbarer Fläche', async () => {
  await go(page, 'nav-week');
  await sleep(900);
  const c = tid(page, 'week-chart').first();
  assert((await tid(page, 'week-chart').count()) > 0, 'data-testid="week-chart" nicht gefunden');
  const b = await c.boundingBox();
  assert(b && b.width > 150 && b.height > 80, `Chart-Fläche zu klein: ${Math.round(b?.width)}x${Math.round(b?.height)}`);
  const shapes = await c.locator('svg path, svg rect, svg circle').count();
  assert(shapes > 5, `Im Chart nur ${shapes} SVG-Formen`);
});

await check('Kein horizontales Scrollen auf Woche- und Einstellungs-Screen', async () => {
  for (const n of ['nav-week', 'nav-settings']) {
    await go(page, n);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(w <= VIEWPORT.width + 1, `${n}: Seite ist ${w}px breit`);
  }
});

await check('Inhalt, der über den Bildschirm hinausragt, lässt sich scrollen', async () => {
  const problems = [];
  for (const n of ['nav-today', 'nav-week', 'nav-settings']) {
    await go(page, n);
    const overflowing = await page.evaluate(() => {
      let maxBottom = 0;
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (!r.width || !r.height || cs.position === 'fixed' || cs.visibility === 'hidden') continue;
        if (!(el.textContent || '').trim() && el.tagName !== 'svg') continue;
        maxBottom = Math.max(maxBottom, r.bottom);
      }
      return Math.max(maxBottom, document.scrollingElement.scrollHeight) > window.innerHeight + 5;
    });
    if (!overflowing) continue;
    const snap = () =>
      page.evaluate(() => window.scrollY + [...document.querySelectorAll('*')].reduce((s, e) => s + e.scrollTop, 0));
    const before = await snap();
    await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
    await page.mouse.wheel(0, 1500);
    await sleep(300);
    if ((await snap()) === before) problems.push(n);
  }
  assert(problems.length === 0, `Inhalt wird abgeschnitten und lässt sich nicht scrollen auf: ${problems.join(', ')}`);
});

await check('Fokus per Tastatur sichtbar (heuristisch)', async () => {
  await go(page, 'nav-today');
  await page.evaluate(() => document.activeElement?.blur());
  let ok = false;
  let last = '';
  for (let i = 0; i < 12 && !ok; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      return { tag: el.tagName, outline, shadow: cs.boxShadow !== 'none' };
    });
    if (f) {
      last = `${f.tag} outline=${f.outline} shadow=${f.shadow}`;
      ok = f.outline || f.shadow;
    }
  }
  assert(ok, `Fokussierte Elemente zeigen weder Outline noch Schatten (zuletzt: ${last})`);
});

// ---------------------------------------------------------------- Dark Mode
await check('Dark Mode: manuell umschaltbar, Auswahl bleibt nach Reload', async () => {
  const where = await onScreens(page, 'theme-toggle');
  assert(where, 'data-testid="theme-toggle" auf keinem Bildschirm gefunden');
  const l0 = await luminance(page);
  await tid(page, 'theme-toggle').first().click({ timeout: T });
  await sleep(500);
  const l1 = await luminance(page);
  assert(Math.abs(l1 - l0) > 0.3, `Hintergrund ändert sich nicht deutlich (${l0.toFixed(2)} -> ${l1.toFixed(2)})`);
  await reload(page);
  const l2 = await luminance(page);
  assert(Math.abs(l2 - l1) < 0.15, `Auswahl nach Reload verloren (${l1.toFixed(2)} -> ${l2.toFixed(2)})`);
  // zurückstellen, damit der Zustand für die folgenden Checks bekannt ist
  await onScreens(page, 'theme-toggle');
  await tid(page, 'theme-toggle').first().click({ timeout: T });
  await sleep(300);
});

// ---------------------------------------------------------------- PWA (in Sitzung 1, Daten vorhanden)
await check('PWA: Manifest mit Name, standalone, Icons 192 und 512 erreichbar', async () => {
  const href = await page.evaluate(() => document.querySelector('link[rel="manifest"]')?.href ?? null);
  assert(href, '<link rel="manifest"> fehlt');
  const res = await page.request.get(href);
  assert(res.ok(), `Manifest nicht ladbar (HTTP ${res.status()})`);
  const m = await res.json();
  assert(m.name || m.short_name, 'Manifest ohne name');
  assert(['standalone', 'fullscreen', 'minimal-ui'].includes(m.display), `display="${m.display}"`);
  const sizes = (m.icons ?? []).flatMap((i) => String(i.sizes).split(/\s+/).map((s) => ({ s, i })));
  const icon = (px) => sizes.find((x) => x.s === `${px}x${px}`)?.i;
  assert(icon(192), 'Kein Icon 192x192 im Manifest');
  assert(icon(512), 'Kein Icon 512x512 im Manifest');
  const types = [];
  for (const px of [192, 512]) {
    const r = await page.request.get(new URL(icon(px).src, href).href);
    assert(r.ok(), `Icon ${px} nicht ladbar (HTTP ${r.status()})`);
    assert((r.headers()['content-type'] ?? '').startsWith('image/'), `Icon ${px} hat Content-Type ${r.headers()['content-type']}`);
    const len = (await r.body()).length;
    assert(len > 100, `Icon ${px} ist praktisch leer (${len} Bytes)`);
    types.push(r.headers()['content-type']);
  }
  if (types.some((t) => t.includes('svg'))) warnings.push('Icons sind SVG, nicht PNG (Installierbarkeit je nach Browser/Plattform unsicher)');
});

await check('PWA: Service Worker aktiv und steuert die Seite', async () => {
  const state = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { err: 'kein serviceWorker' };
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((r) => setTimeout(() => r(null), 10000)),
    ]);
    if (!reg) return { err: 'kein aktiver Service Worker nach 10 s' };
    return { script: reg.active?.scriptURL, state: reg.active?.state };
  });
  assert(!state.err, state.err);
  assert(state.state === 'activated', `Service Worker Status "${state.state}"`);
});

await check('Offline: Reload ohne Netz zeigt die App samt gespeicherter Daten', async () => {
  await reload(page); // sorgt dafür, dass die Seite vom Service Worker kontrolliert wird
  const ctrl = await page.evaluate(() => !!navigator.serviceWorker.controller);
  assert(ctrl, 'Seite wird nach Reload nicht vom Service Worker kontrolliert');
  await s1.ctx.setOffline(true);
  try {
    await page.reload({ waitUntil: 'load', timeout: 8000 });
    await sleep(800);
    assert((await tid(page, 'nav-today').count()) > 0, 'Offline: App-Oberfläche fehlt');
    await go(page, 'nav-today');
    const n = await tid(page, 'habit-item').count();
    assert(n === 2, `Offline: ${n} statt 2 Habits sichtbar`);
    await tid(page, 'habit-item').nth(1).getByTestId('habit-toggle').click({ timeout: T });
    await sleep(400);
    assert((await progress(page)).done === 2, 'Offline: Abhaken funktioniert nicht');
  } finally {
    await s1.ctx.setOffline(false);
  }
});

await check('Keine JS-Fehler während der gesamten Nutzung', async () => {
  const errs = s1.errors.filter((e) => !/Failed to load resource/.test(e));
  assert(errs.length === 0, [...new Set(errs)].slice(0, 3).join(' | '));
});

// Hinweise (nicht gewertet)
try {
  const meta = await page.evaluate(() => ({
    viewport: document.querySelector('meta[name="viewport"]')?.content ?? '',
    lang: document.documentElement.lang,
    extern: [...document.querySelectorAll('link[href^="http"], script[src^="http"]')].map((e) => e.href || e.src),
  }));
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(meta.viewport)) warnings.push('Viewport verbietet Zoomen (user-scalable=no / maximum-scale=1)');
  if (meta.lang !== 'de') warnings.push(`<html lang="${meta.lang}"> statt "de"`);
  if (meta.extern.length) warnings.push(`Externe Ressourcen im HTML (offline nicht verfügbar): ${meta.extern.slice(0, 2).join(', ')}`);
} catch {}
await s1.ctx.close();

// ---------------------------------------------------------------- Sitzung 2: Dark Mode folgt dem System
await check('Dark Mode folgt dem System (frischer Start mit dunklem System)', async () => {
  const d = await newSession({ colorScheme: 'dark' });
  const l = await newSession({ colorScheme: 'light' });
  try {
    await d.page.goto(url, { waitUntil: 'load' });
    await l.page.goto(url, { waitUntil: 'load' });
    await sleep(800);
    const ld = await luminance(d.page);
    const ll = await luminance(l.page);
    assert(ld < 0.35, `Bei dunklem System ist der Hintergrund hell (Luminanz ${ld.toFixed(2)})`);
    assert(ll > 0.6, `Bei hellem System ist der Hintergrund dunkel (Luminanz ${ll.toFixed(2)})`);
  } finally {
    await d.ctx.close();
    await l.ctx.close();
  }
});

// ---------------------------------------------------------------- Sitzung 3: Leerzustände
await check('Leerzustände: frische App ohne Daten zeigt Hinweistext statt leerer Fläche', async () => {
  const s = await newSession();
  try {
    await s.page.goto(url, { waitUntil: 'load' });
    await sleep(800);
    assert((await tid(s.page, 'habit-item').count()) === 0, 'Frischer Start enthält bereits Habits');
    const today = await bodyText(s.page);
    const nav = ['Heute', 'Woche', 'Einstellungen'];
    const stripped = nav.reduce((t, n) => t.split(n).join(''), today).trim();
    assert(stripped.length > 25, `Heute-Screen ohne Habits hat kaum Text: "${today.slice(0, 80)}"`);
    await go(s.page, 'nav-week');
    await sleep(700);
    const week = await bodyText(s.page);
    const strippedW = nav.reduce((t, n) => t.split(n).join(''), week).trim();
    assert(strippedW.length > 10, 'Woche-Screen ohne Daten ist leer');
    assert(s.errors.filter((e) => !/Failed to load resource/.test(e)).length === 0, `Fehler im Leerzustand: ${s.errors[0]}`);
  } finally {
    await s.ctx.close();
  }
});

await browser.close();

// ---------------------------------------------------------------- Zusammenfassung
const passed = results.filter((r) => r.ok).length;
console.log(`\nErgebnis: ${passed} von ${results.length} Prüfungen bestanden.`);
if (warnings.length) {
  console.log('Hinweise (nicht gewertet):');
  for (const w of warnings) console.log('  - ' + w);
}
if (passed < results.length) {
  console.log('\nOffen:');
  for (const r of results.filter((x) => !x.ok)) console.log(`  - ${r.name}: ${r.note}`);
}
if (wantJson) console.log(JSON.stringify({ url, passed, total: results.length, results, warnings }));
process.exit(passed === results.length ? 0 : 1);
