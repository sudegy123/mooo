// Shared helpers for the Sudegy video factory.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';
const SALES = 'C:/Users/Admin/sudegy-sales';

function run(cmd, args, opt = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opt });
  if (r.status !== 0 && !opt.soft) throw new Error(`${cmd} failed (${r.status}): ${(r.stderr || r.stdout || '').slice(-800)}`);
  return r;
}
const dur = (f) => +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJSON = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2)); };
const abs = (p) => (p && !/^[A-Za-z]:[\\/]/.test(p) ? `${ROOT}/${p}` : p);
const hash = (o) => crypto.createHash('sha1').update(typeof o === 'string' ? o : JSON.stringify(o)).digest('hex').slice(0, 12);
const words = (t) => t.trim().split(/\s+/).filter(Boolean);
const stripMarks = (w) => w.replace(/[\u064B-\u065F\u0670.،؟?!,:؛«»"']/g, '');
const log = (...a) => console.log('[factory]', ...a);
const r2 = (x) => +(+x).toFixed(2);

// silence intervals of an audio file
function silences(file, noise = -38, d = 0.06) {
  const err = run('ffmpeg', ['-hide_banner', '-i', file, '-af', `silencedetect=noise=${noise}dB:d=${d}`, '-f', 'null', '-'], { soft: true }).stderr;
  const out = []; let st = null;
  for (const m of err.matchAll(/silence_(start|end): ([0-9.]+)/g)) { if (m[1] === 'start') st = +m[2]; else if (st != null) { out.push([st, +m[2]]); st = null; } }
  const merged = []; for (const p of out) { const l = merged[merged.length - 1]; if (l && p[0] - l[1] < 0.06) l[1] = p[1]; else merged.push([...p]); }
  return merged;
}
// integrated loudness and true peak
function loudness(file) {
  const e = run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { soft: true }).stderr;
  const I = +(e.match(/I:\s+(-?[0-9.]+) LUFS/g) || ['I: 0 LUFS']).pop().match(/-?[0-9.]+/)[0];
  const P = +(e.match(/Peak:\s+(-?[0-9.]+) dBFS/g) || ['Peak: 0 dBFS']).pop().match(/-?[0-9.]+/)[0];
  return { I, P };
}
module.exports = { ROOT, SALES, run, dur, readJSON, writeJSON, abs, hash, words, stripMarks, log, r2, silences, loudness, fs, path };
