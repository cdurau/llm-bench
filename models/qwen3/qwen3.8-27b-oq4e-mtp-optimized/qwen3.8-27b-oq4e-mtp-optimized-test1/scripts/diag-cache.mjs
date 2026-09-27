// Einmal-Diagnose: welche Manifest-URLs fehlen im Cache?
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2];
mkdirSync(outDir, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const profile = join(outDir, 'diag-profile');

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
        reject(new Error('timeout ' + method));
      }
    }, 30000);
  });
}
async function evaluate(ws, expression) {
  const r = await send(ws, 'Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('JS: ' + JSON.stringify(r.exceptionDetails));
  return r.result?.value;
}

const chrome = spawn(
  CHROME,
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
   '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank'],
  { stdio: 'ignore' },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let exitCode = 1;
try {
  let page = null;
  for (let i = 0; i < 60 && !page; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json`);
      page = (await r.json()).find((t) => t.type === 'page');
    } catch {}
    if (!page) await sleep(250);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await send(ws, 'Runtime.enable');
  await send(ws, 'Page.enable');
  await send(ws, 'Page.navigate', { url: 'http://localhost:4173/' });
  await sleep(8000); // generous

  const dump = await evaluate(ws, `(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const swText = await (await fetch('/sw.js')).text();
    const urls = [...new Set((swText.match(/url:"([^"]*)"/g) || []).map((m) => m.slice(5, -1)))];
    const cacheNames = await caches.keys();
    const out = { active: Boolean(reg && reg.active), cacheNames, per: {} };
    for (const u of urls) {
      const full = new URL(u, location.origin).href;
      let foundIn = [];
      for (const n of cacheNames) {
        const r = await caches.open(n).then((c) => c.match(full));
        if (r) foundIn.push(n);
      }
      out.per[u] = foundIn.length ? foundIn.join(', ') : 'MISSING';
    }
    const allKeys = {};
    for (const n of cacheNames) {
      const keys = await caches.open(n).then((c) => c.keys());
      allKeys[n] = keys.map((k) => k.url);
    }
    out.allKeys = allKeys;
    return JSON.stringify(out, null, 1);
  })()`);
  console.log(dump);
  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('ERR', e.message);
} finally {
  chrome.kill('SIGTERM');
  process.exit(exitCode);
}
