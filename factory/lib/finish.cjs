// Finishing: music bed with ducking under the voice, two-pass loudness to -14 LUFS / -1.5 dBTP,
// extra formats (1:1 and 16:9 with a blurred fill), SRT captions and a thumbnail.
const { run, dur, r2, fs, abs, loudness } = require('./util.cjs');

function mixMusic(video, music, out, { volume = 0.22, fadeIn = 0.6, fadeOut = 1.6 } = {}) {
  const D = dur(video);
  const fc = `[1:a]aloop=loop=-1:size=2e9,atrim=0:${D.toFixed(2)},asetpts=N/SR/TB,volume=${volume},afade=t=in:d=${fadeIn},afade=t=out:st=${(D - fadeOut).toFixed(2)}:d=${fadeOut}[m];`
    + `[0:a]asplit=2[v][key];[m][key]sidechaincompress=threshold=0.04:ratio=9:attack=8:release=380:makeup=1[md];[v][md]amix=inputs=2:duration=first:normalize=0[a]`;
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', abs(music), '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'pcm_s16le', out.replace(/\.mp4$/, '.mkv')]);
  return out.replace(/\.mp4$/, '.mkv');
}

// two-pass EBU R128 so the true peak stays under the ceiling
function loudnorm(input, out, I = -14, TP = -2.0) {
  const m = run('ffmpeg', ['-hide_banner', '-i', input, '-af', `loudnorm=I=${I}:TP=${TP}:LRA=11:print_format=json`, '-f', 'null', '-'], { soft: true }).stderr;
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  const af = `loudnorm=I=${I}:TP=${TP}:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,alimiter=limit=${(10 ** ((TP - 0.5) / 20)).toFixed(3)}:level=false`;  // TP -2 gives the old 0.749
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-c:v', 'copy', '-af', af, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
  return { out, ...loudness(out) };
}

function formats(master, base) {
  const res = {};
  const mk = (W, H, tag) => {
    const out = `${base}_${tag}.mp4`;
    const fc = `[0:v]split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=28:4,eq=brightness=-0.06[bg];[b]scale=-2:${H}[fg];[bg][fg]overlay=(W-w)/2:0,format=yuv420p[v]`;
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', master, '-filter_complex', fc, '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-c:a', 'copy', '-movflags', '+faststart', out]);
    res[tag] = out;
  };
  mk(1080, 1080, '1x1'); mk(1920, 1080, '16x9');
  return res;
}

const ts = (t) => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, x = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(x).padStart(3, '0')}`; };
function srt(sentences, wt, out) {
  const cues = []; let n = 0;
  sentences.forEach((s, i) => {
    const ws = s.text.trim().split(/\s+/), t = wt[i];
    const chunks = ws.length > 8 ? [[0, Math.ceil(ws.length / 2)], [Math.ceil(ws.length / 2), ws.length]] : [[0, ws.length]];
    chunks.forEach(([a, b]) => { cues.push(`${++n}\n${ts(t[a][0])} --> ${ts(t[b - 1][1] + 0.25)}\n${ws.slice(a, b).join(' ')}\n`); });
  });
  fs.writeFileSync(out, cues.join('\n'));
  return out;
}

function thumbnail(master, out, at = 0.45) {
  run('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(at), '-i', master, '-frames:v', '1', '-q:v', '2', out]);
  return out;
}
function contact(master, out, times) {
  const tmp = times.map((t, k) => { const f = out.replace(/\.jpg$/, `_${k}.jpg`); run('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(t), '-i', master, '-vf', 'scale=270:-1', '-frames:v', '1', f]); return f; });
  run('ffmpeg', ['-y', '-loglevel', 'error', ...tmp.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=inputs=${tmp.length}`, out]);
  tmp.forEach((f) => fs.rmSync(f, { force: true }));
  return out;
}
module.exports = { mixMusic, loudnorm, formats, srt, thumbnail, contact, r2 };
