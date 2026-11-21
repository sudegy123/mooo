// Pharmacy system tour (owner request 2026-11-19): real screen recordings of the live demo, timed to ONE Sudanese voice take.
// 1. voice fit: longer pauses only at sentence boundaries (hook +0.5 s, chapter breaths, reading rule 0.35 s/word + 0.7 s)
// 2. each chapter clip is re-timed piecewise so its key moment lands on the words that describe it (anchors), then padded
// 3. HyperFrames composition: phone with the clips, zooms on the recorded focus boxes, chapter header + progress,
//    karaoke captions, part cards, WhatsApp bubbles with the system's prepared text, glass CTA
// 4. render (1 worker) → audio mix (voice, music bed, whooshes, taps) → two-pass loudnorm -14 LUFS → checks
// Usage: node scripts/build_pharmacy_tour.cjs [--no-render] [--ver v1]
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const R = (...p) => path.join(ROOT, ...p);
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const VER = arg('--ver', 'v1');
const TAG = arg('--tag', '');   // '' = the Sudanese tour; 'sa' = the Saudi version (own narration, voice, work and composition folders)
const TSUF = TAG ? '_' + TAG : '';
const N = JSON.parse(fs.readFileSync(R(`briefs/pharmacy-tour/narration${TSUF}.json`), 'utf8'));
const V = JSON.parse(fs.readFileSync(R(`out/pharmacy-tour/voice${TSUF}/voice.json`), 'utf8'));
const REC = R('out/pharmacy-tour/rec'), W = R(`out/pharmacy-tour/work${TSUF}`), CD = R(`compositions/pharmacy-tour${TSUF}`), OUT = R(`out/pharmacy-tour${TSUF}`, VER);
const DEMO = 'G:/sudegy-pharmacy/cloudflare-upload/assets';
const FPS = 30, TAIL = 2.8;
for (const d of [W, CD, path.join(CD, 'assets'), path.join(CD, 'assets/fonts'), OUT]) fs.mkdirSync(d, { recursive: true });
const ff = (args, opt = {}) => { const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], { encoding: 'utf8', maxBuffer: 1 << 26, ...opt }); if (r.status) throw new Error('ffmpeg: ' + String(r.stderr).slice(-1200)); return r; };
const probe = (f) => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout.trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r3 = (x) => +(+x).toFixed(3);

