const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';

function run(cmd, args, opt = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opt });
  if (r.status !== 0 && !opt.soft) {
    console.error(cmd, args.join(' '), r.stderr || '');
    throw new Error(`Command failed: ${cmd}`);
  }
  return r;
}

function dur(f) {
  return +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
}

function processTake(rawWav, outWav, timingJson, sentences, tempo = 1.08) {
  console.log(`Processing take: ${rawWav} -> ${outWav}`);
  // 1) First remove internal dead silences (> 0.35s) and apply tempo + loudnorm
  const tempWav = outWav.replace('.wav', '.tmp.wav');
  run('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', rawWav,
    '-af', `silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-40dB,atempo=${tempo},loudnorm=I=-14:TP=-1.5:LRA=11`,
    '-ar', '48000', '-ac', '1',
    outWav
  ]);

  const D = dur(outWav);
  console.log(`Output audio duration: ${D.toFixed(2)}s`);

  // 2) Sentence boundaries via silencedetect
  const sil = run('ffmpeg', ['-hide_banner', '-i', outWav, '-af', 'silencedetect=noise=-36dB:d=0.08', '-f', 'null', '-'], { soft: true }).stderr;
  let pauses = [];
  let st = null;
  for (const m of sil.matchAll(/silence_(start|end): ([0-9.]+)/g)) {
    if (m[1] === 'start') st = +m[2];
    else if (st != null) {
      pauses.push([st, +m[2]]);
      st = null;
    }
  }

  // Merge pauses separated by less than 0.08s
  const merged = [];
  for (const p of pauses) {
    const l = merged[merged.length - 1];
    if (l && p[0] - l[1] < 0.08) l[1] = p[1];
    else merged.push([...p]);
  }

  const chars = sentences.map((s) => s.text.replace(/\s+/g, '').length);
  const total = chars.reduce((a, b) => a + b, 0);
  let acc = 0;
  const expected = chars.slice(0, -1).map((c) => (acc += c) / total * D);
  const chosen = [];
  let lastIdx = -1;

  expected.forEach((e, idx) => {
    const cand = [];
    merged.forEach((p, i) => {
      if (i <= lastIdx) return;
      const mid = (p[0] + p[1]) / 2;
      if (Math.abs(mid - e) <= 2.2) {
        cand.push({ i, p, dur: p[1] - p[0], d: Math.abs(mid - e) });
      }
    });
    if (!cand.length) {
      // If no silence found in range, interpolate proportionally
      const fallbackTime = e;
      chosen.push([Math.max(0, fallbackTime - 0.05), fallbackTime + 0.05]);
    } else {
      cand.sort((x, y) => (y.dur - x.dur) || (x.d - y.d));
      chosen.push(cand[0].p);
      lastIdx = cand[0].i;
    }
  });

  const O = 0.15; // voice starts 0.15s into video
  const sentTimings = sentences.map((s, i) => {
    const start = +(O + (i === 0 ? 0 : chosen[i - 1][1])).toFixed(2);
    const end = +(O + (i === sentences.length - 1 ? D : chosen[i][0])).toFixed(2);
    return {
      scene: s.scene,
      text: s.text,
      keyword: s.keyword,
      start,
      end,
      duration: +(end - start).toFixed(2)
    };
  });

  const timingData = {
    totalDuration: +(D + O + 0.35).toFixed(2),
    voiceDuration: +D.toFixed(2),
    sentences: sentTimings
  };

  fs.writeFileSync(timingJson, JSON.stringify(timingData, null, 2), 'utf8');
  console.log('Saved timing:', timingJson);
  console.log(sentTimings.map((s) => `  ${s.scene.padEnd(14)} ${s.start}s -> ${s.end}s (${s.duration}s)`).join('\n'));
  return timingData;
}

module.exports = { processTake };

