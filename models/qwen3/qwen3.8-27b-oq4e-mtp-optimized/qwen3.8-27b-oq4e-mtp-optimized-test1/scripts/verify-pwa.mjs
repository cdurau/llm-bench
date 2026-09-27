/**
 * PWA-Verifikation mit headless Chrome über CDP:
 *  1. Seite laden (Preview-Server muss laufen, Port 4173)
 *  2. Service-Worker-Registrierung + Precache-Entries prüfen
 *  3. Screenshots: Desktop hell, Desktop dunkel, Mobile hell
 *  4. Offline-Test: Netzwerk deaktivieren, Reload, prüfen ob die App-Shell
 *     trotzdem rendert (völlig ohne Server-Antwort)
 *
 * Aufruf: node scripts/verify-pwa.mjs <outdir>
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] ?? 'verify-out';
mkdirSync(outDir, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
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

async function poll(ws, expression, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = await evaluate(ws, expression);
    if (v) return v;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('poll timeout: ' + expression);
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

try {
  // Target warten
  let page = null;
  for (let i = 0; i < 60 && !page; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json`);
      const targets = await r.json();
      page = targets.find((t) => t.type === 'page');
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
  await send(ws, 'Network.enable');

  // 1. Laden
  await send(ws, 'Page.navigate', { url: APP_URL });
  await poll(ws, `document.readyState === 'complete'`);
  await sleep(1000);

  // 2. SW + Precache: alle URLs aus der sw.js-Manifestliste müssen gecacht sein
  await poll(
    ws,
    `navigator.serviceWorker.getRegistration().then(r => r && r.active ? 'ja' : null)`,
  );
  const precacheCheck = await poll(
    ws,
    `(async () => {
      const swText = await (await fetch('/sw.js')).text();
      const urls = [...new Set((swText.match(/url:"([^"]*)"/g) || []).map((m) => m.slice(5, -1)))];
      // workbox lagt unhashte Assets mit ?__WB_REVISION__=… ab → nur Pfad vergleichen
      const wanted = new Set(urls.map((u) => new URL(u, location.origin).pathname));
      const cacheNames = await caches.keys();
      const cached = new Set();
      for (const n of cacheNames) {
        const keys = await caches.open(n).then((c) => c.keys());
        for (const k of keys) cached.add(new URL(k.url).pathname);
      }
      const missing = [...wanted].filter((p) => !cached.has(p));
      return missing.length === 0 ? JSON.stringify({ total: urls.length, missing: [] }) : null;
    })()`,
    30000,
  );
  const { total: precacheTotal, missing } = JSON.parse(precacheCheck);
  console.log(`OK: SW aktiv, Precache vollständig: ${precacheTotal} eindeutige Assets gecacht`);
  if (missing.length > 0) console.log('Fehlend:', missing);

  const appText = await evaluate(ws, `document.body.innerText.slice(0, 200)`);
  console.log('App-Text (Auszug):', JSON.stringify(appText));
  if (!appText.includes('PulseBoard')) throw new Error('App rendert nicht');

  // 3. Screenshots
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await shot(ws, 'desktop-light.png');

  await send(ws, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  });
  await sleep(400);
  await shot(ws, 'desktop-dark.png');

  await send(ws, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'light' }],
  });
  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(400);
  await shot(ws, 'mobile-light.png');

  // 4. Offline-Test: Netzwerk komplett weg, Reload → SW muss die App-Shell liefern
  await send(ws, 'Network.emulateOffline', { offline: true });
  await send(ws, 'Page.reload');
  await poll(ws, `document.readyState === 'complete'`, 20000);
  await sleep(1500);

  const offlineState = await evaluate(ws, `(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const fromCache = performance.getEntriesByType('resource')
      .filter((r) => r.deliveryType === 'cache').length;
    return JSON.stringify({
      online: navigator.onLine,
      swActive: Boolean(reg && reg.active),
      cacheEntries: fromCache,
      text: document.body.innerText.slice(0, 120),
    });
  })()`);
  console.log('Offline-Zustand:', offlineState);
  const off = JSON.parse(offlineState);
  if (off.online !== false) throw new Error('offline: navigator.onLine ist nicht false');
  if (!off.swActive) throw new Error('offline: SW nicht mehr aktiv');
  if (!off.text.includes('PulseBoard')) {
    throw new Error('offline: App rendert nicht ohne Server');
  }
  console.log('OK: App rendert vollständig offline (App-Shell aus Precache)');

  await send(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await shot(ws, 'offline-desktop.png');

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
