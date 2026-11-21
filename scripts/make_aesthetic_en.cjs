// Builds the aesthetic-doctors ad: ONE continuous voice take drives 9 scenes; the real demo recording (G:\sudegy-aesthetic-demo\mvp) adapts to each sentence.
// Usage: node scripts/make_aesthetic.cjs
const fs = require('fs');
const { spawnSync } = require('child_process');
const ROOT = 'G:/sudegy-video-studio';
const DST = `${ROOT}/compositions/aesthetic-ad-en`;
const TEMPO = 1.2, O = 0.5;
const run = (cmd, args, opt = {}) => { const r = spawnSync(cmd, args, { encoding: 'utf8', ...opt }); if (r.status !== 0 && !opt.soft) { console.error(cmd, args.join(' ').slice(0, 220), r.stderr || ''); process.exit(1); } return r; };
const dur = (f) => +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
fs.mkdirSync(`${DST}/assets/audio`, { recursive: true });

// 1) voice
const voice = `${DST}/assets/audio/narration_aesthetic_en.wav`;
run('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${ROOT}/assets/audio/narration_aesthetic_en.wav`, '-af', `atempo=${TEMPO},loudnorm=I=-16:TP=-1.5:LRA=11`, '-ar', '48000', '-ac', '1', voice]);
const D = dur(voice);

// 2) sentence boundaries = the LONGEST pause near each expected sentence end
const sil = run('ffmpeg', ['-hide_banner', '-i', voice, '-af', 'silencedetect=noise=-38dB:d=0.06', '-f', 'null', '-'], { soft: true }).stderr;
let pauses = []; { let st = null; for (const m of sil.matchAll(/silence_(start|end): ([0-9.]+)/g)) { if (m[1] === 'start') st = +m[2]; else if (st != null) { pauses.push([st, +m[2]]); st = null; } } }
const merged = []; for (const p of pauses) { const l = merged[merged.length - 1]; if (l && p[0] - l[1] < 0.06) l[1] = p[1]; else merged.push([...p]); }
const N = JSON.parse(fs.readFileSync(`${ROOT}/briefs/narration_aesthetic_en.json`, 'utf8'));
const sentences = N.sentences, S = {}; sentences.forEach((s) => (S[s.scene] = s.text));
const chars = sentences.map((s) => s.text.replace(/\s+/g, '').length), total = chars.reduce((a, b) => a + b, 0);
let acc = 0; const expected = chars.slice(0, -1).map((c) => (acc += c) / total * D);
// English take: sentence-final pauses were normalised to ~0.5 s, so the N-1 longest pauses ARE the sentence boundaries
const need = sentences.length - 1;
const chosen = [...merged].sort((x, y) => (y[1] - y[0]) - (x[1] - x[0])).slice(0, need).sort((x, y) => x[0] - y[0]);
if (chosen.length !== need) { console.error('not enough pauses'); process.exit(1); }
chosen.forEach((p, i) => { const e = expected[i]; if (Math.abs((p[0] + p[1]) / 2 - e) > 3.2) console.warn(`WARNING: boundary ${i + 1} at ${((p[0] + p[1]) / 2).toFixed(2)} is far from expected ${e.toFixed(2)}`); });
const bnd = chosen.map((p) => +(O + (p[0] + p[1]) / 2).toFixed(2));
const sent = sentences.map((s, i) => ({ scene: s.scene, start: +(O + (i === 0 ? 0 : chosen[i - 1][1])).toFixed(2), end: +(O + (i === sentences.length - 1 ? D : chosen[i][0])).toFixed(2) }));
fs.writeFileSync(`${ROOT}/briefs/narration_aesthetic_en.timing.json`, JSON.stringify({ tempo: TEMPO, voiceSeconds: +D.toFixed(2), boundaries: bnd, sentences: sent }, null, 2));
console.log('voice', D.toFixed(2) + 's; boundaries', bnd.join(' ') + '\n' + sent.map((s) => `  ${s.scene.padEnd(10)} ${s.start}-${s.end} (${(s.end - s.start).toFixed(1)}s)`).join('\n'));
const [B1, B2, B3, B4, B5, B6, B7, B8, B9] = bnd;

// 3) the real demo recording -> ONE reel, five voice-led phases (intro, questions, plan, doctor card, booking chat)
const DEMO = +(B3 + 0.15).toFixed(2), phoneOut = +(B8 - 0.25).toFixed(2);
const Pi = B4 - DEMO, Pq = B5 - B4, Pp = B6 - B5, Pd = B7 - B6, Pb = phoneOut - B7;
const ev = JSON.parse(fs.readFileSync(`${ROOT}/assets/screens/aesthetic/raw_en.events.json`, 'utf8'));
const vt = (l) => ev.events.find((x) => x.label === l).t - ev.firstFrameOffset;
const tResult = vt('result-reached'), tSend = vt('send'), tSlot = vt('slot'), tCard = vt('doctor-card'), vEnd = ev.duration;
const sp = (a, b, P) => +((b - a) / P).toFixed(3);
const SEG = [
  [0.4, 3.1, sp(0.4, 3.1, Pi)],
  [3.1, 10.0, sp(3.1, 10.0, Pq * 0.55)], [33.0, 40.4, sp(33.0, 40.4, Pq * 0.45)],
  [tResult, tSend - 0.4, sp(tResult, tSend - 0.4, Pp)],
  [tCard - 0.9, Math.min(vEnd - 0.1, tCard + 3.2), sp(tCard - 0.9, Math.min(vEnd - 0.1, tCard + 3.2), Pd)],
  [tSend - 0.35, tSlot + 2.4, sp(tSend - 0.35, tSlot + 2.4, Pb)],
];
console.log('segment speeds', SEG.map((s) => s[2]).join(' '));
if (SEG.some((s) => s[2] > 4.6 || s[2] < 0.55)) console.warn('WARNING: a recording speed is outside 0.55-4.6x');
run('node', [`${ROOT}/scripts/build_reel.mjs`, `${ROOT}/assets/screens/aesthetic/raw_en.mp4`, `${ROOT}/assets/screens/aesthetic/raw_en.events.json`, `${ROOT}/assets/screens/aesthetic_reel_en.mp4`, `${ROOT}/assets/screens/aesthetic_reel_en.events.json`], { env: { ...process.env, SEG_JSON: JSON.stringify(SEG), HOLD: '0' }, stdio: ['ignore', 'ignore', 'inherit'] });
const reelEv = JSON.parse(fs.readFileSync(`${ROOT}/assets/screens/aesthetic_reel_en.events.json`, 'utf8'));
const tapsA = reelEv.taps.filter((t) => !['result-reached', 'doctor-card'].includes(t.label)).map((t) => [t.t, t.x, t.y]);
const durReel = dur(`${ROOT}/assets/screens/aesthetic_reel_en.mp4`);
console.log('reel', durReel.toFixed(2), 's; taps', tapsA.length);
fs.copyFileSync(`${ROOT}/assets/screens/aesthetic_reel_en.mp4`, `${DST}/assets/aesthetic_reel_en.mp4`);
fs.copyFileSync(`${ROOT}/compositions/dental-triage-15s/assets/gsap.min.js`, `${DST}/assets/gsap.min.js`);
fs.cpSync(`${ROOT}/compositions/dental-triage-15s/assets/fonts`, `${DST}/assets/fonts`, { recursive: true });
{ const p = JSON.parse(fs.readFileSync(`${ROOT}/compositions/andoria-explainer/package.json`, 'utf8')); p.name = 'aesthetic-ad-en'; fs.writeFileSync(`${DST}/package.json`, JSON.stringify(p, null, 2)); }

// 4) motion kit: karaoke word timing (estimated by letter count), cuts, SFX
const cap = N.captions, ctaIn = +(B9 + 0.12).toFixed(2), endT = +(O + D + 1.5).toFixed(2);
const strip = (w) => w.replace(/[\u064B-\u065F\u0670.،؟?!,:؛]/g, '');
const wordTimes = (sc) => { const s = sent.find((x) => x.scene === sc); const raw = S[sc].trim().split(/\s+/); const wt = raw.map((w) => Math.max(2, strip(w).length)); const tot = wt.reduce((a, b) => a + b, 0); const span = s.end - s.start; let t = s.start - 0.03; return raw.map((_, i) => { const a = t; t += span * wt[i] / tot; return [+a.toFixed(2), +t.toFixed(2)]; }); };
const WT = {}; sentences.forEach((s) => (WT[s.scene] = wordTimes(s.scene)));
const CUTS = [B1, B2, B3, B4, B5, B6, B7, B8, B9].map((x) => +x.toFixed(2));
const H = { b1: 0.45, typ: +(B1 * 0.3 + 0.25).toFixed(2), b2: +(B1 * 0.3 + 1.05).toFixed(2), seen: +(B1 * 0.3 + 1.55).toFixed(2) };
const sfx = []; const addSfx = (file, at, vol, d) => sfx.push({ file, at: +at.toFixed(2), vol, dur: d });
CUTS.forEach((c, i) => addSfx(i === 2 ? 'whoosh-cinematic.mp3' : 'whoosh-short.mp3', c - 0.25, i === 2 ? 0.22 : 0.3, i === 2 ? 1.6 : 0.6));
tapsA.forEach(([t2]) => addSfx('click-soft.mp3', DEMO + t2, 0.28, 0.4));
addSfx('pop.mp3', H.b1, 0.25, 0.7); addSfx('pop.mp3', H.b2, 0.22, 0.7);
[B4, B5, B6, B7].forEach((t) => addSfx('pop.mp3', t + 0.15, 0.2, 0.7));
addSfx('sparkle.mp3', B6 + 0.5, 0.28, 1.8);
addSfx('pop.mp3', B8 + 0.5, 0.2, 0.7); addSfx('sparkle.mp3', B8 + 1.2, 0.2, 1.8); addSfx('chime.mp3', ctaIn, 0.2, 2.5);
const sfxTags = sfx.map((e, i) => `      <audio id="sfx${i}" src="assets/sfx/${e.file}" data-start="${Math.max(0, e.at)}" data-duration="${e.dur}" data-track-index="${20 + i}" data-volume="${e.vol}"></audio>`).join('\n');
fs.mkdirSync(`${DST}/assets/sfx`, { recursive: true });
for (const f of new Set(sfx.map((e) => e.file))) fs.copyFileSync(`${ROOT}/assets/sfx/${f}`, `${DST}/assets/sfx/${f}`);
fs.copyFileSync(`${ROOT}/assets/sfx/CREDITS.md`, `${DST}/assets/sfx/CREDITS.md`);
const TB = `      const T = { B: ${JSON.stringify(CUTS)}, h: ${JSON.stringify(H)}, demo: ${DEMO}, phoneOut: ${phoneOut}, ctaIn: ${ctaIn}, end: ${endT} };
      const WT = ${JSON.stringify(WT)};
      const CUTS = ${JSON.stringify(CUTS)};
      const TAPS = ${JSON.stringify(tapsA)};`;
let h = fs.readFileSync(`${ROOT}/scripts/templates/aesthetic_en.template.html`, 'utf8');
const fonts = fs.readFileSync(`${ROOT}/.cache/fonts_block.css`, 'utf8');
const audio = `      <audio id="narration" src="assets/audio/narration_aesthetic_en.wav" data-start="${O}" data-duration="${D.toFixed(2)}" data-track-index="5" data-volume="1"></audio>\n`;
const R = { __SFX__: sfxTags, __FONTS__: fonts, __CAP1__: cap[0], __CAP2__: cap[1], __CAP3__: cap[2], __CAP4__: cap[3], __DUR__: String(endT), __DEMO__: String(DEMO), __REELDUR__: durReel.toFixed(2), __TBLOCK__: TB, __AUDIO__: audio };
for (const s of sentences) R[`__S_${s.scene}__`] = s.text;
for (const [k, v] of Object.entries(R)) h = h.split(k).join(v);
fs.writeFileSync(`${DST}/index.html`, h);
fs.writeFileSync(`${ROOT}/briefs/rows_aesthetic_en.json`, JSON.stringify({ rows: [{ name: 'aesthetic_en' }] }, null, 2));
console.log(`written ${DST}/index.html; video ${endT}s (voice ${D.toFixed(2)}s)`);
