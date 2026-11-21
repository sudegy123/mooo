// Builds the NARRATED composition: ONE continuous voice-over take runs the whole video and the picture follows the voice.
//  1) speeds the single TTS take up 12% (pitch preserved) and loudness-normalises it
//  2) finds the sentence boundaries from the pauses of that single take (nearest pause to the expected position, never a cut)
//  3) rebuilds the real screen recording so each demo phase lasts as long as its narration sentence (speeds adapt, close to real time)
//  4) copies the silent composition and patches the timing table, TAPS, reel, root duration and a SINGLE <audio> clip
// Usage: node scripts/make_narrated.cjs
const fs = require('fs');
const { spawnSync } = require('child_process');
const ROOT = 'G:/sudegy-video-studio';
const SRC = `${ROOT}/compositions/dental-triage-15s`;
const DST = `${ROOT}/compositions/dental-triage-narrated`;
const TEMPO = 1.12, O = 0.15;   // tempo of the voice; voice starts 0.15s into the video

const run = (cmd, args, opt = {}) => { const r = spawnSync(cmd, args, { encoding: 'utf8', ...opt }); if (r.status !== 0 && !opt.soft) { console.error(cmd, args.join(' '), r.stderr || ''); process.exit(1); } return r; };
const dur = (f) => +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(`${DST}/assets/audio`, { recursive: true });
for (const f of ['index.html', 'hyperframes.json', 'meta.json', 'package.json']) fs.copyFileSync(`${SRC}/${f}`, `${DST}/${f}`);
for (const f of fs.readdirSync(`${SRC}/assets`)) { const p = `${SRC}/assets/${f}`; if (fs.statSync(p).isDirectory()) fs.cpSync(p, `${DST}/assets/${f}`, { recursive: true }); else if (!/^dental_reel/.test(f)) fs.copyFileSync(p, `${DST}/assets/${f}`); }

