// Record real screen clips of the live pharmacy demo (https://sudegy-pharmacy.pages.dev/) for the system tour video.
// Each chapter = one clip: CDP screencast frames (only when the screen changes) → constant 30 fps MP4 via ffmpeg concat,
// plus <chapter>.json with every tap (time, x, y) and "focus" boxes (time + element rectangle) for the zooms.
// A visible finger shows every tap. Phone numbers are masked on screen (privacy). WhatsApp links never open:
// the prepared message text is captured instead (the system prepares it; the pharmacist sends it).
// Usage: node scripts/record_demo.cjs <flows.cjs> <outDir> [chapterId,...]
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const URL = 'https://sudegy-pharmacy.pages.dev/';
const VW = 390, VH = 844, DSF = 2.5;           // frames: 975 x 2110
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function chrome() {
  const base = path.join(os.homedir(), '.cache', 'hyperframes', 'chrome', 'chrome-headless-shell');
  return path.join(base, fs.readdirSync(base).sort().reverse()[0], 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');
}
const PAGE_HELPERS = `(() => {
  if (window.__tourReady) return; window.__tourReady = true;
  const css = document.createElement('style');
  css.textContent = '#__finger{position:fixed;left:195px;top:900px;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.28);border:2.5px solid rgba(240,214,150,.95);box-shadow:0 0 0 6px rgba(240,214,150,.18),0 6px 18px rgba(0,0,0,.5);z-index:2147483647;pointer-events:none;transition:left .45s cubic-bezier(.3,.7,.3,1),top .45s cubic-bezier(.3,.7,.3,1),transform .12s,opacity .25s;opacity:0}#__finger.on{opacity:1}#__finger.press{transform:scale(.78)}.__ring{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid rgba(240,214,150,.9);z-index:2147483646;pointer-events:none;animation:__r .55s ease-out forwards}@keyframes __r{from{transform:scale(.6);opacity:1}to{transform:scale(2.4);opacity:0}}';
  document.documentElement.appendChild(css);
  const f = document.createElement('div'); f.id = '__finger'; document.documentElement.appendChild(f);
  // privacy: mask Sudanese phone numbers on screen
  const mask = (s) => s.replace(/(0|\\+?249)(9\\d)\\d{7}/g, (m, a, b) => a + b + '•• ••• •••');
  const walk = (n) => { if (n.nodeType === 3) { const t = mask(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; } else if (n.nodeType === 1 && n.id !== '__finger') { if (n.tagName === 'INPUT' && /^0?9\\d{8}$/.test(n.value)) n.value = mask(n.value); n.childNodes.forEach(walk); } };
  new MutationObserver((ms) => ms.forEach((m) => { if (m.type === 'characterData') walk(m.target); else m.addedNodes.forEach(walk); })).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  walk(document.body);
  // WhatsApp: never leave the page; keep the prepared text
  window.__wa = [];
  const keep = (u) => { try { const x = new URL(u, location.href); if (/wa\\.me|whatsapp/.test(x.host)) { window.__wa.push(decodeURIComponent(x.searchParams.get('text') || '')); return true; } } catch (e) {} return false; };
  const o = window.open; window.open = function (u) { if (keep(u)) return null; return o.apply(this, arguments); };
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a && keep(a.href)) { e.preventDefault(); } }, true);
})()`;

async function main() {
  const [flowsFile, outDir, only] = process.argv.slice(2);
  const flows = require(path.resolve(flowsFile));
  fs.mkdirSync(outDir, { recursive: true });
  const b = await puppeteer.launch({ executablePath: chrome(), args: ['--no-sandbox', '--font-render-hinting=none'], userDataDir: path.join(outDir, '.profile') });
  for (const ch of flows.chapters.filter((c) => !only || only.split(',').includes(c.id))) {
    const ctx = await b.createBrowserContext();
    const p = await ctx.newPage();
    await p.setViewport({ width: VW, height: VH, deviceScaleFactor: DSF, isMobile: true, hasTouch: false });
    await p.goto(URL + (ch.query || ''), { waitUntil: 'networkidle0', timeout: 60000 });   // hash routing: no reload later
    await p.evaluate(PAGE_HELPERS);
    const cdp = await p.createCDPSession();
    const frames = []; let rec = false;
    cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => { if (rec) frames.push({ t: metadata.timestamp, data }); try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch (e) {} });
    const ev = []; let T0 = 0; const now = () => Date.now() / 1000 - T0;
    let fx = VW / 2, fy = VH * 0.75;
    const api = {
      p, sleep,
      async login(role = 'owner') { if (await p.$('#enter')) { if (role !== 'owner') await p.click(`.role[data-role="${role}"]`); await p.click('#enter'); await sleep(900); } },
      async go(hash) { await p.evaluate((h) => { location.hash = '#/' + h; }, hash); await sleep(900); await p.evaluate(() => window.scrollTo(0, 0)); await sleep(200); },
      async finger(on = true) { await p.evaluate((on) => document.getElementById('__finger').classList.toggle('on', on), on); },
      async moveTo(x, y, ms = 480) { fx = x; fy = y; await p.evaluate((x, y) => { const f = document.getElementById('__finger'); f.classList.add('on'); f.style.left = x + 'px'; f.style.top = y + 'px'; }, x, y); await sleep(ms); },
      async rect(sel) { return p.evaluate((s) => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel); },
      async show(sel, block = 'center') {   // smooth scroll so the element is visible
        const r0 = await api.rect(sel); if (!r0) throw new Error('not found: ' + sel);
        if (r0.y < 70 || r0.y + r0.h > VH - 110) { await p.evaluate((s, block) => document.querySelector(s).scrollIntoView({ behavior: 'smooth', block }), sel, block); await sleep(900); }
        const r1 = await api.rect(sel);
        if (r1.x < 4 || r1.x + r1.w > VW - 4) { await p.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), sel); await sleep(700); }
      },
      async mark2(sel, re) {   // give the first element matching sel whose text matches re a unique attribute, return its selector
        const tok = 't' + Math.random().toString(36).slice(2, 8);
        const ok = await p.evaluate((s, src, tok) => { const re = new RegExp(src); const e = [...document.querySelectorAll(s)].find((x) => re.test(x.innerText)); if (!e) return false; e.setAttribute('data-tour', tok); return true; }, sel, re, tok);
        if (!ok) throw new Error(`no ${sel} with text ${re}`); return `[data-tour="${tok}"]`;
      },
      async clear(sel) { await p.$eval(sel, (e) => { e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); }); },
      async glide(dy, ms = 1400) {   // slow eased scroll (smooth scrolling is too quick to read)
        await p.evaluate((dy, ms) => new Promise((res) => { const y0 = scrollY, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, y0 + dy * e); if (k < 1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }), dy, ms);
        await sleep(120);
      },
      async scrollIn(sel, dy, ms = 900) { await p.evaluate((s, dy) => document.querySelector(s).scrollBy({ top: dy, behavior: 'smooth' }), sel, dy); await sleep(ms); },
      async tap(sel, label, { hold = 350 } = {}) {
        await api.show(sel); const r = await api.rect(sel); const x = r.x + r.w / 2, y = r.y + r.h / 2;
        await api.moveTo(x, y);
        await p.evaluate((x, y) => { const f = document.getElementById('__finger'); f.classList.add('press'); const g = document.createElement('div'); g.className = '__ring'; g.style.left = x + 'px'; g.style.top = y + 'px'; document.documentElement.appendChild(g); setTimeout(() => g.remove(), 700); }, x, y);
        ev.push({ type: 'tap', t: +now().toFixed(3), x: +x.toFixed(1), y: +y.toFixed(1), label: label || sel });
        await sleep(110); await p.evaluate((s) => document.querySelector(s).click(), sel);
        await p.evaluate(() => document.getElementById('__finger').classList.remove('press')); await sleep(Math.min(hold, 260));
        await p.evaluate(() => document.getElementById('__finger').classList.remove('on')); await sleep(Math.max(0, hold - 260));   // never park on the result
      },
      async type(sel, text, delay = 120, { clear = false } = {}) {   // el.click() does not move the keyboard focus: focus explicitly
        await api.tap(sel, 'type', { hold: 150 });
        await p.$eval(sel, (e, clear) => { e.focus(); if (clear) { e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); } const n = e.value.length; try { e.setSelectionRange(n, n); } catch (x) {} }, clear);
        for (const ch of text) { if (/[\x20-\x7e]/.test(ch)) await p.keyboard.type(ch); else await p.keyboard.sendCharacter(ch); await sleep(delay); }
        ev.push({ type: 'typed', t: +now().toFixed(3), text });
      },
      async focus(sel, label, pad = 10) { const r = await api.rect(sel); if (r) ev.push({ type: 'focus', t: +now().toFixed(3), label, x: r.x - pad, y: r.y - pad, w: r.w + 2 * pad, h: r.h + 2 * pad }); return r; },
      async scrollBy(dy, ms = 900) { await p.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'smooth' }), dy); await sleep(ms); },
      mark(label) { ev.push({ type: 'mark', t: +now().toFixed(3), label }); },
      async wa() { return p.evaluate(() => window.__wa.slice()); }
    };
    if (ch.setup) await ch.setup(api);           // not recorded (login, navigation)
    await sleep(400);
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
    await sleep(150); T0 = Date.now() / 1000; rec = true;
    await p.evaluate(() => { const f = document.getElementById('__finger'); f.style.opacity = '0.999'; setTimeout(() => (f.style.opacity = ''), 30); });   // force a first frame
    await ch.run(api);
    const T1 = Date.now() / 1000; rec = false;
    await cdp.send('Page.stopScreencast');
    const wa = await api.wa();
    // frames → constant 30 fps clip
    const dir = path.join(outDir, ch.id + '_frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
    const tFirst = frames.length ? frames[0].t : T0; const off = T0 - tFirst;   // screencast clock vs wall clock
    let list = '';
    frames.forEach((f, i) => {
      const fn = `f${String(i).padStart(5, '0')}.jpg`; fs.writeFileSync(path.join(dir, fn), Buffer.from(f.data, 'base64'));
      const t = f.t - tFirst, tn = i + 1 < frames.length ? frames[i + 1].t - tFirst : T1 - T0 + off;
      list += `file '${fn}'\nduration ${Math.max(0.001, tn - t).toFixed(4)}\n`;
    });
    list += `file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
    fs.writeFileSync(path.join(dir, 'list.txt'), list);
    const mp4 = path.join(outDir, ch.id + '.mp4');
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-vf', 'fps=30,scale=976:2110:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart', path.resolve(mp4)], { cwd: dir, encoding: 'utf8' });
    if (r.status) throw new Error('ffmpeg: ' + r.stderr);
    const dur = T1 - T0;
    // event times → clip times (the clip starts at the first screencast frame; checked on frames: the tap ring lands on t + off)
    const evs = ev.map((e) => ({ ...e, t: +Math.max(0, e.t + off).toFixed(3) }));
    fs.writeFileSync(path.join(outDir, ch.id + '.json'), JSON.stringify({ id: ch.id, dur: +(dur + off).toFixed(3), frames: frames.length, fps: +(frames.length / dur).toFixed(1), clockOffset: +off.toFixed(3), viewport: { w: VW, h: VH, dsf: DSF }, events: evs, wa }, null, 1));
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`${ch.id}: ${dur.toFixed(1)} s, ${frames.length} frames (${(frames.length / dur).toFixed(1)} fps captured), ${ev.length} events${wa.length ? ', whatsapp text captured' : ''}`);
    await ctx.close();
  }
  await b.close();
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
