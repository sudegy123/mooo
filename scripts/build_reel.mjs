// Cuts the raw screen recording into the demo "reel" (speed-ramped) and maps tap events onto the new timeline.
// Usage: node scripts/build_reel.mjs <raw.mp4> <raw.events.json> <out_reel.mp4> <out_reel_events.json>
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const [raw, evFile, outMp4, outEv] = process.argv.slice(2);
if (!raw || !evFile || !outMp4 || !outEv) { console.error('usage: build_reel.mjs raw.mp4 raw.events.json out.mp4 out.events.json'); process.exit(2); }
const ev = JSON.parse(fs.readFileSync(evFile, 'utf8'));
const off = ev.firstFrameOffset || 0;

// [source_start, source_end, speed] in video time. Routine form-filling is sped up; the summary (the result) plays near real time.
// The summary appears at ~12.0-12.3 (video time), is static until ~14.4, then the panel scrolls (14.5-14.8): the static stretch is compressed x6.
// v7 (slower, user could not read at the earlier speeds): gentler speed-ups; only the truly static stretch is compressed.
const SEG = process.env.SEG_JSON ? JSON.parse(process.env.SEG_JSON) : [[0.6, 1.4, 1.0], [1.4, 3.9, 1.4], [3.9, 5.9, 1.4], [5.9, 11.3, 2.4], [11.3, 12.4, 1.0], [12.4, 14.4, 4.0], [14.4, 15.0, 1.0]];

const HOLD = process.env.HOLD != null ? +process.env.HOLD : 0.6; // hold the last frame so the last caption has reading time
const parts = SEG.map(([s, e, k], i) => `[0:v]trim=start=${s}:end=${e},setpts=(PTS-STARTPTS)/${k},fps=30[v${i}]`);
const concat = SEG.map((_, i) => `[v${i}]`).join('') + `concat=n=${SEG.length}:v=1:a=0,tpad=stop_mode=clone:stop_duration=${HOLD},scale=780:1688:flags=lanczos,format=yuv420p[out]`;
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-filter_complex', [...parts, concat].join(';'), '-map', '[out]', '-c:v', 'libx264', '-crf', '15', '-preset', 'veryfast', '-an', outMp4], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

// map tap events (recording time -> video time -> reel time)
let acc = 0; const starts = SEG.map(([s, e, k]) => { const a = acc; acc += (e - s) / k; return a; });
const total = +(acc + HOLD).toFixed(3);
const map = (tv) => { for (let i = 0; i < SEG.length; i++) { const [s, e, k] = SEG[i]; if (tv >= s && tv <= e) return +(starts[i] + (tv - s) / k).toFixed(3); } return null; };
const taps = ev.events.filter((x) => x.x != null).map((x) => ({ label: x.label, x: x.x, y: x.y, t: map(x.t - off) })).filter((x) => x.t != null);
fs.writeFileSync(outEv, JSON.stringify({ duration: total, viewport: { w: 390, h: 844 }, segments: SEG.map(([s, e, k], i) => ({ src: [s, e], speed: k, reelStart: +starts[i].toFixed(3) })), taps }, null, 2));
console.log('reel duration', total, 's; taps mapped:', taps.map((t) => `${t.label}@${t.t}`).join(', '));