// 1) one take, faster, normalised
const voiceOut = `${DST}/assets/audio/narration_c.wav`;
run('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${ROOT}/assets/audio/narration_c.wav`, '-af', `atempo=${TEMPO},loudnorm=I=-16:TP=-1.5:LRA=11`, '-ar', '48000', '-ac', '1', voiceOut]);
const D = dur(voiceOut);

// 2) sentence boundaries from the pauses
const sil = run('ffmpeg', ['-hide_banner', '-i', voiceOut, '-af', 'silencedetect=noise=-38dB:d=0.1', '-f', 'null', '-'], { soft: true }).stderr;
let pauses = []; { let st = null; for (const m of sil.matchAll(/silence_(start|end): ([0-9.]+)/g)) { if (m[1] === 'start') st = +m[2]; else if (st != null) { pauses.push([st, +m[2]]); st = null; } } }
const merged = []; for (const p of pauses) { const l = merged[merged.length - 1]; if (l && p[0] - l[1] < 0.06) l[1] = p[1]; else merged.push([...p]); }
const sentences = JSON.parse(fs.readFileSync(`${ROOT}/briefs/narration_c.json`, 'utf8')).sentences;
const chars = sentences.map((s) => s.text.replace(/\s+/g, '').length), total = chars.reduce((a, b) => a + b, 0);
let acc = 0; const expected = chars.slice(0, -1).map((c) => (acc += c) / total * D);
const chosen = []; let lastIdx = -1;
// pick the LONGEST pause near each expected sentence end (a short 0.1s pause inside a sentence must never win over a real sentence break)
expected.forEach((e) => {
  const cand = [];
  merged.forEach((p, i) => { if (i <= lastIdx) return; const mid = (p[0] + p[1]) / 2; if (Math.abs(mid - e) <= 1.3) cand.push({ i, p, dur: p[1] - p[0], d: Math.abs(mid - e) }); });
  if (!cand.length) { console.error("no pause near", e.toFixed(2)); process.exit(1); }
  cand.sort((x, y) => (y.dur - x.dur) || (x.d - y.d));
  chosen.push(cand[0].p); lastIdx = cand[0].i;
});
const bnd = chosen.map((p) => +(O + (p[0] + p[1]) / 2).toFixed(2));     // B1..B6 in video time (pause midpoints)
const sent = sentences.map((s, i) => ({ scene: s.scene, start: +(O + (i === 0 ? 0 : chosen[i - 1][1])).toFixed(2), end: +(O + (i === 6 ? D : chosen[i][0])).toFixed(2) }));
fs.writeFileSync(`${ROOT}/briefs/narration_c.timing.json`, JSON.stringify({ tempo: TEMPO, voiceSeconds: +D.toFixed(2), boundaries: bnd, sentences: sent }, null, 2));
console.log('voice', D.toFixed(2) + 's; boundaries', bnd.join(' '), '\n' + sent.map((s) => `  ${s.scene.padEnd(7)} ${s.start}-${s.end}`).join('\n'));
const [B1, B2, B3, B4, B5, B6] = bnd;

// 3) scene timing driven by the voice
// text stays until its sentence is finished (the earlier -0.36/-0.45 made it vanish up to 0.4s before the voice did)
const hookOut = +(B1 - 0.2).toFixed(2), painIn = +(B1 + 0.1).toFixed(2), painOut = +(B2 - 0.08).toFixed(2);
const phoneIn = +(B2 + 0.16).toFixed(2), DEMO = +(phoneIn + 0.05).toFixed(2);
const s4In = +(B5 - 1.9).toFixed(2), phoneOut = +(s4In - 0.35).toFixed(2);
const L = +(phoneOut + 0.3 - DEMO).toFixed(2);
const P1 = B3 - DEMO, P2 = B4 - B3, P3 = L - P1 - P2;
const vA = 5.3 / P1, vB = 5.4 / P2;
const holdC = Math.max(0, P3 - 1.7 - 0.7), staticDur = Math.max(0.3, P3 - 1.7 - holdC);
const SEG = [[0.6, 1.4, vA], [1.4, 3.9, vA], [3.9, 5.9, vA], [5.9, 11.3, vB], [11.3, 12.4, 1.0], [12.4, 14.4, 2.0 / staticDur], [14.4, 15.0, 1.0]].map(([a, b, k]) => [a, b, +k.toFixed(4)]);
console.log(`demo ${DEMO}-${(DEMO + L).toFixed(2)} (reel ${L}s): phase speeds A x${vA.toFixed(2)} B x${vB.toFixed(2)}; summary phase ${P3.toFixed(2)}s (static x${(2 / staticDur).toFixed(2)}, hold ${holdC.toFixed(2)})`);
if (vA > 1.8 || vB > 1.8 || vA < 0.6 || vB < 0.6) console.warn('WARNING: a demo phase speed is outside 0.6-1.8x');
const reel = `${ROOT}/assets/screens/dental_reel_narr.mp4`, reelEv = `${ROOT}/assets/screens/dental_reel_narr.events.json`;
run('node', [`${ROOT}/scripts/build_reel.mjs`, `${ROOT}/assets/screens/dental_diagnose_ar.mp4`, `${ROOT}/assets/screens/dental_diagnose_ar.events.json`, reel, reelEv], { env: { ...process.env, SEG_JSON: JSON.stringify(SEG), HOLD: String(+holdC.toFixed(3)) }, stdio: 'inherit' });
fs.copyFileSync(reel, `${DST}/assets/dental_reel.mp4`); fs.copyFileSync(reelEv, `${DST}/assets/dental_reel.events.json`);
const ev = JSON.parse(fs.readFileSync(reelEv, 'utf8'));
const taps = ev.taps.map((t) => `[${t.t}, ${t.x}, ${t.y}]`).join(', ');

// 4) patch the composition
const endT = +(O + D + 0.7).toFixed(2);
const caps = [[+(DEMO + 0.45).toFixed(2), +(B3 - 0.32).toFixed(2)], [+(B3 + 0.1).toFixed(2), +(B4 - 0.32).toFixed(2)], [+(B4 + 0.1).toFixed(2), +(B5 - 0.25).toFixed(2)]];
const T = `      const DEMO = ${DEMO};
      const T = {
        // NARRATED: everything below is driven by the single voice take (boundaries B1..B6 = ${bnd.join(', ')})
        hookOut: ${hookOut},
        painIn: ${painIn}, painOut: ${painOut},
        phoneIn: ${phoneIn}, demo: DEMO,
        caps: ${JSON.stringify(caps)},
        phoneOut: ${phoneOut},                                 // reel (${L}s) ends at ${(DEMO + L).toFixed(2)}
        s4In: ${s4In}, resultAt: ${(B5 + 0.35).toFixed(2)}, s4Out: ${(B6 - 0.1).toFixed(2)},
        s5In: ${(B6 + 0.12).toFixed(2)},
      };`;
let h = fs.readFileSync(`${DST}/index.html`, 'utf8');
const a = h.indexOf('      const DEMO = '), b = h.indexOf('\n      };', h.indexOf('const T = {', a)) + '\n      };'.length;
if (a < 0 || b < a) { console.error('T block not found'); process.exit(1); }
h = h.slice(0, a) + T + h.slice(b);
h = h.replace(/const TAPS = \[\[.*?\]\];/, `const TAPS = [${taps}];`);
h = h.replace('T.s4In + 1.6', 'T.resultAt');
h = h.replace(/data-duration="23.6"/, `data-duration="${endT}"`).replace(/data-start="6.35" data-duration="9.06"/, `data-start="${DEMO}" data-duration="${(+ev.duration).toFixed(2)}"`);
h = h.replace('      <div id="label">', `      <audio id="narration" src="assets/audio/narration_c.wav" data-start="${O}" data-duration="${D.toFixed(2)}" data-track-index="2" data-volume="1"></audio>\n\n      <div id="label">`);
h = h.replace('15s 9:16</title>', 'narrated</title>');
fs.writeFileSync(`${DST}/index.html`, h);
console.log(`written ${DST}; video ${endT}s (voice ${D.toFixed(2)}s, one audio clip: ${(h.match(/<audio /g) || []).length})`);
