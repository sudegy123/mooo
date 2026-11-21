// Critique pass for the pharmacy tour (a different step from the builder, AGENTS.md section 4):
// frames at every chapter's key moments → contact sheets; frozen frames; loudness; long silences; caption reading time.
// Usage: node scripts/critique_pharmacy_tour.cjs <video.mp4> <outDir>
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const [video, outDir] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'out/pharmacy-tour/work/plan.json'), 'utf8'));
fs.mkdirSync(path.join(outDir, 'frames'), { recursive: true });
const run = (args) => spawnSync('ffmpeg', args, { encoding: 'utf8', maxBuffer: 1 << 26 });
const D = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' }).stdout;

// frames: hook cuts, each chapter start / focus moments / end, CTA end
const pts = [0.05, 0.9, 1.8, 2.6];
for (const c of plan.chapters) { pts.push(c.t0 + 0.5); (c.events || []).filter((e) => e.type === 'focus').forEach((e) => pts.push(e.ct + 0.7)); pts.push(c.t1 - 0.25); }
pts.push(D - 0.1);
const times = [...new Set(pts.filter((t) => t >= 0 && t < D).map((t) => +t.toFixed(2)))].sort((a, b) => a - b);
const files = times.map((t, i) => { const f = path.join(outDir, 'frames', `f${String(i).padStart(3, '0')}_${t.toFixed(2)}.jpg`); run(['-y', '-v', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', 'scale=270:-1', f]); return f; });
for (let s = 0; s * 18 < files.length; s++) {
  const part = files.slice(s * 18, s * 18 + 18); while (part.length % 6) part.push(part[part.length - 1]);
  const rows = []; for (let r = 0; r < part.length / 6; r++) rows.push(part.slice(r * 6, r * 6 + 6));
  const inputs = part.flatMap((f) => ['-i', f]);
  const fc = rows.map((row, r) => `${row.map((_, k) => `[${r * 6 + k}:v]`).join('')}hstack=6[r${r}]`).join(';') + `;${rows.map((_, r) => `[r${r}]`).join('')}vstack=${rows.length}[o]`;
  run(['-y', '-v', 'error', ...inputs, '-filter_complex', rows.length > 1 ? fc : fc.replace(/;\[r0\]vstack=1\[o\]$/, '').replace('[r0]', '[o]'), '-map', '[o]', path.join(outDir, `sheet${s + 1}.jpg`)]);
}
// frozen frames (the phone floats, so a real freeze means the render or a clip stopped)
const fz = run(['-v', 'info', '-i', video, '-vf', 'freezedetect=n=0.0015:d=1.2', '-map', '0:v', '-f', 'null', '-']).stderr;
const freezes = [...fz.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)].map((m) => `${(+m[1]).toFixed(2)} s for ${(+m[2]).toFixed(2)} s`);
// loudness
const eb = run(['-v', 'info', '-i', video, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr;
const I = +(eb.match(/I:\s+(-?[\d.]+) LUFS/g) || ['']).pop().replace(/[^\d.-]/g, ''), LRA = +(eb.match(/LRA:\s+([\d.]+) LU/g) || ['']).pop().replace(/[^\d.]/g, ''), P = +(eb.match(/Peak:\s+(-?[\d.]+) dBFS/g) || ['']).pop().replace(/[^\d.-]/g, '');
// long silences in the final mix (music under the voice, so measure the voice-led level)
const sd = run(['-v', 'info', '-i', video, '-af', 'silencedetect=n=-45dB:d=1.0', '-f', 'null', '-']).stderr;
const sil = [...sd.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => `${(+m[1] - +m[2]).toFixed(2)}-${(+m[1]).toFixed(2)}`);
// caption reading time (each sentence shown from start-0.12 to the next start-0.04; hook and CTA have their own cards)
const S = plan.sentences, rows = [];
S.forEach((s, i) => { const w = s.text.split(/\s+/).length, need = 0.35 * w + 0.7; const shown = s.beat === 'cta' ? D - s.start : s.beat === 'hook' ? Math.max(S[1].start - 0.4, 0.35 * w + 0.75) + 0.05 : (S[i + 1] ? S[i + 1].start - 0.04 : D) - (s.start - 0.12); rows.push({ beat: s.beat, w, need: +need.toFixed(2), shown: +shown.toFixed(2), ok: shown >= need - 0.02 }); });
const md = `# pharmacy-tour critique (${path.basename(video)}, ${D.toFixed(2)} s)

## Measured
- Loudness: ${I} LUFS integrated (target -14 ±1), LRA ${LRA} LU, true peak ${P} dBFS.
- Frozen frames (≥1.2 s): ${freezes.length ? freezes.join('; ') : 'none'}.
- Silences ≥1 s below -45 dB: ${sil.length ? sil.join(', ') : 'none'}.
- Caption reading time: ${rows.filter((r) => !r.ok).length ? 'FAIL ' + rows.filter((r) => !r.ok).map((r) => `${r.beat} ${r.shown}/${r.need}`).join(', ') : 'all pass'} (${rows.length} sentences).

| beat | words | needed s | shown s |
|---|---|---|---|
${rows.map((r) => `| ${r.beat} | ${r.w} | ${r.need} | ${r.shown}${r.ok ? '' : ' ✗'} |`).join('\n')}

## Frames
Contact sheets: ${fs.readdirSync(outDir).filter((f) => /^sheet/.test(f)).join(', ')} (frames at ${times.length} moments: hook cuts, every chapter start, every zoom target, every chapter end).
`;
fs.writeFileSync(path.join(outDir, 'measured.md'), md);
console.log(md.split('## Frames')[0]);
