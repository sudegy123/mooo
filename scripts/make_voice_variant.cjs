// Builds the VOICE variant of the composition as a separate project (the silent one stays untouched).
// The voice leads the timing: the hook needs ~0.45s more, so everything after it shifts. Voice files are loudness-normalised.
// Usage: node scripts/make_voice_variant.cjs
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';
const SRC = `${ROOT}/compositions/dental-triage-15s`;
const DST = `${ROOT}/compositions/dental-triage-voice`;

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(`${DST}/assets/audio`, { recursive: true });
for (const f of ['index.html', 'hyperframes.json', 'meta.json', 'package.json']) fs.copyFileSync(`${SRC}/${f}`, `${DST}/${f}`);
for (const f of fs.readdirSync(`${SRC}/assets`)) {
  const p = `${SRC}/assets/${f}`;
  if (fs.statSync(p).isDirectory()) fs.cpSync(p, `${DST}/assets/${f}`, { recursive: true }); else fs.copyFileSync(p, `${DST}/assets/${f}`);
}

// loudness-normalise the four voice lines to about -16 LUFS
const dur = {};
for (const k of ['hook', 'pain', 'result', 'cta']) {
  const inp = `${ROOT}/assets/audio/vo_${k}.wav`, outp = `${DST}/assets/audio/vo_${k}.wav`;
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', inp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '1', outp], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('loudnorm failed for', k); process.exit(1); }
  const p = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outp], { encoding: 'utf8' });
  dur[k] = +(+p.stdout.trim()).toFixed(2);
}
console.log('voice durations (s):', JSON.stringify(dur));

let h = fs.readFileSync(`${DST}/index.html`, 'utf8');
const a = h.indexOf('      const DEMO = ');
const b = h.indexOf('\n      };', h.indexOf('const T = {', a)) + '\n      };'.length;
if (a < 0 || b < a) { console.error('T block not found'); process.exit(1); }
const T = `      const DEMO = 6.8;
      const T = {
        hookOut: 3.0,                                    // voice-led: the hook line is ${dur.hook}s long
        painIn: 3.31, painOut: 6.45,
        phoneIn: 6.75, demo: DEMO,
        caps: [[0.5, 3.75], [4.05, 6.15], [6.45, 8.85]].map(([a, b]) => [DEMO + a, DEMO + b]),
        phoneOut: 15.57,                                 // reel (9.06s) ends at 15.86
        s4In: 15.95, s4Out: 21.25,
        s5In: 21.45,
      };`;
h = h.slice(0, a) + T + h.slice(b);
h = h.replace(/data-duration="23.6"/, 'data-duration="24.2"').replace(/data-start="6.35" data-duration="9.06"/, 'data-start="6.8" data-duration="9.06"');
const audio = [
  ['vo-hook', 'hook', 0.15], ['vo-pain', 'pain', 3.5], ['vo-result', 'result', 17.6], ['vo-cta', 'cta', 21.55],
].map(([id, k, s]) => `      <audio id="${id}" src="assets/audio/vo_${k}.wav" data-start="${s}" data-duration="${dur[k]}" data-track-index="${k === 'hook' ? 2 : k === 'pain' ? 3 : k === 'result' ? 4 : 5}" data-volume="1"></audio>`).join('\n');
h = h.replace('      <div id="label">', audio + '\n\n      <div id="label">');
h = h.replace('<title>Sudegy dental — smart booking request, 15s 9:16</title>', '<title>Sudegy dental — smart booking request, voice variant</title>');
fs.writeFileSync(`${DST}/index.html`, h);
console.log('voice variant written;', 'audio tags:', (h.match(/<audio /g) || []).length, 'root 24.2:', /data-duration="24.2"/.test(h));
