// Match-cut lab: builds a small composition through the REAL compose/scenes/stage code (no job, voice, API calls or render)
// with every transition kind, then checks each match cut in headless Chrome:
//   - the anchor's centre and size just before and just after the cut (independent of SF.matchCut's own report)
//   - a before|after frame pair per cut -> out/lab/matchcut_<n>.jpg
// Usage: node factory/tools/matchcut_lab.cjs [--render]
const path = require('path');
const { ROOT, run, fs } = require('../lib/util.cjs');
const { compose, planTimes } = require('../lib/compose.cjs');

const client = JSON.parse(fs.readFileSync(`${ROOT}/factory/clients/sudegy.json`, 'utf8'));
const SEC = 2.4;
const scenes = [
  // 0: night, unanswered phone big in the hand
  { type: 'stage', bg: 'dark', chars: [{ id: 'g', type: 'man_gulf', x: 300 }], props: [{ id: 'ph', type: 'phoneHand', x: 640, y: 1150, scale: 1.0, front: true }], beats: [{ do: 'sad', who: 'g', at: 0.3 }] },
  // 1: same phone, smaller and elsewhere, in the clinic -> auto picks "in" (incoming scene starts zoomed and relaxes)
  { type: 'stage', bg: 'clinic', transition: 'matchcut', match: { from: 'ph', to: 'ph' }, chars: [{ id: 'd', type: 'doctor_f', x: 320 }], props: [{ id: 'ph', type: 'phoneHand', x: 760, y: 1250, scale: 0.7, front: true }], beats: [{ do: 'cheer', who: 'd', at: 0.5 }] },
  // 2: plain wipe (unchanged default)
  { type: 'stage', bg: 'office', chars: [{ id: 'b', type: 'man_sd', x: 540 }], props: [{ id: 'clk', type: 'clock', x: 300, y: 760, scale: 0.45 }], beats: [{ do: 'spin', prop: 'clk', at: 0.2, dur: 2, turns: 2 }] },
  // 3: small clock -> big clock -> auto picks "out" (outgoing scene pushes in)
  { type: 'stage', bg: 'room', transition: 'matchcut', match: { from: 'clk', to: 'clk' }, chars: [{ id: 'w', type: 'woman', x: 300 }], props: [{ id: 'clk', type: 'clock', x: 720, y: 820, scale: 0.9 }] },
  // 4: hard cut, no wipe
  { type: 'stage', bg: 'light', transition: 'cut', chars: [{ id: 'm', type: 'doctor_m', x: 540 }] },
];
const labels = ['مكالمة في الليل', 'نفس الهاتف في العيادة', 'انتقال عادي', 'الساعة تكبر', 'قطع مباشر'];
const sentences = scenes.map((s, i) => ({ role: `r${i}`, text: labels[i], keyword: '' }));
scenes.forEach((s, i) => { s.say = [`r${i}`]; });

const dir = `${ROOT}/compositions/_lab-matchcut`, W = `${ROOT}/factory/work/_lab-matchcut`, OUT = `${ROOT}/out/lab`;
[dir, W, OUT].forEach((d) => fs.mkdirSync(d, { recursive: true }));
const END = SEC * scenes.length, O = 0;
const wav = `${W}/silence.wav`;
run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(END), wav]);
const voice = { file: wav, D: END - 1.3, cuts: scenes.slice(1).map((_, i) => SEC * (i + 1)), spans: scenes.map((_, i) => ({ role: `r${i}`, start: i * SEC + 0.1, end: i * SEC + SEC - 0.5 })), reading: [] };
planTimes({ sentences, voice, O, scenes });
const comp = compose({ job: { id: 'matchcut-lab', lang: 'ar', scenes }, client, sentences, voice, O, scenes, reels: {}, dir, name: 'matchcut-lab' });
console.log(`composition ${dir} (${comp.END}s)`);

