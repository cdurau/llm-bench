/**
 * PWA-Verifikation mit headless Chrome über CDP (zwei Stufen):
 *
 *   node scripts/verify-pwa.mjs <outdir>            → Stufe A (Server läuft)
 *     1. Seite laden, Service-Worker + Precache prüfen
 *     2. Echte UI-Interaktion: 2 Aktivitäten anlegen (eins mit Tagesziel 3),
 *        abhaken, Zustand + localStorage prüfen
 *     3. Reload (Server online) → Persistenz prüfen
 *     4. Screenshots: Desktop hell/dunkel, Mobile hell
 *
 *   (Server stoppen, Profil bleibt in <outdir>/chrome-profile)
 *
 *   node scripts/verify-pwa.mjs <outdir> --offline → Stufe B (Server tot)
 *     5. Reload komplett ohne Server → App-Shell aus dem Precache,
 *        Daten und Status müssen erhalten sein
 *
 * Preview-Server muss in Stufe A auf http://localhost:4173 laufen.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const offlineMode = process.argv.includes('--offline');
const outDir = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'verify-out';
mkdirSync(outDir, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9335;
const APP_URL = 'http://localhost:4173/';
const profile = join(outDir, 'chrome-profile');

let id = 1;
const pending = new Map();

function send(ws, method, params = {}) {
  const myId = id++;
  return new Promise((resolve, reject) => {
    pending.set(myId, { resolve, reject });
    ws.send(JSON.stringify({ id: myId, method, params }));
    setTimeout(() => {
      if (pending.has(myId)) {
        pending.delete(myId);
        reject(new Error(`CDP timeout: ${method}`));
      }
    }, 30000);
  });
}

async function evaluate(ws, expression) {
  const r = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) throw new Error('JS error: ' + JSON.stringify(r.exceptionDetails));
  return r.result?.value;
}

async function poll(ws, expression, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await evaluate(ws, expression);
    if (v) return v;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('poll timeout: ' + expression.slice(0, 80));
}

async function shot(ws, name) {
  const r = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, name), Buffer.from(r.data, 'base64'));
  console.log('screenshot:', name);
}

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let exitCode = 0;

// React-kompatible Value-Setter + Input-Events für kontrollierte Inputs
const fillHelper = `
  window.__fill = function (selector, value) {
    const el = document.querySelector(selector);
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const set = Object.getOwnPropertyDescriptor(proto, 'value').set;
    set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  };
`;

try {
  let page = null;
  for (let i = 0; i < 60 && !page; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json`);
      page = (await r.json()).find((t) => t.type === 'page');
    } catch {
      /* noch nicht bereit */
    }
    if (!page) await sleep(250);
  }
  if (!page) throw new Error('Chrome target nicht gefunden');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  await send(ws, 'Page.enable');
  await send(ws, 'Runtime.enable');

  await send(ws, 'Page.navigate', { url: APP_URL });
  await poll(ws, `document.readyState === 'complete'`, offlineMode ? 40000 : 20000);
  await sleep(offlineMode ? 2000 : 1200);

  if (!offlineMode) {
    /* ---------------- Stufe A: Server online ---------------- */

    // SW + Precache (workbox legt unhashte Assets mit ?__WB_REVISION__=… ab)
    await poll(
      ws,
      `navigator.serviceWorker.getRegistration().then(r => r && r.active ? 'ja' : null)`,
    );
    const precacheCheck = await poll(
      ws,
      `(async () => {
        const swText = await (await fetch('/sw.js')).text();
        const urls = [...new Set((swText.match(/url:"([^"]*)"/g) || []).map((m) => m.slice(5, -1)))];
        const wanted = new Set(urls.map((u) => new URL(u, location.origin).pathname));
        const cached = new Set();
        for (const n of await caches.keys()) {
          const keys = await caches.open(n).then((c) => c.keys());
          for (const k of keys) cached.add(new URL(k.url).pathname);
        }
        const missing = [...wanted].filter((p) => !cached.has(p));
        return missing.length === 0 ? JSON.stringify({ total: urls.length }) : null;
      })()`,
      30000,
    );
    console.log(`OK: SW aktiv, Precache vollständig (${JSON.parse(precacheCheck).total} Assets)`);

    // Interaktion: Helfer injizieren, dann UI bedienen
    await evaluate(ws, fillHelper);
    await evaluate(ws, `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Aktivität hinzufügen');
      b.click();
      return document.querySelector('dialog')?.open === true;
    })()`);
    await sleep(300);
    await evaluate(ws, `__fill('#pf-name', 'Morgens laufen'); __fill('#pf-cat', 'Gesundheit'); __fill('#pf-target', '3');`);
    await evaluate(ws, `document.querySelector('dialog button[type=submit]').click(); true`);
    await sleep(300);
    await evaluate(ws, `(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Aktivität hinzufügen');
      b.click();
      return true;
    })()`);
    await sleep(300);
    await evaluate(ws, `__fill('#pf-name', 'E-Mails aufräumen'); __fill('#pf-cat', 'Arbeit');`);
    await evaluate(ws, `document.querySelector('dialog button[type=submit]').click(); true`);
    await sleep(300);

    const stateAfterAdd = await evaluate(ws, `(() => {
      const text = document.body.innerText;
      const rows = [...document.querySelectorAll('.row')].map((r) => r.querySelector('.row__name').textContent);
      const chip = document.querySelector('.row .row__chip')?.textContent ?? null;
      return JSON.stringify({ rows, chip, hasPulse: text.includes('PulseBoard') });
    })()`);
    console.log('Nach Anlegen:', stateAfterAdd);
    const added = JSON.parse(stateAfterAdd);
    if (!added.rows.includes('Morgens laufen') || !added.rows.includes('E-Mails aufräumen')) {
      throw new Error('Aktivitäten wurden nicht angelegt');
    }
    if (added.chip !== '0/3') throw new Error('Zähl-Chip fehlt/falsch: ' + added.chip);

    // Abhaken: zweite Zeile (Ziel 1) komplett, erste Zeile (Ziel 3) einmal
    await evaluate(ws, `document.querySelectorAll('.row__check')[1].click(); true`);
    await evaluate(ws, `document.querySelectorAll('.row__check')[0].click(); true`);
    await sleep(200);
    const stateAfterToggle = await evaluate(ws, `(() => {
      const checks = [...document.querySelectorAll('.row__check')].map((b) => b.getAttribute('aria-pressed'));
      const chip = document.querySelector('.row .row__chip')?.textContent ?? null;
      const stats = document.querySelector('.stats')?.innerText ?? '';
      return JSON.stringify({ checks, chip, stats });
    })()`);
    console.log('Nach Abhaken:', stateAfterToggle);
    const toggled = JSON.parse(stateAfterToggle);
    if (toggled.checks[0] !== 'false' || toggled.checks[1] !== 'true') {
      throw new Error('Toggle-Zustand falsch: ' + JSON.stringify(toggled.checks));
    }
    if (toggled.chip !== '1/3') throw new Error('Zähler falsch nach Klick: ' + toggled.chip);
    if (!toggled.stats.includes('50 %')) throw new Error('Fortschritt falsch: ' + toggled.stats);

    // localStorage: versioniertes Dokument vorhanden
    const stored = await evaluate(ws, `localStorage.getItem('pulseboard:data')`);
    const storedObj = JSON.parse(stored);
    if (storedObj.version !== 1 || storedObj.activities.length !== 2) {
      throw new Error('localStorage-Inhalt unerwartet: ' + stored);
    }
    console.log(`OK: localStorage versioniert (v${storedObj.version}), 2 Aktivitäten, Tagesstatus: ${JSON.stringify(storedObj.progress)}`);

    // Reload online → Persistenz
    await send(ws, 'Page.reload');
    await poll(ws, `document.readyState === 'complete'`);
    await sleep(1000);
    const afterReload = await evaluate(ws, `(() => {
      const checks = [...document.querySelectorAll('.row__check')].map((b) => b.getAttribute('aria-pressed'));
      return JSON.stringify({ checks, text: document.body.innerText.slice(0, 80) });
    })()`);
    console.log('Nach Reload (online):', afterReload);
    const reloaded = JSON.parse(afterReload);
    if (reloaded.checks[1] !== 'true') throw new Error('Status ging nach Reload verloren');
    console.log('OK: Persistenz nach Reload (online)');

    // Screenshots (Daten sichtbar)
    await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await shot(ws, 'desktop-light.png');
    await send(ws, 'Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await sleep(400);
    await shot(ws, 'desktop-dark.png');
    await send(ws, 'Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    await shot(ws, 'mobile-light.png');

    console.log('STUFE A ERFOLGREICH – nun den Preview-Server stoppen, dann: node scripts/verify-pwa.mjs <outdir> --offline');
  } else {
    /* ---------------- Stufe B: Server tot, App muss offline laufen ---------------- */

    const swActive = await poll(
      ws,
      `navigator.serviceWorker.getRegistration().then(r => r && r.active ? 'ja' : null)`,
      30000,
    );
    const state = await evaluate(ws, `(() => {
      const checks = [...document.querySelectorAll('.row__check')].map((b) => b.getAttribute('aria-pressed'));
      const rows = [...document.querySelectorAll('.row .row__name')].map((n) => n.textContent);
      const stats = document.querySelector('.stats')?.innerText ?? '';
      return JSON.stringify({ online: navigator.onLine, rows, checks, stats, text: document.body.innerText.slice(0, 120) });
    })()`);
    console.log('Offline-Zustand:', state);
    const off = JSON.parse(state);
    if (off.rows.length !== 2) throw new Error('offline: Aktivitäten fehlen');
    if (off.checks[1] !== 'true') throw new Error('offline: Tagesstatus verloren');
    if (!off.text.includes('PulseBoard')) throw new Error('offline: App rendert nicht');
    console.log('OK: App läuft vollständig offline (App-Shell + Daten + Tagesstatus aus Cache/Storage)');

    await send(ws, 'Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await shot(ws, 'offline-desktop.png');
    console.log('STUFE B ERFOLGREICH');
  }

  ws.close();
} catch (err) {
  console.error('FEHLER:', err.message);
  exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
  await sleep(300);
  console.log(exitCode === 0 ? 'VERIFIKATION ERFOLGREICH' : 'VERIFIKATION FEHLGESCHLAGEN');
  process.exit(exitCode);
}
