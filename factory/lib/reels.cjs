// Phone reels: each phone phase is cut from a real app recording (speed-ramped to the phase length) or from a brand clip,
// then all phases are joined into one reel; tap events are mapped onto the reel timeline for ripples and click sounds.
const { ROOT, run, dur, readJSON, abs, log, fs } = require('./util.cjs');
const SKIP_TAPS = new Set(['result-reached', 'doctor-card', 'scroll-hero', 'hint-capture', 'hint-upload']);

function resolver(rec) {
  const ev = readJSON(abs(rec.events)), off = ev.firstFrameOffset || 0, vEnd = dur(abs(rec.video)) - 0.15;
  return (x) => {
    if (typeof x === 'number') return x;
    const m = String(x).match(/^([a-z0-9#._-]+?)(?:([+-])([0-9.]+))?$/i); if (!m) throw new Error('bad time ' + x);
    let base;
    if (m[1] === 'end') base = vEnd; else if (m[1] === 'stop') base = rec.stop_before || vEnd;
    else { const hit = ev.events.filter((e) => e.label === m[1]); if (!hit.length) throw new Error('no event ' + m[1]); base = hit[0].t - off; }
    return base + (m[2] ? (m[2] === '-' ? -1 : 1) * +m[3] : 0);
  };
}

// phases: [{ dur, rec: 'app', segs: [[from, to, weight], ...] } | { dur, clip: 'assets/x.mp4' }]
function buildReel({ client, phases, dir, name }) {
  fs.mkdirSync(dir, { recursive: true });
  const pieces = [], taps = []; let at = 0;
  phases.forEach((ph, k) => {
    const out = `${dir}/${name}_p${k}.mp4`;
    if (ph.clip) {
      const src = abs(client.assets[ph.clip] || ph.clip), d0 = dur(src);
      const vf = ph.fit === 'cover'
        ? `setpts=PTS*${(ph.dur / d0).toFixed(4)},scale=780:1688:force_original_aspect_ratio=increase,crop=780:1688,fps=30,format=yuv420p`
        : `setpts=PTS*${(ph.dur / d0).toFixed(4)},scale=780:1688:force_original_aspect_ratio=decrease,pad=780:1688:(ow-iw)/2:(oh-ih)/2:color=0x0b140e,fps=30,format=yuv420p`;
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', vf, '-an', '-t', ph.dur.toFixed(3), '-c:v', 'libx264', '-crf', '15', '-preset', 'veryfast', out]);
    } else {
      const rec = client.assets.recordings[ph.rec || 'app']; const T = resolver(rec);
      const segs = ph.segs.map(([a, b, w = 1]) => [T(a), T(b), w]); const W = segs.reduce((s, x) => s + x[2], 0);
      const SEG = segs.map(([a, b, w]) => { const target = ph.dur * w / W; return [+a.toFixed(2), +b.toFixed(2), +((b - a) / target).toFixed(3)]; });
      SEG.forEach((s) => { if (s[2] > 4.8 || s[2] < 0.45) log(`warning: phase ${k} speed ${s[2]}x`); });
      run('node', [`${ROOT}/scripts/build_reel.mjs`, abs(rec.video), abs(rec.events), out, out.replace('.mp4', '.events.json')], { env: { ...process.env, SEG_JSON: JSON.stringify(SEG), HOLD: '0' } });
      const e = readJSON(out.replace('.mp4', '.events.json'));
      e.taps.filter((t) => !SKIP_TAPS.has(t.label) && t.x > 0).forEach((t) => taps.push([+(at + t.t).toFixed(3), t.x, t.y]));
    }
    const d = dur(out); pieces.push(out); at += d;
  });
  const list = `${dir}/${name}_list.txt`; fs.writeFileSync(list, pieces.map((p) => `file '${require('path').basename(p)}'`).join('\n'));
  const file = `${dir}/${name}.mp4`;
  run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'tpad=stop_mode=clone:stop_duration=1.5', '-c:v', 'libx264', '-crf', '15', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', file]);
  return { file, dur: dur(file), taps, starts: pieces.map((_, i) => i) };
}
module.exports = { buildReel, resolver };
