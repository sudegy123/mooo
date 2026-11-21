// Pharmacy (Sudan) v2: owner feedback 2026-11-19 -> Sudanese voice-over (brain + agy dialect pass + Gemini TTS),
// the system shown on a phone (5 animated sample screens, HyperFrames), the iPhone switches replaced by glass cards
// orbiting the pharmacist's head (/effects orbit), more content. The picture follows the voice (AGENTS.md 5d).
// Gemini shots are used only where the pharmacist's mouth is closed (the voice is not his lip-synced speech).
// Usage: node scripts/build_pharmacy_v2.cjs <outDir>
const fs = require('fs'), path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'out/gemini-pharmacy-sudan/v5'));
const W = path.join(OUT, 'work'); fs.mkdirSync(W, { recursive: true });
const sh = (cmd, args, o = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 26, ...o });
const ff = (args) => sh('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const dur = (f) => +sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).trim();
const r2 = (x) => Math.round(x * 100) / 100;
const SRC = path.join(ROOT, 'scratch/gem_pharmacy/src_9x16.mp4');   // vertical crop of the Gemini take (pharmacist)
const VOICE = JSON.parse(fs.readFileSync(path.join(ROOT, 'scratch/gem_pharmacy/voice/voice.json'), 'utf8'));
const UI = JSON.parse(fs.readFileSync(path.join(ROOT, 'briefs/gemini-video/pharmacy-sudan-v2.ui.json'), 'utf8'));
const BR = JSON.parse(fs.readFileSync(path.join(ROOT, 'briefs/gemini-video/pharmacy-sudan.json'), 'utf8'));
const FPS = 24, WD = 1080, HT = 1920;

// ---------- 1) voice: +0.5 s pause after the hook (reading rule: 5 words need 2.45 s) ----------
const PAUSE = 0.5, P = VOICE.cuts[0];
const voiceF = path.join(W, 'voice_final.wav');
ff(['-i', VOICE.file, '-filter_complex', `[0:a]atrim=0:${P},asetpts=PTS-STARTPTS[a];[0:a]atrim=${P},asetpts=PTS-STARTPTS[b];anullsrc=r=48000:cl=mono,atrim=0:${PAUSE}[s];[a][s][b]concat=n=3:v=0:a=1[o]`, '-map', '[o]', '-ar', '48000', voiceF]);
const cuts = VOICE.cuts.map((c, i) => (i === 0 ? c + PAUSE : c + PAUSE));   // picture changes at the middle of each pause
cuts[0] = P + PAUSE;                                                     // hook keeps its whole pause
const spans = VOICE.spans.map((s, i) => ({ ...s, start: i === 0 ? s.start : s.start + PAUSE, end: i === 0 ? s.end : s.end + PAUSE }));
const VD = dur(voiceF), TAILPAD = 1.0, END = r2(VD + TAILPAD);
const win = (i) => [i === 0 ? 0 : r2(cuts[i - 1]), i === VOICE.sentences.length - 1 ? END : r2(cuts[i])];
const beats = VOICE.sentences.map((s, i) => ({ role: s.role, text: s.text, w: win(i) }));
const B = Object.fromEntries(beats.map((b) => [b.role, b]));
console.log('beats:', beats.map((b) => `${b.role} ${b.w[0]}-${b.w[1]}`).join(' | '), `| END ${END}`);

// ---------- 2) shared assets: fonts, blurred backgrounds ----------
const FONTS_CSS = fs.readFileSync(path.join(ROOT, '.cache/fonts_block.css'), 'utf8');
const copyFonts = (dir) => fs.cpSync(path.join(ROOT, 'compositions/dental-triage-15s/assets/fonts'), path.join(dir, 'assets/fonts'), { recursive: true });
const bgJpg = path.join(W, 'bg_blur.jpg');
ff(['-ss', '9.0', '-i', SRC, '-frames:v', '1', '-vf', `scale=${WD}:${HT},gblur=sigma=28,eq=brightness=-0.06:saturation=1.1`, '-q:v', '2', bgJpg]);
const bgVid = path.join(W, 'bg_blur.mp4');   // moving blurred pharmacy behind the phone
ff(['-ss', '9.7', '-t', '6', '-i', SRC, '-vf', `scale=${WD}:${HT},gblur=sigma=26,eq=brightness=-0.12:saturation=1.1,setpts=PTS*3.4,fps=${FPS}`, '-an', '-c:v', 'libx264', '-crf', '20', bgVid]);

// ---------- 3) HTML -> PNG with headless Chrome (glass cards for the orbit, CTA card) ----------
function findChrome() {
  const base = path.join(require('os').homedir(), '.cache', 'hyperframes', 'chrome', 'chrome-headless-shell');
  for (const v of fs.readdirSync(base).sort().reverse()) { const exe = path.join(base, v, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'); if (fs.existsSync(exe)) return exe; }
  throw new Error('headless Chrome not found');
}
const ICON = {
  alt: '<path d="M18 30a12 12 0 0 1 12-12h20a12 12 0 0 1 0 24H30a12 12 0 0 1-12-12z" fill="none" stroke="currentColor" stroke-width="6"/><path d="M40 18v24" stroke="currentColor" stroke-width="6"/><path d="M14 52h22M50 52h0M25 46l-11 6 11 6" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
  chronic: '<path d="M32 10c-10 0-17 8-17 18v10l-5 8h44l-5-8V28c0-10-7-18-17-18z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M26 52a6 6 0 0 0 12 0" fill="none" stroke="currentColor" stroke-width="6"/>',
  rx: '<rect x="12" y="18" width="40" height="32" rx="7" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="32" cy="34" r="8" fill="none" stroke="currentColor" stroke-width="6"/><path d="M24 18l4-6h8l4 6" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>',
  reorder: '<path d="M10 22l22-12 22 12v22L32 56 10 44z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M32 24v12" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="44" r="3.5" fill="currentColor"/>',
  loyalty: '<path d="M32 8l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>',
  profit: '<path d="M12 52h40" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><rect x="16" y="32" width="8" height="16" rx="2" fill="currentColor"/><rect x="28" y="22" width="8" height="26" rx="2" fill="currentColor"/><rect x="40" y="12" width="8" height="36" rx="2" fill="currentColor"/>',
};
const ICON_KEYS = ['alt', 'chronic', 'rx', 'reorder', 'loyalty', 'profit'];
const svg = (k, size, color) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="color:${color}">${ICON[k]}</svg>`;
// the page stays LTR with a fixed size: an RTL page put the content outside the screenshot clip (blank orbit cards,
// CTA card cut off on 2026-11-19); only the text blocks are RTL
const BASE_CSS = `${FONTS_CSS}\n*{margin:0;padding:0;box-sizing:border-box}html,body{background:transparent;font-family:"Cairo",sans-serif;direction:ltr;overflow:hidden;position:relative}.c,.cta,.brand,.t,.b{direction:rtl}`;

async function renderPNGs(jobs) {   // jobs: [{ html, w, h, out }]
  const puppeteer = require(path.join(ROOT, 'node_modules', 'puppeteer-core'));
  const tmp = fs.mkdtempSync(path.join(ROOT, '.cache', 'tmp', 'png-'));
  const dir = path.join(W, 'html'); fs.mkdirSync(dir, { recursive: true }); copyFonts(dir);
  fs.copyFileSync(bgJpg, path.join(dir, 'bg.jpg'));
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, userDataDir: tmp, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    for (const j of jobs) {
      const f = path.join(dir, path.basename(j.out).replace(/\.png$/, '.html'));
      fs.writeFileSync(f, `<!doctype html><html lang="ar"><head><meta charset="utf-8"><style>${BASE_CSS}\nhtml,body{width:${j.w}px;height:${j.h}px}\n${j.css || ''}</style></head><body>${j.html}</body></html>`);
      await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: 1 });
      await page.goto('file:///' + f.split(path.sep).join('/'), { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 150));
      await page.screenshot({ path: j.out, omitBackground: true, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    }
  } finally { await browser.close(); try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 3 }); } catch { /* chrome lock */ } }
}

// glass feature card (9:16): the pharmacy itself, frosted, with an icon and the feature name
const cardHTML = (title, icon) => `<div class="c"><div class="bg"></div><div class="glass"><div class="ic">${svg(icon, 150, '#ffffff')}</div><div class="t">${title}</div><div class="b">سوديجي</div></div></div>`;
const CARD_CSS = `.c{position:relative;width:540px;height:960px;overflow:hidden;border-radius:44px}
.bg{position:absolute;inset:-40px;background:url(bg.jpg) center/cover;filter:blur(6px) saturate(1.2)}
.glass{position:absolute;inset:26px;border-radius:36px;background:linear-gradient(160deg,rgba(255,255,255,.42),rgba(255,255,255,.14) 55%,rgba(15,118,110,.30));border:3px solid rgba(255,255,255,.7);box-shadow:inset 0 2px 0 rgba(255,255,255,.8),0 30px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px}
.ic{width:250px;height:250px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(150deg,#14b8a6,#0f766e);box-shadow:0 18px 40px rgba(15,118,110,.55),inset 0 3px 0 rgba(255,255,255,.45)}
.t{font-weight:900;font-size:92px;line-height:1.15;color:#ffffff;text-align:center;text-shadow:0 4px 18px rgba(0,0,0,.45);padding:0 30px}
.b{position:absolute;bottom:46px;font-weight:700;font-size:40px;color:rgba(255,255,255,.92);text-shadow:0 2px 10px rgba(0,0,0,.4)}`;

// ---------- 4) the system screens (HyperFrames composition) ----------
const S0 = B.alt.w[0], S1 = B.loyalty.w[1], SD = r2(S1 - S0);
const sysBeats = ['alt', 'chronic', 'rx', 'reorder', 'loyalty'].map((k, i) => ({ k, a: r2(B[k].w[0] - S0), b: r2(B[k].w[1] - S0), title: [UI.cards[0], UI.cards[1], UI.cards[2], UI.cards[3], UI.cards[4]][i], icon: ICON_KEYS[i] }));
function systemComposition(dir) {
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  copyFonts(dir);
  fs.copyFileSync(path.join(ROOT, 'compositions/dental-triage-15s/assets/gsap.min.js'), path.join(dir, 'assets/gsap.min.js'));
  fs.copyFileSync(bgVid, path.join(dir, 'assets/bg.mp4'));
  const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'compositions/andoria-explainer/package.json'), 'utf8')); p.name = 'pharmacy-sudan-system'; fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(p, null, 2));
  const u = UI;
  const row = (id, main, sub, pill, cls = '') => `<div class="row ${cls}" id="${id}"><div class="rt"><b>${main}</b>${sub ? `<span>${sub}</span>` : ''}</div>${pill ? `<i class="pill ${pill[1]}">${pill[0]}</i>` : ''}</div>`;
  const screens = {
    alt: `<div class="search" id="alt_s"><span class="q">${u.alt.search}</span><i class="mag"></i></div>
      ${row('alt_r0', u.alt.search, '', [u.alt.missing, 'red'])}
      <div class="sec" id="alt_sec">${u.alt.section}</div>
      ${row('alt_r1', u.alt.item1, u.alt.section.replace(/^بدائل\s*/, ''), [u.alt.available, 'green'])}
      ${row('alt_r2', u.alt.item2, u.alt.section.replace(/^بدائل\s*/, ''), [u.alt.available, 'green'])}
      <div class="note" id="alt_note">${u.alt.note}</div><div class="tap" id="alt_tap"></div>`,
    chronic: u.chronic.rows.map((r, i) => row(`ch_r${i}`, r.who, r.what, [r.when, i === 2 ? 'amber' : 'teal'])).join('') + `<div class="btn" id="ch_btn">${u.chronic.button}</div><div class="tap" id="ch_tap"></div>`,
    rx: `<div class="bubble" id="rx_b"><div class="paper"><div class="rxm">℞</div><i></i><i></i><i class="s"></i><i></i></div><span>${u.rx.incoming}</span></div>
      ${u.rx.items.map((t, i) => `<div class="chk" id="rx_i${i}"><i class="box"></i><b>${t}</b></div>`).join('')}
      <div class="ready" id="rx_ok">${u.rx.ready}</div>`,
    reorder: `<div class="alert" id="ro_a"><b>${u.reorder.alert}</b><span>${u.reorder.item}</span><div class="bar"><i id="ro_bar"></i></div></div>
      <div class="sec" id="ro_sec">${u.reorder.title}</div>
      ${u.reorder.list.map((t, i) => row(`ro_r${i}`, t, '', null)).join('')}
      <div class="btn" id="ro_btn">${u.reorder.button}</div><div class="tap" id="ro_tap"></div>`,
    loyalty: `<div class="cust" id="ly_c"><div class="av">★</div><div><b>${u.loyalty.customer}</b><span>${u.loyalty.points}</span></div></div>
      <div class="pbar"><i id="ly_bar"></i></div>
      <div class="stars" id="ly_st">★ ★ ★</div>
      <div class="reward" id="ly_rw">${u.loyalty.reward}</div>`,
  };
  const titles = { alt: u.alt.title, chronic: u.chronic.title, rx: u.rx.title, reorder: u.reorder.title, loyalty: u.loyalty.title };
  const css = `${FONTS_CSS}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${WD}px;height:${HT}px;overflow:hidden;background:#0b1f1d;font-family:"Cairo",sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden;direction:rtl}
#bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:radial-gradient(900px 1200px at 50% 45%,rgba(15,118,110,.18),rgba(5,20,18,.55))}
.gl{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.35),rgba(255,255,255,.05));border:2px solid rgba(255,255,255,.25)}
.tcard{position:absolute;left:150px;right:150px;top:150px;height:170px;border-radius:44px;display:flex;align-items:center;justify-content:center;gap:28px;background:linear-gradient(160deg,rgba(255,255,255,.34),rgba(255,255,255,.12));border:2px solid rgba(255,255,255,.6);box-shadow:inset 0 2px 0 rgba(255,255,255,.7),0 24px 60px rgba(0,0,0,.35);backdrop-filter:blur(18px);opacity:0}
.tcard b{font-size:76px;font-weight:900;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,.35)}
.tcard .ic{width:110px;height:110px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(150deg,#14b8a6,#0f766e);box-shadow:0 10px 26px rgba(15,118,110,.6)}
#phone{position:absolute;left:200px;top:370px;width:680px;height:1180px;border-radius:84px;background:#0f172a;padding:22px;box-shadow:0 50px 110px rgba(0,0,0,.55),inset 0 0 0 3px #334155}
#scr{position:relative;width:100%;height:100%;border-radius:64px;overflow:hidden;background:#f1f5f9}
.notch{position:absolute;top:16px;left:50%;width:170px;height:38px;margin-left:-85px;border-radius:20px;background:#0f172a;z-index:9}
.app{position:absolute;inset:0;padding-top:78px}
.hdr{height:150px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:24px 40px;display:flex;flex-direction:column;justify-content:center}
.hdr small{font-size:30px;font-weight:600;opacity:.85}.hdr b{font-size:48px;font-weight:900}
.pane{position:absolute;left:0;right:0;top:228px;bottom:0;padding:30px 30px;opacity:0}
.search{height:96px;border-radius:30px;background:#fff;border:3px solid #cbd5e1;display:flex;align-items:center;justify-content:space-between;padding:0 30px;font-size:42px;font-weight:700;color:#0f172a;margin-bottom:22px}
.search .q{clip-path:inset(0 0 0 100%)}
.mag{width:38px;height:38px;border-radius:50%;border:6px solid #64748b;position:relative}
.row{display:flex;align-items:center;justify-content:space-between;background:#fff;border-radius:28px;padding:22px 26px;margin-bottom:18px;box-shadow:0 6px 18px rgba(15,23,42,.07);opacity:0}
.rt{display:flex;flex-direction:column}.rt b{font-size:40px;font-weight:800;color:#0f172a}.rt span{font-size:28px;font-weight:600;color:#64748b}
.pill{font-style:normal;font-size:30px;font-weight:800;padding:8px 22px;border-radius:999px}
.pill.red{background:#fee2e2;color:#b91c1c}.pill.green{background:#dcfce7;color:#15803d}.pill.teal{background:#ccfbf1;color:#0f766e}.pill.amber{background:#fef3c7;color:#b45309}
.sec{font-size:32px;font-weight:800;color:#0f766e;margin:16px 6px 14px;opacity:0}
.note{position:absolute;left:30px;right:30px;bottom:44px;text-align:center;background:#0f766e;color:#fff;font-size:32px;font-weight:800;border-radius:24px;padding:18px;opacity:0}
.btn{position:absolute;left:30px;right:30px;bottom:44px;height:104px;border-radius:30px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:42px;font-weight:900;display:grid;place-items:center;opacity:0}
.tap{position:absolute;width:90px;height:90px;border-radius:50%;background:rgba(15,118,110,.25);border:4px solid rgba(15,118,110,.6);opacity:0}
.bubble{background:#fff;border-radius:30px;padding:20px;display:flex;align-items:center;gap:22px;box-shadow:0 6px 18px rgba(15,23,42,.08);margin-bottom:22px;opacity:0}
.bubble span{font-size:36px;font-weight:800;color:#0f172a}
.paper{width:150px;height:190px;border-radius:14px;background:#fffdf7;border:2px solid #e2e8f0;padding:16px 14px;display:flex;flex-direction:column;gap:12px;transform:rotate(-4deg)}
.paper .rxm{font-size:40px;font-weight:900;color:#0f766e;line-height:1}.paper i{display:block;height:8px;border-radius:4px;background:#cbd5e1}.paper i.s{width:60%}
.chk{display:flex;align-items:center;gap:22px;background:#fff;border-radius:26px;padding:22px 26px;margin-bottom:16px;opacity:0}
.chk b{font-size:40px;font-weight:800;color:#0f172a}.box{width:52px;height:52px;border-radius:14px;border:5px solid #94a3b8;position:relative}
.box.on{background:#0f766e;border-color:#0f766e}.box.on::after{content:"";position:absolute;left:14px;top:5px;width:14px;height:26px;border:solid #fff;border-width:0 6px 6px 0;transform:rotate(45deg)}
.ready{position:absolute;left:30px;right:30px;bottom:44px;height:104px;border-radius:30px;background:#dcfce7;color:#15803d;font-size:42px;font-weight:900;display:grid;place-items:center;opacity:0}
.alert{background:#fff7ed;border:3px solid #fdba74;border-radius:30px;padding:24px 28px;margin-bottom:18px;opacity:0}
.alert b{display:block;font-size:40px;font-weight:900;color:#c2410c}.alert span{font-size:34px;font-weight:700;color:#7c2d12}
.bar{height:22px;border-radius:11px;background:#fed7aa;margin-top:16px;overflow:hidden}.bar i{display:block;height:100%;width:100%;background:#f97316;border-radius:11px}
.cust{display:flex;align-items:center;gap:24px;background:#fff;border-radius:30px;padding:26px;opacity:0}
.cust .av{width:110px;height:110px;border-radius:50%;background:linear-gradient(150deg,#14b8a6,#0f766e);color:#fff;font-size:60px;display:grid;place-items:center}
.cust b{display:block;font-size:44px;font-weight:900;color:#0f172a;direction:ltr;text-align:right}.cust span{font-size:32px;font-weight:700;color:#64748b}
.pbar{height:40px;border-radius:20px;background:#e2e8f0;margin:34px 6px;overflow:hidden}.pbar i{display:block;height:100%;width:0;border-radius:20px;background:linear-gradient(90deg,#f59e0b,#fbbf24)}
.stars{text-align:center;font-size:90px;color:#f59e0b;opacity:0;letter-spacing:12px}
.reward{margin:30px 40px 0;text-align:center;background:#0f766e;color:#fff;font-size:44px;font-weight:900;border-radius:30px;padding:26px;opacity:0}`;
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${WD}, height=${HT}"/><title>pharmacy-system</title><script src="assets/gsap.min.js"></script><style>${css}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-width="${WD}" data-height="${HT}" data-duration="${SD}">
<video id="bg" src="assets/bg.mp4" muted playsinline data-start="0" data-duration="${SD}" data-track-index="1"></video><div class="shade"></div>
<div class="gl" style="width:300px;height:300px;left:-80px;top:1450px" id="g1" data-layout-allow-overflow="true"></div><div class="gl" style="width:220px;height:220px;right:-60px;top:420px" id="g2" data-layout-allow-overflow="true"></div>
${sysBeats.map((s) => `<div class="tcard" id="tc_${s.k}" data-layout-allow-overlap="true"><div class="ic">${svg(s.icon, 70, '#fff')}</div><b>${s.title}</b></div>`).join('')}
<div id="phone"><div id="scr"><div class="notch"></div><div class="app"><div class="hdr"><small>سوديجي · صيدلية</small><b id="hdr_t">${titles.alt}</b></div>
${sysBeats.map((s) => `<div class="pane" id="p_${s.k}" data-layout-allow-overlap="true">${screens[s.k]}</div>`).join('\n')}
</div></div></div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
const B = ${JSON.stringify(sysBeats)}, T = ${JSON.stringify(titles)};
tl.set('#bg', { opacity: 1 }, 0);
tl.fromTo('#phone', { y: 140, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out", immediateRender: true }, 0);
tl.to('#g1', { y: -260, duration: ${SD}, ease: "none" }, 0); tl.to('#g2', { y: 200, duration: ${SD}, ease: "none" }, 0);
// never still (freezedetect found 0.7-2.4 s still tails after each screen's animation): the phone sways, the room zooms
tl.fromTo('#bg', { scale: 1 }, { scale: 1.12, duration: ${SD}, ease: "none", immediateRender: true }, 0);
tl.fromTo('#phone', { rotation: -1.1 }, { rotation: 1.1, duration: 1.9, ease: "sine.inOut", yoyo: true, repeat: ${Math.ceil(SD / 1.9)}, immediateRender: true }, 0.5);
tl.fromTo('.tcard b', { scale: 1 }, { scale: 1.04, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: ${Math.ceil(SD / 1.2)}, immediateRender: false }, 0.6);
B.forEach((s, i) => {
  const a = s.a + (i === 0 ? 0.15 : 0);
  tl.fromTo('#tc_' + s.k, { opacity: 0, y: -30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)", immediateRender: false }, a);
  if (i < B.length - 1) tl.to('#tc_' + s.k, { opacity: 0, y: -20, duration: 0.2 }, s.b - 0.2);
  tl.fromTo('#p_' + s.k, { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", immediateRender: false }, a);
  if (i < B.length - 1) tl.to('#p_' + s.k, { opacity: 0, x: 120, duration: 0.25, ease: "power2.in" }, s.b - 0.25);
  tl.set('#hdr_t', { textContent: T[s.k] }, a);   // a set (not a call) so seeking backwards restores the title
});
const at = (k, d) => B.find((x) => x.k === k).a + d;
const pop = (sel, t) => tl.fromTo(sel, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false }, t);
const tap = (sel, x, y, t) => { tl.set(sel, { left: x, top: y }, t); tl.fromTo(sel, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.6, duration: 0.5, ease: "power2.out", immediateRender: false }, t); };
// alternatives: type the medicine, not available, two alternatives with the same active ingredient, the pharmacist decides
tl.fromTo('#alt_s .q', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.7, ease: "none", immediateRender: false }, at('alt', 0.35));
pop('#alt_r0', at('alt', 1.0)); pop('#alt_sec', at('alt', 1.5)); pop('#alt_r1', at('alt', 1.75)); pop('#alt_r2', at('alt', 2.0));
pop('#alt_note', at('alt', 2.5)); tap('#alt_tap', 420, 420, at('alt', 2.3));
tl.fromTo('#alt_r1', { boxShadow: '0 6px 18px rgba(15,23,42,.07)' }, { boxShadow: '0 0 0 5px #14b8a6', duration: 0.25, immediateRender: false }, at('alt', 2.35));
// chronic refills: three customers slide in, prepare the orders
[0, 1, 2].forEach((i) => pop('#ch_r' + i, at('chronic', 0.45 + i * 0.35)));
pop('#ch_btn', at('chronic', 1.7)); tap('#ch_tap', 280, 830, at('chronic', 2.3));
tl.to('#ch_btn', { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1 }, at('chronic', 2.3));
// prescription by photo: the photo arrives, items tick, ready before he comes
pop('#rx_b', at('rx', 0.4)); [0, 1, 2].forEach((i) => { pop('#rx_i' + i, at('rx', 1.0 + i * 0.35)); tl.set('#rx_i' + i + ' .box', { className: 'box on' }, at('rx', 1.35 + i * 0.35)); });
pop('#rx_ok', at('rx', 2.4));
// reorder: alert, stock draining, ready supplier list
pop('#ro_a', at('reorder', 0.4)); tl.fromTo('#ro_bar', { width: '100%' }, { width: '12%', duration: 1.4, ease: "power1.in", immediateRender: false }, at('reorder', 0.6));
pop('#ro_sec', at('reorder', 1.4)); [0, 1, 2].forEach((i) => pop('#ro_r' + i, at('reorder', 1.6 + i * 0.3)));
pop('#ro_btn', at('reorder', 2.5)); tap('#ro_tap', 280, 830, at('reorder', 3.0));
// loyalty: the customer, points fill, a discount on the next visit
pop('#ly_c', at('loyalty', 0.35)); tl.fromTo('#ly_bar', { width: '0%' }, { width: '78%', duration: 1.1, ease: "power2.out", immediateRender: false }, at('loyalty', 0.7));
tl.fromTo('#ly_st', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, at('loyalty', 1.5));
pop('#ly_rw', at('loyalty', 1.9));
window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; tl.seek(0);
</script></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

(async () => {
  // glass cards for the orbit + CTA card
  const cardsDir = path.join(W, 'cards'); fs.rmSync(cardsDir, { recursive: true, force: true }); fs.mkdirSync(cardsDir, { recursive: true });
  const jobs = UI.cards.map((t, i) => ({ html: cardHTML(t, ICON_KEYS[i]), css: CARD_CSS, w: 540, h: 960, out: path.join(cardsDir, `c${i}.png`) }));
  const ctaPng = path.join(W, 'cta.png');
  const ctaText = B.cta.text.replace(/\.$/, '');
  jobs.push({ w: WD, h: HT, out: ctaPng, css: `.cta{position:absolute;left:90px;right:90px;top:820px;border-radius:52px;padding:56px 50px 50px;text-align:center;background:linear-gradient(160deg,rgba(255,255,255,.40),rgba(255,255,255,.14) 60%,rgba(15,118,110,.35));border:3px solid rgba(255,255,255,.75);box-shadow:inset 0 3px 0 rgba(255,255,255,.8),0 40px 90px rgba(0,0,0,.45)}
.cta b{display:block;font-size:78px;font-weight:900;line-height:1.35;color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.45)}.cta .k{display:inline-block;margin-top:28px;background:#0f766e;color:#fff;font-size:64px;font-weight:900;border-radius:999px;padding:10px 56px;box-shadow:0 14px 34px rgba(15,118,110,.6)}
.brand{position:absolute;left:0;right:0;top:1390px;text-align:center;font-size:48px;font-weight:800;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.6)}`,
    html: `<div class="cta"><b>${ctaText}</b><span class="k">نظام</span></div><div class="brand">Sudegy | سوديجي</div>` });
  await renderPNGs(jobs);
  console.log('cards + cta rendered');

  // system screens: compose, check, render (HyperFrames, 1 worker)
  const CD = path.join(ROOT, 'compositions/pharmacy-sudan-system'); systemComposition(CD);
  const hf = (args) => spawnSync('powershell', ['-NoProfile', '-File', path.join(ROOT, 'scripts/hf.ps1'), ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const clean = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');
  const ck = clean(hf(['check', CD]).stdout); console.log('hf check:', (ck.match(/◇\s+Check (passed|failed)[^\n]*/) || ['?'])[0]);
  const sysMp4 = path.join(W, 'system.mp4');
  if (!process.argv.includes('--reuse-system') || !fs.existsSync(sysMp4)) {
    const t0 = Date.now(); const r = hf(['render', '--output', sysMp4, '--quality', 'standard', '--workers', '1', '--fps', String(FPS), CD]);
    if (!fs.existsSync(sysMp4)) { fs.writeFileSync(path.join(W, 'render.log'), clean(r.stdout + r.stderr)); throw new Error('system render failed, see work/render.log'); }
    console.log(`system rendered in ${Math.round((Date.now() - t0) / 1000)} s`);
  }

  // ---------- 5) picture: Gemini shots (mouth closed) + system screens, timed to the voice ----------
  const vf = `scale=${WD}:${HT}:flags=lanczos,setsar=1,fps=${FPS},format=yuv420p`;
  const seg = (from, to, wlen) => { const sp = (to - from) / wlen; return `trim=${from}:${to},setpts=(PTS-STARTPTS)/${sp.toFixed(4)},${vf}`; };
  const L = (b) => r2(b.w[1] - b.w[0]);
  const ctaA = r2(L(B.cta) * 0.55), ctaB = r2(L(B.cta) - ctaA);
  const parts = [
    `[0:v]${seg(4.0, 6.5, L(B.hook))}[v0]`,          // searching the shelves, the customer leaves
    `[0:v]${seg(6.5, 9.6, L(B.pain))}[v1]`,          // alone, the sale gone
    `[0:v]${seg(9.7, 12.6, L(B.turn))}[v2]`,         // the tablet: the system
    `[1:v]trim=0:${SD},setpts=PTS-STARTPTS,${vf}[v3]`,   // five system screens
    // closing shots get a slow push-in, so the slowed footage under the CTA never looks frozen
    `[0:v]${seg(12.6, 14.55, ctaA)},zoompan=z='min(1+0.0016*on,1.2)':x='iw/2-(iw/zoom/2)':y='ih/3-(ih/zoom/3)':d=1:s=${WD}x${HT}:fps=${FPS}[v4]`,   // the customer gets his medicine
    `[0:v]${seg(18.4, 20.0, ctaB)},zoompan=z='min(1.06+0.0016*on,1.25)':x='iw/2-(iw/zoom/2)':y='ih/3-(ih/zoom/3)':d=1:s=${WD}x${HT}:fps=${FPS}[v5]`,   // the pharmacist smiles
    `[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[v]`,
  ];
  const base = path.join(W, 'base.mp4');
  ff(['-i', SRC, '-i', sysMp4, '-filter_complex', parts.join(';'), '-map', '[v]', '-t', String(END), '-c:v', 'libx264', '-crf', '16', '-an', base]);

  // ---------- 6) sound: the voice, a whoosh on each picture change, an oud bed under it ----------
  const changes = [B.pain.w[0], B.turn.w[0], B.alt.w[0], B.cta.w[0]];
  const sfx = path.join(ROOT, 'factory/sfx/whoosh-short.mp3');
  const aparts = changes.map((t, i) => `[${i + 1}:a]adelay=${Math.round(Math.max(0, t - 0.12) * 1000)}:all=1,volume=0.35[s${i}]`);
  const av = path.join(W, 'av.mkv');
  ff(['-i', base, ...changes.flatMap(() => ['-i', sfx]), '-i', voiceF, '-filter_complex', `${aparts.join(';')};[${changes.length + 1}:a]apad=whole_dur=${END}[vo];[vo]${changes.map((_, i) => `[s${i}]`).join('')}amix=inputs=${changes.length + 1}:duration=first:normalize=0[a]`, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'pcm_s16le', '-t', String(END), av]);
  const Fin = require(path.join(ROOT, 'factory/lib/finish.cjs'));
  const mixed = Fin.mixMusic(av, 'factory/music/warm_oud_pop.wav', path.join(W, 'mix.mp4'), { volume: 0.14 });

  // ---------- 7) effects: the sale glows behind his head (pain), glass cards orbit his head (turn) ----------
  const effects = [
    { fx: 'spotlight', start: r2(B.pain.w[0]), end: r2(B.pain.w[1] - 0.04), text: BR.overlay.behind },
    { fx: 'orbit', start: r2(B.turn.w[0] + 0.1), end: r2(B.turn.w[1] - 0.04), images: cardsDir, count: 6, size: 0.24, speed: 1.4 },
  ];
  const fxOut = path.join(W, 'fx.mp4');
  require(path.join(ROOT, 'factory/tools/effects.cjs')).applyEffects(mixed, effects, fxOut);

  // ---------- 8) CTA glass card + captions (hook, pain, turn; the screens carry their own titles) ----------
  const RLM = '‏', ts = (x) => { const h = Math.floor(x / 3600), m = Math.floor(x / 60) % 60, s = (x % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${s}`; };
  const ass = path.join(W, 'captions.ass');
  const capRoles = ['hook', 'pain', 'turn'];
  fs.writeFileSync(ass, `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Cap,Segoe UI,66,&H00FFFFFF,&H00FFFFFF,&H64000000,&H8C000000,1,0,0,0,100,100,0,0,3,18,0,2,90,90,500,178\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`
    + capRoles.map((k) => `Dialogue: 0,${ts(B[k].w[0] + (k === 'hook' ? 0 : 0.02))},${ts(B[k].w[1] - 0.04)},Cap,,0,0,0,,${RLM}${B[k].text.replace(/\.$/, '')}`).join('\n') + '\n');
  const assArg = ass.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '$1\\:');
  const c0 = r2(B.cta.w[0] + 0.15);
  const burned = path.join(W, 'burned.mkv');
  ff(['-i', fxOut, '-loop', '1', '-t', String(END), '-i', ctaPng, '-filter_complex',
    `[0:v]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.42:t=fill:enable='gte(t,${c0})',ass='${assArg}'[b];[1:v]format=rgba,fade=t=in:st=${c0}:d=0.3:alpha=1[c];[b][c]overlay=0:0:enable='gte(t,${c0})',format=yuv420p[v]`,
    '-map', '[v]', '-map', '0:a', '-t', String(END), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-c:a', 'pcm_s16le', burned]);

  // ---------- 9) loudness (two-pass; dynaudnorm first if the crest blocks it) ----------
  const final = path.join(OUT, 'ad_9x16.mp4');
  let Lr = Fin.loudnorm(burned, final);
  if (Lr.I < -15) { const comp = path.join(W, 'burned_comp.mkv'); ff(['-i', burned, '-c:v', 'copy', '-af', 'dynaudnorm=f=150:g=15', '-c:a', 'pcm_s16le', comp]); Lr = Fin.loudnorm(comp, final); }
  // still short: add the missing gain with a limiter (peaks held at -2 dBFS)
  if (Lr.I < -15) {
    const tmpA = path.join(W, 'final_gain.mp4'); fs.copyFileSync(final, tmpA);
    ff(['-i', tmpA, '-c:v', 'copy', '-af', `volume=${(-14 - Lr.I).toFixed(2)}dB,alimiter=limit=0.79:attack=3:release=80:level=false`, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', final]);
    const log = spawnSync('ffmpeg', ['-hide_banner', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || '';
    const mi = log.match(/I:\s+(-?[\d.]+) LUFS/g), mp = log.match(/Peak:\s+(-?[\d.]+) dBFS/g);   // last match = the summary
    if (mi) Lr = { ...Lr, I: +mi[mi.length - 1].match(/-?[\d.]+/)[0] };
    if (mp) Lr = { ...Lr, P: +mp[mp.length - 1].match(/-?[\d.]+/)[0] };
  }
  console.log(`loudness ${Lr.I} LUFS, peak ${Lr.P}`);

  // ---------- 10) check frames ----------
  const at = [0.05, B.hook.w[1] - 0.3, (B.pain.w[0] + B.pain.w[1]) / 2, B.turn.w[0] + 0.6, (B.turn.w[0] + B.turn.w[1]) / 2 + 0.5, ...['alt', 'chronic', 'rx', 'reorder', 'loyalty'].map((k) => B[k].w[1] - 0.5), B.cta.w[0] + 1.2, END - 0.4].map((x) => r2(x));
  const shots = at.map((x, i) => { const f = path.join(W, `chk${i}.png`); ff(['-ss', String(x), '-i', final, '-frames:v', '1', '-vf', 'scale=270:-1', f]); return f; });
  ff([...shots.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=${shots.length}`, path.join(OUT, 'check.jpg')]);
  shots.forEach((f) => fs.unlinkSync(f));
  fs.writeFileSync(path.join(OUT, 'build.json'), JSON.stringify({ beats, END, effects, checkAt: at, loudness: Lr }, null, 1));
  console.log(`done: ${final} (${END} s); check frames at ${at.join(', ')}`);
})().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
