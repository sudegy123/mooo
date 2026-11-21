// Quality gate before anything is delivered: loudness, silent gaps, black frames, label always on screen,
// first frame not blank (the hook must be visible), reading rule, composition check result.
const { run, dur, loudness, silences, r2 } = require('./util.cjs');

function frameStat(file, t, crop) {
  const e = run('ffmpeg', ['-hide_banner', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `${crop ? `crop=${crop},` : ''}signalstats,metadata=print`, '-f', 'null', '-'], { soft: true }).stderr;
  const g = (k) => { const m = e.match(new RegExp(`lavfi\\.signalstats\\.${k}=([0-9.]+)`)); return m ? +m[1] : null; };
  return { yavg: g('YAVG'), ymin: g('YMIN'), ymax: g('YMAX') };
}

function qa({ file, voiceStart, voiceDur, reading, check, labelOn = true, opener = null, faces = null }) {
  const D = dur(file), L = loudness(file), out = { file, duration: r2(D), checks: [] };
  const add = (name, ok, detail, severe = true) => out.checks.push({ name, ok, detail, severe });
  // TikTok opener rules (docs/tiktok-algorithm-2026-11-12.md): on @sudegy.clients most viewers left at 0:01 on text-slide openers
  if (opener) {
    const t = opener.scene && opener.scene.type;
    add('opening scene is a moving picture, not a text slide', t !== 'title', `scene 0 type: ${t || 'unknown'}`);
    if (opener.hookWords != null) add('hook 6 words or fewer', opener.hookWords <= 6, `${opener.hookWords} words`);
    if (opener.hookEnd != null) add('hook fully spoken by 2.8 s', opener.hookEnd <= 2.8, `${r2(opener.hookEnd)} s`, false);
    add('TikTok cut 15-25 s (longer only for WhatsApp/sales)', D <= 26, `${r2(D)} s`, false);
  }
  // faces stay visible (factory/tools/face_check.cjs result)
  if (faces) {
    if (faces.error) add('faces visible (no card or bubble over eyes and mouth)', false, 'check could not run: ' + faces.error.slice(0, 120), false);
    else {
      const sev = faces.events.filter((e) => e.severe), minor = faces.events.filter((e) => !e.severe);
      add('faces visible (no card or bubble over eyes and mouth)', !sev.length, sev.length ? sev.map((e) => `${e.el} over ${e.who} ${e.from}-${e.to}s ${Math.round(e.cover * 100)}%`).join(', ') : 'none covered');
      if (minor.length) add('faces: small overlaps', false, minor.map((e) => `${e.el} ${Math.round(e.cover * 100)}%`).join(', '), false);
    }
  }
  add('loudness -14 LUFS (±1)', Math.abs(L.I + 14) <= 1, `${L.I} LUFS`);
  add('true peak under -1 dBTP', L.P <= -1.0, `${L.P} dBFS`);
  const gaps = silences(file, -38, 0.9).filter(([a, b]) => a > voiceStart + 0.2 && b < voiceStart + voiceDur - 0.2);
  add('no silent gap > 0.9 s inside the narration', !gaps.length, gaps.length ? gaps.map((g) => `${r2(g[0])}-${r2(g[1])}`).join(', ') : 'none');
  const bd = run('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=0.25:pix_th=0.06', '-an', '-f', 'null', '-'], { soft: true }).stderr;
  const blacks = [...bd.matchAll(/black_start:([0-9.]+) black_end:([0-9.]+)/g)].map((m) => [+m[1], +m[2]]);
  add('no black frames', !blacks.length, blacks.length ? blacks.map((b) => `${r2(b[0])}-${r2(b[1])}`).join(', ') : 'none');
  const f0 = frameStat(file, 0.05);
  add('frame 0 shows content (hook visible, not blank)', f0.ymax - f0.ymin > 60, `luma range ${f0.ymin}-${f0.ymax}`);
  if (labelOn) {
    const misses = []; for (let t = 0.2; t < D - 0.1; t += 1.0) { const s = frameStat(file, t, '360:56:360:1672'); if (!(s.ymin != null && s.ymin < 70)) misses.push(r2(t)); }
    add('demo label visible all the time', !misses.length, misses.length ? 'missing at ' + misses.join(', ') : 'ok');
  }
  if (reading) { const bad = reading.filter((x) => !x.ok); add('reading rule (0.35 s/word + 0.7 s)', !bad.length, bad.length ? bad.map((x) => `${x.role} ${x.have}/${x.need}s`).join(', ') : 'all sentences readable', false); }
  if (check) add('HyperFrames check (lint, runtime, layout, contrast)', check.ok, check.summary);
  out.pass = out.checks.every((c) => c.ok || !c.severe);
  return out;
}
const report = (q) => `| check | result | detail |\n|---|---|---|\n` + q.checks.map((c) => `| ${c.name} | ${c.ok ? 'PASS' : c.severe ? 'FAIL' : 'WARN'} | ${c.detail} |`).join('\n');
module.exports = { qa, report, frameStat };