const hf = (args) => run('powershell', ['-NoProfile', '-File', `${ROOT}/scripts/hf.ps1`, ...args], { soft: true });
const clean = (x) => String(x || '').replace(/\x1b\[[0-9;]*m/g, '');
console.log('check:', (clean(hf(['check', dir]).stdout).match(/◇\s+Check (passed|failed)[^\n]*/) || ['?'])[0]);

function findChrome() {
  if (process.env.HF_CHROME && fs.existsSync(process.env.HF_CHROME)) return process.env.HF_CHROME;
  const base = path.join(require('os').homedir(), '.cache', 'hyperframes', 'chrome', 'chrome-headless-shell');
  if (fs.existsSync(base)) for (const v of fs.readdirSync(base).sort().reverse()) { const exe = path.join(base, v, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'); if (fs.existsSync(exe)) return exe; }
  throw new Error('headless Chrome not found; set HF_CHROME');
}

(async () => {
  const puppeteer = require(path.join(ROOT, 'node_modules', 'puppeteer-core'));
  fs.mkdirSync(`${ROOT}/.cache/tmp`, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(ROOT, '.cache', 'tmp', 'matchcut-'));
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, userDataDir: tmp, args: ['--no-sandbox', '--allow-file-access-from-files', '--mute-audio'] });
  let bad = 0;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.evaluateOnNewDocument(() => { window.__timelines = window.__timelines || {}; });
    page.on('pageerror', (e) => { bad++; console.error('page error:', e.message); });
    page.on('console', (m) => { if (['error', 'warn', 'warning'].includes(m.type())) console.log(`page ${m.type()}:`, m.text()); });
    await page.goto('file:///' + path.join(dir, 'index.html').split(path.sep).join('/'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    let ready = false;
    for (let i = 0; i < 240 && !ready; i++) { ready = await page.evaluate(() => !!(window.__timelines && window.__timelines.main)); if (!ready) await new Promise((r) => setTimeout(r, 250)); }
    if (!ready) throw new Error('timeline "main" never appeared');
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const mcs = await page.evaluate(() => window.__matchcuts || []);
    let n = 0;
    for (const m of mcs) {
      n++;
      if (m.error) { bad++; console.log(`cut ${n} @${m.at}s ERROR ${m.error}`); continue; }
      const box = (sel, t) => page.evaluate((sel, t) => {
        const tl = window.__timelines.main; tl.seek(t, false); (window.FRAME_HOOKS || []).forEach((f) => f());
        const r = document.querySelector(sel).getBoundingClientRect(); return { cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2), w: Math.round(r.width) };
      }, sel, t);
      const tA = +(m.at - 0.034).toFixed(3), tB = +(m.at + 0.001).toFixed(3);   // last frame before, first frame after (30 fps)
      const A = await box(m.from, tA), B = await box(m.to, tB);
      const miss = Math.round(Math.hypot(A.cx - B.cx, A.cy - B.cy)), size = (B.w / A.w).toFixed(2);
      console.log(`cut ${n} @${m.at}s mode=${m.mode} scale=${m.s} | before ${JSON.stringify(A)} after ${JSON.stringify(B)} | centre miss ${miss}px, size ratio ${size}`);
      if (miss > 40) bad++;
      const shots = [];
      for (const [k, t] of [['a', tA], ['b', tB], ['c', +(m.at + 0.5).toFixed(2)]]) {
        await page.evaluate((t) => { const tl = window.__timelines.main; tl.seek(t, false); (window.FRAME_HOOKS || []).forEach((f) => f()); }, t);
        const f = `${W}/mc${n}_${k}.png`; await page.screenshot({ path: f }); shots.push(f);
      }
      const out = `${OUT}/matchcut_${n}.jpg`;
      run('ffmpeg', ['-y', '-loglevel', 'error', ...shots.flatMap((f) => ['-i', f]), '-filter_complex', '[0][1][2]hstack=3,scale=1080:-1', '-q:v', '3', out]);
      console.log(`  frames (before | after | +0.5s): ${out}`);
    }
  } finally { await browser.close(); try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* Chrome may still hold the profile; it is in .cache/tmp */ } }
  if (process.argv.includes('--render')) {
    const r = hf(['render', '--output', `${OUT}/matchcut.mp4`, '--quality', 'draft', '--workers', '1', '--fps', '30', dir]);
    console.log('render', r.status === 0 ? `${OUT}/matchcut.mp4` : clean(r.stderr).slice(-400));
  }
  console.log(bad ? `FAIL (${bad} problems)` : 'OK');
  process.exit(bad ? 1 : 0);
})();