// ---------- 1. voice fit ----------
const S = N.sentences.map((s, i) => ({ beat: s.beat, text: s.text.trim(), words: V.aligned[i].map(([a, b]) => [a, b]) }));
if (S.length !== V.aligned.length || V.sentences.some((v, i) => v.role !== S[i].beat)) throw new Error('voice.json does not match narration.json');
const nw = (t) => t.split(/\s+/).filter(Boolean).length;
const CH_START = new Set(['intro', 'alt_p', 'bankak_p', 'staff_p', 'expiry_p', 'reorder_p', 'power_p', 'partb', 'chronic_s', 'loyalty_s', 'owner_s', 'cta']);
// whisper word times run end to end (no pauses), so the real pauses come from silencedetect; every cut lies in silence
const SIL = (() => { const e = spawnSync('ffmpeg', ['-v', 'info', '-i', R(`out/pharmacy-tour/voice${TSUF}/voice.wav`), '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; const out = []; let s0 = null; for (const l of e.split('\n')) { let m = l.match(/silence_start: ([\d.]+)/); if (m) s0 = +m[1]; m = l.match(/silence_end: ([\d.]+)/); if (m && s0 != null) { out.push([s0, +m[1]]); s0 = null; } } return out; })();
const cut = [], extra = [], bound = [];
for (let i = 0; i < S.length - 1; i++) {
  const b = (S[i].words[S[i].words.length - 1][1] + S[i + 1].words[0][0]) / 2;
  const dist = (q) => (b < q[0] ? q[0] - b : b > q[1] ? b - q[1] : 0);
  const best = SIL.reduce((x, q) => (!x || dist(q) < dist(x) ? q : x), null);
  bound.push(best && dist(best) < 0.6 ? best : [b, b]);
}
const sStart = (i) => (i === 0 ? S[0].words[0][0] : bound[i - 1][1]), sEnd = (i) => (i < bound.length ? bound[i][0] : S[i].words[S[i].words.length - 1][1]);
for (let i = 0; i < S.length - 1; i++) {
  const gap = bound[i][1] - bound[i][0];
  let e = i === 0 ? 0.5 : 0;
  if (CH_START.has(S[i + 1].beat)) e = Math.max(e, 0.8 - gap);
  const shown = sStart(i + 1) - sStart(i) + e, need = 0.35 * nw(S[i].text) + 0.7;
  if (shown < need) e += need - shown + 0.05;
  cut.push((bound[i][0] + bound[i][1]) / 2); extra.push(r3(Math.max(0, e)));
}
const shift = (t) => { let d = 0; cut.forEach((c, j) => { if (c < t) d += extra[j]; }); return t + d; };
S.forEach((s, i) => {
  // words: whisper times squeezed into the real speech span of the sentence, then shifted
  const a0 = sStart(i), a1 = sEnd(i), w0 = s.words[0][0], w1 = s.words[s.words.length - 1][1];
  const sc = (t) => a0 + ((t - w0) / Math.max(0.1, w1 - w0)) * (a1 - a0);
  s.words = s.words.map(([a, b]) => [r3(shift(sc(a))), r3(shift(sc(b)))]); s.start = r3(shift(a0)); s.end = r3(shift(a1));
});
const VOICE = path.join(W, 'voice_fit.wav');
{
  const D = probe(R(`out/pharmacy-tour/voice${TSUF}/voice.wav`)); const pts = [0, ...cut, D];
  let fc = '', cat = '';
  for (let k = 0; k < pts.length - 1; k++) { fc += `[0:a]atrim=start=${pts[k].toFixed(4)}:end=${pts[k + 1].toFixed(4)},asetpts=PTS-STARTPTS[a${k}];`; cat += `[a${k}]`; if (k < extra.length && extra[k] > 0) { fc += `aevalsrc=0:d=${extra[k]}:s=48000[z${k}];`; cat += `[z${k}]`; } }
  const n = (cat.match(/\[/g) || []).length;
  ff(['-i', R(`out/pharmacy-tour/voice${TSUF}/voice.wav`), '-filter_complex', fc + `${cat}concat=n=${n}:v=0:a=1[o]`, '-map', '[o]', '-ar', '48000', '-ac', '1', VOICE]);
}
const VEND = probe(VOICE), DUR = r3(VEND + TAIL);
const byBeat = Object.fromEntries(S.map((s) => [s.beat, s]));
const wordT = (beat, k) => byBeat[beat].words[Math.min(k, byBeat[beat].words.length - 1)][0];
console.log(`voice fit: ${VEND.toFixed(2)} s (+${extra.reduce((a, b) => a + b, 0).toFixed(2)} s of pauses), video ${DUR} s`);

// ---------- 2. chapters and re-timed clips ----------
const CH = [
  { id: 'hook', first: 'hook' },
  { id: 'intro', first: 'intro', clip: 'intro', anchors: [['more', 'intro', 6, -0.45]] },
  { id: 'alt', first: 'alt_p', clip: 'alt', n: 1, anchors: [['missing', 'alt_s', 0, -0.3], ['open invoice', 'inter_s', 3, -0.3]] },
  { id: 'bankak', first: 'bankak_p', clip: 'bankak', n: 2, anchors: [['type', 'bankak_s', 0, -0.1], ['complete sale', 'bankak_s', 5, -0.2]] },
  { id: 'staff', first: 'staff_p', clip: 'staff', n: 3, anchors: [['flags', 'staff_s', 0, 0.1], ['permissions', 'staff_s', TAG ? 7 : 8, -0.35]] },
  { id: 'expiry', first: 'expiry_p', clip: 'expiry', n: 4, anchors: [['fridge', 'expiry_s', TAG ? 8 : 6, -0.4]] },
  { id: 'reorder', first: 'reorder_p', clip: 'reorder', n: 5, anchors: [['more', 'reorder_s', 6, -1.0]] },
  { id: 'power', first: 'power_p', clip: 'power', n: 6, anchors: [['go offline', 'power_p', 0, 0.1], ['sell', 'power_s', 0, -0.3], ['complete', 'power_s', 3, -0.3], ['back online', 'power_s', TAG ? 5 : 6, -0.4]] },
  { id: 'rx', first: 'partb', clip: 'rx', n: 7, anchors: [['photo', 'rx_s', 1, -0.3], ['ready', 'rx_s', 5, -0.1]] },
  { id: 'chronic', first: 'chronic_s', clip: 'chronic', n: 8, anchors: [['remind', 'chronic_s', 6, -0.3]] },
  { id: 'loyalty', first: 'loyalty_s', clip: 'loyalty', n: 9, anchors: [] },
  { id: 'owner', first: 'owner_s', clip: 'owner', n: 10, anchors: [['day summary', 'owner_s', 8, -0.3]] },
  { id: 'cta', first: 'cta', clip: 'cta', anchors: [['type', 'cta', 3, -0.25]] }
];
const TITLE = { alt: N.titles.alt, bankak: N.titles.bankak, staff: N.titles.staff, expiry: N.titles.expiry, reorder: N.titles.reorder, power: N.titles.power, rx: N.titles.rx, chronic: N.titles.chronic, loyalty: N.titles.loyalty, owner: N.titles.owner };
const PART = { alt: 'a', bankak: 'a', staff: 'a', expiry: 'a', reorder: 'a', power: 'a', rx: 'b', chronic: 'b', loyalty: 'b', owner: 'c' };
CH.forEach((c, i) => {
  const s = byBeat[c.first];
  if (i === 0) c.t0 = 0; else { const prevEnd = S[S.indexOf(s) - 1].end; c.t0 = r3(Math.max(prevEnd + 0.05, s.start - Math.min(0.35, (s.start - prevEnd) / 2))); }
});
CH.forEach((c, i) => { c.t1 = i + 1 < CH.length ? CH[i + 1].t0 : DUR; c.dur = r3(c.t1 - c.t0); });
const clipMeta = (id) => JSON.parse(fs.readFileSync(path.join(REC, id + '.json'), 'utf8'));
const evT = (m, label, type) => { const e = m.events.find((x) => x.label === label && (!type || x.type === type)); if (!e) throw new Error(`${m.id}: no event ${label}`); return e.t; };

function retime(c) {   // piecewise linear map clip time -> chapter time, then build the clip with ffmpeg
  const m = clipMeta(c.clip), cd = probe(path.join(REC, c.clip + '.mp4'));
  let pts = (c.anchors || []).map(([lab, beat, k, off]) => [evT(m, lab), r3(wordT(beat, k) + off - c.t0)]).filter(([, w]) => w > 0.05 && w < c.dur - 0.05);
  // first point: prefer rate 1 before the first anchor (start later in the clip), else slow down to fit
  const first = pts.length ? pts[0] : [Math.min(cd, 0.5 + c.dur), c.dur];
  let c0 = Math.max(0.12, first[0] - first[1]);
  if (!pts.length) c0 = 0.4;
  const P = [[c0, 0], ...pts];
  // no slow motion: when the clip is shorter than the words, play it at normal speed and HOLD the frame where the
  // previous result is on screen (the camera zoom and the phone float keep the picture moving)
  const segs = [], jumps = []; let wNow = 0;
  const play =(a, b, rate) => { if (b - a > 0.02) { segs.push({ a, b, rate, w0: wNow }); wNow += (b - a) / rate; } };
  for (let k = 0; k + 1 < P.length; k++) {
    const [ca] = P[k], [cb, wb] = P[k + 1]; const dc = cb - ca, dw = Math.max(0.05, wb - wNow);
    if (dc <= 0.02) continue;
    let rate = dc / dw;
    if (rate < 0.8) {
      const at = ca + (k === 0 ? Math.min(0.3, dc * 0.3) : Math.min(1.1, dc * 0.5)), hold = dw - dc;
      play(ca, at, 1); segs.push({ freeze: hold, at, w0: wNow }); wNow += hold; play(at, cb, 1);
    } else if (rate > 2.0) {   // too much clip for the words: jump cut (light sweep in the composition) instead of fast-forward
      const x1 = dw * 0.45, x2 = dw - x1; play(ca, ca + x1, 1); jumps.push(wNow); play(cb - x2, cb, 1);
    } else play(ca, cb, Math.min(1.9, rate));
  }
  const lastC = P[P.length - 1][0];
  if (lastC < cd - 0.05) play(lastC, cd, 1);
  const map = (t) => { for (const s of segs) { if (s.freeze) continue; if (t < s.a - 1e-6) return s.w0; if (t <= s.b + 1e-6) return s.w0 + (t - s.a) / s.rate; } return wNow; };
  const out = path.join(W, `ch_${c.id}.mp4`);
  let fc = '', cat = '';
  segs.forEach((s, k) => {
    if (s.freeze) fc += `[0:v]trim=start=${s.at.toFixed(3)}:end=${(s.at + 0.06).toFixed(3)},setpts=PTS-STARTPTS,fps=${FPS},tpad=stop_mode=clone:stop_duration=${s.freeze.toFixed(3)},trim=duration=${s.freeze.toFixed(3)}[v${k}];`;
    else fc += `[0:v]trim=start=${s.a.toFixed(3)}:end=${s.b.toFixed(3)},setpts=(PTS-STARTPTS)/${s.rate.toFixed(4)},fps=${FPS}[v${k}];`;
    cat += `[v${k}]`;
  });
  const pad = Math.max(0, c.dur - wNow + 0.2);
  fc += `${cat}concat=n=${segs.length}:v=1:a=0,fps=${FPS},tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)},trim=duration=${c.dur.toFixed(3)},setsar=1,format=yuv420p[o]`;
  ff(['-i', path.join(REC, c.clip + '.mp4'), '-filter_complex', fc, '-map', '[o]', '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-g', '10', '-movflags', '+faststart', out]);
  c.events = m.events.map((e) => ({ ...e, ct: r3(c.t0 + map(e.t)) })).filter((e) => e.ct < c.t1);
  c.wa = m.wa || [];
  c.rates = segs.map((s) => (s.freeze ? `hold${s.freeze.toFixed(1)}` : +s.rate.toFixed(2))); c.held = r3(pad - 0.2);
  c.jumps = jumps.map((w) => r3(c.t0 + w)); if (jumps.length) c.rates.push(`jump×${jumps.length}`);
  return out;
}
CH.filter((c) => c.clip).forEach((c) => { retime(c); console.log(`  ${c.id.padEnd(8)} ${c.t0.toFixed(2)}-${c.t1.toFixed(2)}  rates ${c.rates.join('/')}${c.held > 0.3 ? `  hold ${c.held.toFixed(1)} s` : ''}`); });

// hook montage: four payoff moments, about 0.8 s each
const hookC = CH[0]; const HOOKCUTS = [['bankak', 'refused', 0.15], ['alt', 'alternatives', 0.2], ['expiry', 'expired blocked', 0.1], ['staff', 'drawer opened', 0.1]];
{
  const per = hookC.dur / HOOKCUTS.length; let fc = '', cat = '';
  hookC.cuts = HOOKCUTS.map(([clip, label, off], k) => {
    const m = clipMeta(clip); const e = m.events.find((x) => x.label === label); const a = e.t + off;
    fc += `[${k}:v]trim=start=${a.toFixed(3)}:duration=${per.toFixed(3)},setpts=PTS-STARTPTS,fps=${FPS}[h${k}];`; cat += `[h${k}]`;
    return { clip, t: r3(per * k), dur: r3(per), focus: e };
  });
  fc += `${cat}concat=n=${HOOKCUTS.length}:v=1:a=0,trim=duration=${hookC.dur.toFixed(3)},setsar=1,format=yuv420p[o]`;
  ff([...HOOKCUTS.flatMap(([clip]) => ['-i', path.join(REC, clip + '.mp4')]), '-filter_complex', fc, '-map', '[o]', '-c:v', 'libx264', '-crf', '15', '-g', '10', path.join(W, 'ch_hook.mp4')]);
  hookC.events = [];
}

// ---------- 3. composition ----------
const A = path.join(CD, 'assets');
for (const c of CH) fs.copyFileSync(path.join(W, `ch_${c.id}.mp4`), path.join(A, `ch_${c.id}.mp4`));
fs.copyFileSync(R('compositions/pharmacy-sudan-system/assets/gsap.min.js'), path.join(A, 'gsap.min.js'));
for (const f of fs.readdirSync(path.join(DEMO, 'fonts'))) fs.copyFileSync(path.join(DEMO, 'fonts', f), path.join(A, 'fonts', f));
const fontsCss = fs.readFileSync(path.join(DEMO, 'css/fonts.css'), 'utf8').replace(/\.\.\/fonts\//g, 'assets/fonts/').replace(/font-display:swap;/g, 'font-display:block;');
ff(['-i', path.join(DEMO, 'img/bg_tall.webp'), '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=14,eq=brightness=-0.16:saturation=0.85', '-frames:v', '1', '-q:v', '3', path.join(A, 'bg.jpg')]);

// phone geometry (CSS px of the 1080x1920 frame); viewport of the recordings: 390 x 844 CSS px
const SW = 600, SH = Math.round(SW * 2110 / 976), BZ = 15, PW = SW + 2 * BZ, PH = SH + 2 * BZ, PX = (1080 - PW) / 2, PY = 345, K = SW / 390;
const FOCUS_X = 540, FOCUS_Y = 1000;
function zoomTo(rect, S, TX = FOCUS_X, TY = FOCUS_Y, free = false) {   // transform for #phone (origin 0 0) bringing rect's centre toward (TX, TY)
  const fx = PX + BZ + (rect.x + rect.w / 2) * K, fy = PY + BZ + (rect.y + rect.h / 2) * K;
  const tx = (TX - PX - S * (fx - PX)) * (free ? 1 : 0.9), ty = (TY - PY - S * (fy - PY)) * (free ? 1 : 0.9);
  if (free) return { x: r3(tx), y: r3(ty), s: r3(S) };
  return { x: r3(Math.max(-PW * (S - 1) - 40, Math.min(40, tx))), y: r3(Math.max(-PH * (S - 1) - 60, Math.min(60, ty))), s: r3(S) };
}
// zoom so the target fills most of the FRAME (not the phone): small toasts and notes get up to 1.6x, whole pages stay at 1
const scaleFor = (rect) => Math.min(1.6, Math.max(1.0, Math.min(1000 / (rect.w * K), 900 / (rect.h * K))));

let html = '', js = '';
const T = (x) => (+x).toFixed(3);
// videos
CH.forEach((c, i) => { html += `<video id="v_${c.id}" class="cv" src="assets/ch_${c.id}.mp4" muted playsinline data-start="${T(c.t0)}" data-duration="${T(c.dur)}" data-track-index="${10 + i}"></video>`; });
const phone = `<div id="phone"><div class="bezel"></div><div class="screen">${html}<div class="sweep" id="sweep"></div></div><div class="glare"></div></div>`;   // no notch: it covered the app's title bar
// header
const chapters = CH.filter((c) => c.n);
const prog = chapters.map((c) => `<i id="pg_${c.id}"></i>`).join('');
const parts = { a: N.parts.a, b: N.parts.b, c: N.parts.c };
const hdr = `<div id="hdr"><div class="prog">${prog}</div><div class="row1"><span class="part" id="part"><b id="partn">1</b><span id="partt">${esc(parts.a)}</span></span></div>${chapters.map((c) => `<div class="ttl" id="tt_${c.id}"><span class="num">${String(c.n).padStart(2, '0')}</span><span class="tx">${esc(TITLE[c.id])}</span></div>`).join('')}</div>`;
// captions (karaoke words), not for hook (big hook text) and cta (CTA card)
let caps = '';
S.forEach((s, i) => { if (s.beat === 'hook' || s.beat === 'cta') return; const ws = s.text.split(/\s+/); caps += `<div class="cap" id="cap${i}"><span class="in">${ws.map((w, k) => `<span class="w" id="w${i}_${k}">${esc(w)}</span>`).join(' ')}</span></div>`; });
// hook text
const hookWords = byBeat.hook.text.replace(/[.؟?]$/, '').split(/\s+/);
const hook = `<div id="hook"><div class="h">${hookWords.map((w, k) => `<span class="${/بتخسر/.test(w) ? 'g' : ''}">${esc(w)}</span>`).join(' ')}</div><div class="hs">Sudegy | سوديجي</div></div>`;
// part card for part b (spoken), WhatsApp bubbles, CTA
const partB = `<div class="pcard" id="pcardb"><span class="pk">2</span><b>${esc(parts.b)}</b></div>`;
const waLines = (txt) => txt.split('\n').filter((l) => l.trim() && !/ج\.س/.test(l)).slice(0, 6);
const waCard = (id, txt) => `<div class="wa" id="${id}"><div class="wah"><span class="dot"></span><b>واتساب</b><span class="lab">رسالة جاهزة</span></div><div class="wab">${waLines(txt).map((l) => `<div class="${/^•/.test(l.trim()) ? 'it' : ''}">${esc(l.trim())}</div>`).join('')}</div></div>`;
const rxC = CH.find((c) => c.id === 'rx'), chC = CH.find((c) => c.id === 'chronic');
const was = (rxC.wa[0] ? waCard('wa_rx', rxC.wa[0]) : '') + (chC.wa[0] ? waCard('wa_ch', chC.wa[0]) : '');
const ctaWords = byBeat.cta.text.replace(/[.؟?]$/, '');
const [cta1, cta2] = (() => { const m = ctaWords.match(/^(.*«نظام»)\s*(.*)$/); return m ? [m[1], m[2]] : [ctaWords, '']; })();
const cta = `<div id="cta"><div class="c1">${esc(cta1).replace('«نظام»', '<em>«نظام»</em>')}</div><div class="c2">${esc(cta2)}</div><div class="brand"><span class="wm">سوديجي</span><span class="bl">Sudegy | سوديجي</span></div></div>`;

// ---------- timeline ----------
const P0 = { x: 0, y: 0, s: 1 };
js += `const tl = gsap.timeline({ paused: true });\n`;
js += `gsap.set('#phone', { transformOrigin: '0 0', x: 0, y: 0, scale: 1 }); gsap.set('.cv', { opacity: 0 });\n`;
// background drift + phone float (never frozen)
js += `tl.fromTo('#bg', { scale: 1.06, x: 0 }, { scale: 1.16, x: -30, duration: ${T(DUR)}, ease: 'none' }, 0);\n`;
js += `tl.fromTo('#float', { y: 0, rotation: 0 }, { y: -10, rotation: 0.5, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: ${Math.ceil(DUR / 3.2)} }, 0);\n`;
js += `tl.fromTo('#glow', { opacity: 0.75, scale: 1 }, { opacity: 1, scale: 1.12, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: ${Math.ceil(DUR / 4)} }, 0);\n`;
CH.forEach((c) => { js += `tl.set('#v_${c.id}', { opacity: 1 }, ${T(c.t0)}); tl.set('#v_${c.id}', { opacity: 0 }, ${T(c.t1)});\n`; });
// chapter transitions: light sweep
CH.filter((c) => c.jumps && c.jumps.length).forEach((c) => c.jumps.forEach((t) => { js += `tl.fromTo('#sweep', { xPercent: 120, opacity: 0.9 }, { xPercent: -160, opacity: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, ${T(t - 0.08)});\n`; }));
CH.slice(1).forEach((c) => { js += `tl.fromTo('#sweep',{ xPercent: 120, opacity: 0.9 }, { xPercent: -160, opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, ${T(c.t0 - 0.05)});\n`; });
// zooms
const zoomSeq = [];   // [{t, z, d}]
const pushZ = (t, z, d = 0.5) => zoomSeq.push({ t: r3(t), z, d });
// hook: punch into each cut's focus box
hookC.cuts.forEach((h) => { const S0 = Math.min(1.6, scaleFor(h.focus) + 0.12); pushZ(h.t, zoomTo(h.focus, S0), 0.001); pushZ(h.t + 0.02, zoomTo(h.focus, S0 + 0.1), h.dur - 0.05); });
pushZ(hookC.t1 - 0.02, P0, 0.001);
for (const c of CH.filter((x) => x.clip)) {
  if (c.id === 'cta') continue;
  const ev = c.events.slice().sort((a, b) => a.ct - b.ct);
  ev.forEach((e, k) => {
    if (e.type !== 'focus') return;
    const nextTap = ev.slice(k + 1).find((x) => x.type === 'tap');
    const end = Math.min(nextTap ? nextTap.ct - 0.55 : c.t1 - 0.45, c.t1 - 0.45);
    if (end - e.ct < 0.7) return;
    const Sx = scaleFor(e); if (Sx < 1.08) { pushZ(e.ct, { ...zoomTo(e, 1.07) }, Math.min(1.2, end - e.ct)); pushZ(end, P0, 0.45); return; }
    pushZ(Math.max(c.t0, e.ct - 0.1), zoomTo(e, Sx), 0.55); pushZ(end, P0, 0.45);
  });
}
zoomSeq.sort((a, b) => a.t - b.t);
let lastEnd = 0;
zoomSeq.forEach((z) => { const t = Math.max(z.t, lastEnd); js += `tl.to('#phone', { x: ${z.z.x}, y: ${z.z.y}, scale: ${z.z.s}, duration: ${T(Math.max(0.001, z.d))}, ease: 'power2.inOut' }, ${T(t)});\n`; lastEnd = t + z.d; });
// hook text from frame 0 at full brightness, header hidden during the hook
const H = hookC;
js += `gsap.set('#hdr', { opacity: 0 }); gsap.set('#hook', { opacity: 1 });\n`;
js += `tl.from('#hook .h span', { y: 26, duration: 0.35, stagger: 0.06, ease: 'back.out(2)', immediateRender: false }, 0.02);\n`;
js += `tl.to('#hook', { opacity: 0, y: -40, duration: 0.3, ease: 'power2.in' }, ${T(Math.max(H.t1 + 0.05, 0.35 * hookWords.length + 0.75))});\n`;
js += `tl.to('#hdr', { opacity: 1, duration: 0.4 }, ${T(Math.max(H.t1 + 0.05, 0.35 * hookWords.length + 0.75) + 0.2)});\n`;
// header: progress and titles
chapters.forEach((c, k) => {
  js += `tl.to('#pg_${c.id}', { backgroundColor: '#e8c98a', boxShadow: '0 0 14px rgba(232,201,138,.8)', duration: 0.3 }, ${T(c.t0)});\n`;
  js += `tl.fromTo('#tt_${c.id}', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, ${T(c.t0 + 0.05)});\n`;
  const next = chapters[k + 1]; js += `tl.to('#tt_${c.id}', { opacity: 0, x: -60, duration: 0.3, ease: 'power2.in' }, ${T((next ? next.t0 : CH[CH.length - 1].t0) - 0.25)});\n`;
});
// intro header: show the brand title before chapter 1
js += `tl.fromTo('#tt_intro', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, ${T(CH[1].t0 + 0.05)}); tl.to('#tt_intro', { opacity: 0, x: -60, duration: 0.3 }, ${T(CH[2].t0 - 0.25)});\n`;
// part chip changes (a at chapter 1, b at rx, c at owner)
const partAt = [['1', parts.a, CH.find((c) => c.id === 'alt').t0], ['2', parts.b, rxC.t0], ['3', parts.c, CH.find((c) => c.id === 'owner').t0]];
js += `gsap.set('#part', { opacity: 0 });\n`;
partAt.forEach(([n, t, at], k) => { js += `tl.call(() => { document.getElementById('partn').textContent = '${n}'; document.getElementById('partt').textContent = ${JSON.stringify(t)}; }, null, ${T(at - 0.01)}); tl.fromTo('#part', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }, ${T(at)});\n`; if (k < 2) js += `tl.to('#part', { opacity: 0, duration: 0.2 }, ${T(partAt[k + 1][2] - 0.22)});\n`; });
js += `tl.to('#hdr', { opacity: 0, duration: 0.35 }, ${T(CH[CH.length - 1].t0 - 0.1)});\n`;
// part B card (spoken transition) over a dimmed phone
const pb = byBeat.partb;
js += `tl.fromTo('#pcardb', { opacity: 0, scale: 0.86, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)', immediateRender: false }, ${T(rxC.t0 + 0.05)}); tl.to('#pcardb', { opacity: 0, scale: 0.94, duration: 0.3 }, ${T(Math.max(pb.end + 0.15, rxC.t0 + 0.35 * nw(pb.text) + 0.75))});\n`;
js += `tl.to('#dim', { opacity: 0.55, duration: 0.3 }, ${T(rxC.t0)}); tl.to('#dim', { opacity: 0, duration: 0.3 }, ${T(Math.max(pb.end + 0.15, rxC.t0 + 0.35 * nw(pb.text) + 0.75))});\n`;
// captions: each sentence visible from its start until the next sentence starts; words turn gold as spoken
S.forEach((s, i) => {
  if (s.beat === 'hook' || s.beat === 'cta') return;
  const nxt = S[i + 1]; const until = nxt ? nxt.start - 0.04 : DUR;
  js += `tl.fromTo('#cap${i}', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.18, immediateRender: false }, ${T(s.start - 0.12)}); tl.set('#cap${i}', { opacity: 0 }, ${T(until)});\n`;
  s.words.forEach(([a], k) => { js += `tl.set('#w${i}_${k}', { color: '#f0d696' }, ${T(a)});`; });
  js += '\n';
});
// WhatsApp bubbles after the "ready" / "remind" taps
for (const [c, id, lab] of [[rxC, 'wa_rx', 'ready'], [chC, 'wa_ch', 'remind']]) {
  if (!c.wa[0]) continue; const e = c.events.find((x) => x.label === lab); const at = e.ct + 0.45, end = Math.max(c.t1 - 0.2, at + 2.2);
  if (at + 2.2 > c.t1 + 0.6) console.warn(`  ! ${id}: the bubble starts late (${at.toFixed(2)} s, chapter ends ${c.t1.toFixed(2)} s)`);
  js += `tl.fromTo('#${id}', { opacity: 0, y: 60, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)', immediateRender: false }, ${T(at)}); tl.to('#${id}', { opacity: 0, y: 30, duration: 0.25 }, ${T(end)});\n`;
  js += `tl.to('#dim', { opacity: 0.45, duration: 0.3 }, ${T(at)}); tl.to('#dim', { opacity: 0, duration: 0.25 }, ${T(end)});\n`;
}
// CTA: phone steps back, glass card with the call to action and the brand
const cC = CH[CH.length - 1]; const ctaAt = byBeat.cta.start - 0.1;
// the phone stays big above the card: first the name being typed, then «صيدليتك» in the app's header
{
  const ty = cC.events.find((e) => e.label === 'type'), en = cC.events.find((e) => e.label === 'enter'), hd = cC.events.find((e) => e.label === 'pharmacy name');
  const zf = zoomTo({ x: ty.x - 160, y: ty.y - 34, w: 320, h: 68 }, 1.45, 540, 700, true);
  js += `tl.to('#phone', { x: ${zf.x}, y: ${zf.y}, scale: ${zf.s}, duration: 0.7, ease: 'power3.inOut' }, ${T(cC.t0)});\n`;
  if (en && hd) { const zh = zoomTo(hd, 1.5, 540, 420, true); js += `tl.to('#phone', { x: ${zh.x}, y: ${zh.y}, scale: ${zh.s}, duration: 0.7, ease: 'power3.inOut' }, ${T(en.ct + 0.45)});\n`; }
}
js += `tl.fromTo('#cta', { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }, ${T(ctaAt)});\n`;
js += `tl.fromTo('#cta em', { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', immediateRender: false }, ${T(ctaAt + 0.35)});\n`;
js += `tl.fromTo('#cta .brand', { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, ${T(ctaAt + 1.0)});\n`;
js += `tl.to('#cta em', { textShadow: '0 0 34px rgba(240,214,150,.95)', duration: 0.8, yoyo: true, repeat: 3, ease: 'sine.inOut' }, ${T(ctaAt + 1.2)});\n`;
js += `window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; tl.seek(0);\n`;

const CSS = `${fontsCss}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#07060a}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#07060a;font-family:'Tajawal',sans-serif;direction:rtl;color:#fff}
#bg{position:absolute;inset:-60px;background:url(assets/bg.jpg) center/cover}
#glow{position:absolute;left:90px;top:520px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(214,170,92,.30),rgba(214,170,92,0) 66%)}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 40%,rgba(0,0,0,.72) 100%),linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,0) 22%,rgba(0,0,0,0) 74%,rgba(0,0,0,.7))}
#float{position:absolute;inset:0}
#phone{position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;will-change:transform}
#phone .bezel{position:absolute;inset:0;border-radius:86px;background:linear-gradient(145deg,#3a3326,#0d0c0b 38%,#1a1712 62%,#4a3f2c);box-shadow:0 50px 120px rgba(0,0,0,.75),0 0 0 2px rgba(232,201,138,.35),inset 0 0 0 3px rgba(0,0,0,.8)}
#phone .screen{position:absolute;left:${BZ}px;top:${BZ}px;width:${SW}px;height:${SH}px;border-radius:72px;overflow:hidden;background:#000}
#phone .cv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
#phone .island{position:absolute;left:50%;top:${BZ + 16}px;width:150px;height:40px;margin-left:-75px;border-radius:22px;background:#000}
#phone .glare{position:absolute;inset:${BZ}px;border-radius:72px;background:linear-gradient(115deg,rgba(255,255,255,.10),rgba(255,255,255,0) 30%);pointer-events:none}
.sweep{position:absolute;top:-10%;left:0;width:55%;height:120%;background:linear-gradient(100deg,rgba(255,236,190,0),rgba(255,236,190,.42) 50%,rgba(255,236,190,0));transform:skewX(-14deg);opacity:0}
#dim{position:absolute;inset:0;background:#000;opacity:0}
#hdr{position:absolute;left:40px;right:40px;top:60px;height:250px;border-radius:40px;background:linear-gradient(160deg,rgba(28,24,18,.80),rgba(10,9,8,.66));border:1.5px solid rgba(232,201,138,.32);box-shadow:0 20px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)}
#hdr .prog{position:absolute;left:44px;right:44px;top:28px;display:flex;gap:10px;direction:rtl}#hdr .prog i{flex:1;height:8px;border-radius:5px;background:rgba(255,255,255,.16)}
#hdr .row1{position:absolute;right:44px;top:58px}
.part{display:inline-flex;align-items:center;gap:12px;height:50px;padding:0 22px 0 8px;border-radius:26px;border:1.5px solid rgba(232,201,138,.55);background:rgba(232,201,138,.10);font-weight:700;font-size:30px;color:#f0d696}
.part b{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#e8c98a;color:#1a140b;font-family:'Cormorant Garamond',serif;font-size:26px}
.ttl{position:absolute;right:44px;left:44px;top:126px;display:flex;align-items:center;gap:22px;opacity:0}
.ttl .num{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:86px;line-height:1;color:#e8c98a;direction:ltr}
.ttl .tx{font-weight:800;font-size:70px;line-height:1.15;color:#fff;white-space:nowrap}
#tt_intro .tx{font-family:'Aref Ruqaa',serif;font-size:86px;color:#f0d696}
#hook{position:absolute;left:0;right:0;top:0;padding:96px 50px 70px;text-align:center;background:linear-gradient(180deg,rgba(5,4,3,.92) 0%,rgba(5,4,3,.82) 62%,rgba(5,4,3,0) 100%)}
#hook .h{font-weight:800;font-size:96px;line-height:1.22;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.85)}
#hook .h span{display:inline-block}#hook .h .g{color:#f0d696}
#hook .hs{margin-top:14px;font-size:34px;font-weight:700;color:rgba(240,214,150,.95);letter-spacing:1px}
.cap{position:absolute;left:46px;right:46px;bottom:52px;min-height:172px;display:flex;align-items:center;justify-content:center;padding:18px 34px;border-radius:36px;background:rgba(10,9,8,.80);border:1.5px solid rgba(232,201,138,.28);box-shadow:0 18px 50px rgba(0,0,0,.6);opacity:0}
.cap .in{font-weight:700;font-size:52px;line-height:1.38;text-align:center;color:#fff}
.pcard{position:absolute;left:110px;right:110px;top:760px;padding:56px 40px;border-radius:44px;text-align:center;background:linear-gradient(160deg,rgba(40,33,22,.86),rgba(12,10,8,.80));border:2px solid rgba(232,201,138,.6);box-shadow:0 30px 90px rgba(0,0,0,.7);opacity:0}
.pcard .pk{display:inline-flex;width:76px;height:76px;align-items:center;justify-content:center;border-radius:50%;background:#e8c98a;color:#1a140b;font-family:'Cormorant Garamond',serif;font-weight:700;font-size:54px}
.pcard b{display:block;margin-top:18px;font-weight:800;font-size:80px;line-height:1.2;color:#fff}
.wa{position:absolute;left:70px;right:70px;top:820px;border-radius:38px;overflow:hidden;background:rgba(18,26,21,.94);border:2px solid rgba(37,211,102,.55);box-shadow:0 30px 90px rgba(0,0,0,.75);opacity:0}
.wah{display:flex;align-items:center;gap:14px;padding:22px 30px;background:linear-gradient(90deg,rgba(37,211,102,.32),rgba(37,211,102,.12));font-size:36px}
.wah .dot{width:22px;height:22px;border-radius:50%;background:#25d366;box-shadow:0 0 14px #25d366}.wah b{font-weight:800}.wah .lab{margin-right:auto;color:#bfeccd;font-size:30px;font-weight:500}
.wab{padding:26px 34px 34px;font-size:38px;line-height:1.5;font-weight:500;color:#eef7f1}.wab .it{direction:ltr;text-align:right;color:#f0d696;font-weight:700}
#cta{position:absolute;left:56px;right:56px;bottom:90px;padding:46px 40px 40px;border-radius:44px;text-align:center;background:linear-gradient(160deg,rgba(40,33,22,.90),rgba(12,10,8,.86));border:2px solid rgba(232,201,138,.65);box-shadow:0 30px 90px rgba(0,0,0,.75);opacity:0}
#cta .c1{font-weight:800;font-size:82px;line-height:1.2}#cta em{display:inline-block;font-style:normal;color:#f0d696}
#cta .c2{margin-top:10px;font-weight:700;font-size:50px;color:rgba(255,255,255,.92)}
#cta .brand{margin-top:26px;display:flex;align-items:center;justify-content:center;gap:24px}#cta .wm{font-family:'Aref Ruqaa',serif;font-size:66px;color:#f0d696}#cta .bl{font-size:34px;font-weight:700;color:rgba(255,255,255,.75);direction:ltr}`;

const page = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1080, height=1920"/><title>pharmacy-tour</title><script src="assets/gsap.min.js"></script><style>${CSS}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${T(DUR)}">
<div id="bg"></div><div id="glow"></div><div id="vig"></div><div id="float">${phone}</div><div id="dim"></div>
${hdr.replace('</div><div class="ttl"', '</div><div class="ttl" id="tt_intro"><span class="tx">سوديجي</span></div><div class="ttl"')}${hook}${caps}${partB}${was}${cta}
</div><script>
${js}</script></body></html>`;
fs.writeFileSync(path.join(CD, 'index.html'), page);
fs.writeFileSync(path.join(CD, 'package.json'), JSON.stringify({ name: 'pharmacy-tour', private: true, type: 'module' }, null, 2));
fs.writeFileSync(path.join(W, 'plan.json'), JSON.stringify({ DUR, VEND, extra, sentences: S.map(({ beat, text, start, end, words }) => ({ beat, text, start, end, words })), chapters: CH.map(({ id, t0, t1, dur, rates, held, events, cuts }) => ({ id, t0, t1, dur, rates, held, events, cuts })) }, null, 1));
console.log(`composition: ${path.relative(ROOT, CD)} (${DUR} s)`);

// ---------- 4. render + audio ----------
if (process.argv.includes('--no-render')) process.exit(0);
const hf = (args) => spawnSync('powershell', ['-NoProfile', '-File', R('scripts/hf.ps1'), ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
const clean = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');
const ck = clean(hf(['check', CD]).stdout); console.log('hf check:', (ck.match(/◇\s+Check (passed|failed)[^\n]*/) || ['?'])[0]);
const silent = path.join(W, 'video_silent.mp4');
if (!process.argv.includes('--reuse-video') || !fs.existsSync(silent)) {
  const t0 = Date.now(); const r = hf(['render', '--output', silent, '--quality', 'standard', '--workers', '1', '--fps', String(FPS), CD]);
  if (!fs.existsSync(silent)) { fs.writeFileSync(path.join(W, 'render.log'), clean(r.stdout + r.stderr)); throw new Error('render failed, see work/render.log'); }
  console.log(`rendered in ${Math.round((Date.now() - t0) / 1000)} s`);
}
// sound effects: whoosh per chapter, soft click per tap, notification per WhatsApp bubble, chime on the CTA
const SFX = (f) => R('factory/sfx', f);
const fx = [];
CH.slice(1).forEach((c) => fx.push([SFX('whoosh-short.mp3'), c.t0 - 0.12, 0.35]));
CH.filter((c) => c.clip).forEach((c) => c.events.filter((e) => e.type === 'tap' && e.label !== 'type').forEach((e) => fx.push([SFX('click-soft.mp3'), e.ct, 0.30])));
hookC.cuts.forEach((h, k) => fx.push([SFX(k ? 'whoosh-short.mp3' : 'impact-bass-1.mp3'), h.t, k ? 0.25 : 0.45]));
for (const [c, lab] of [[rxC, 'ready'], [chC, 'remind']]) if (c.wa[0]) fx.push([SFX('notification.mp3'), c.events.find((x) => x.label === lab).ct + 0.45, 0.45]);
fx.push([SFX('chime.mp3'), ctaAt + 0.35, 0.5]);
const music = R('factory/music/warm_oud_pop.wav');
const inputs = ['-i', silent, '-i', VOICE, '-i', music, '-i', music, '-i', music, ...fx.flatMap(([f]) => ['-i', f])];
let fc = `[2:a][3:a]acrossfade=d=3[m01];[m01][4:a]acrossfade=d=3[mus0];[mus0]atrim=duration=${T(DUR)},volume=0.13,afade=t=in:d=1.2,afade=t=out:st=${T(DUR - 2.2)}:d=2.2[mus];[1:a]apad=whole_dur=${T(DUR)}[vo];`;
fx.forEach(([, t, v], k) => { fc += `[${5 + k}:a]volume=${v},adelay=${Math.max(0, Math.round(t * 1000))}:all=1[f${k}];`; });
fc += `[vo][mus]${fx.map((_, k) => `[f${k}]`).join('')}amix=inputs=${2 + fx.length}:normalize=0:dropout_transition=0,atrim=duration=${T(DUR)}[mix]`;
const pre = path.join(W, 'mix_pre.wav');
ff([...inputs, '-filter_complex', fc, '-map', '[mix]', '-ar', '48000', '-ac', '2', pre]);
// two-pass loudnorm to -14 LUFS, then verify; fallback: gain + limiter
const meas = spawnSync('ffmpeg', ['-v', 'info', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const L = JSON.parse(meas.slice(meas.lastIndexOf('{'), meas.lastIndexOf('}') + 1));
const fin = path.join(W, 'mix.wav');
ff(['-i', pre, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${L.input_i}:measured_TP=${L.input_tp}:measured_LRA=${L.input_lra}:measured_thresh=${L.input_thresh}:offset=${L.target_offset}:linear=true,aresample=48000`, fin]);
const lufs = (f) => { const e = spawnSync('ffmpeg', ['-v', 'info', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; return { I: +((e.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop() || '').replace(/[^\d.-]/g, ''), P: +((e.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop() || '').replace(/[^\d.-]/g, '') }; };
let lo = lufs(fin);
if (lo.P > -1.6 && Math.abs(lo.I + 14) <= 0.6) { ff(['-i', fin, '-af', 'alimiter=limit=0.79:attack=2:release=50:level=false', path.join(W, 'mix2.wav')]); fs.copyFileSync(path.join(W, 'mix2.wav'), fin); lo = lufs(fin); }   // AAC adds about 0.6 dB of peak
if (Math.abs(lo.I + 14) > 0.6) { const g = -14 - lo.I; ff(['-i', fin, '-af', `volume=${g.toFixed(2)}dB,alimiter=limit=0.84:attack=3:release=60`, path.join(W, 'mix2.wav')]); fs.copyFileSync(path.join(W, 'mix2.wav'), fin); lo = lufs(fin); }
const final = path.join(OUT, 'tour_9x16.mp4');
ff(['-i', silent, '-i', fin, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
console.log(`done: ${path.relative(ROOT, final)} (${probe(final).toFixed(2)} s), loudness ${lo.I} LUFS, peak ${lo.P} dBFS`);
