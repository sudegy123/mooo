// Sudegy edit pipeline for an EXISTING video (client or generated). One command, everything local except the optional critic.
//   node factory/edit/run_edit.cjs <input.mp4> --id <name> [--lang ar] [--terms "..."] [--tail 0.7] [--style tight] [--critic] [--no-render]
// Steps: probe+diagnose -> transcribe (whisper.cpp) -> plan+cut (video-editing-skill) -> reframe 9:16/1:1/16:9 + tail pad
//        -> loudness -14 LUFS -> SRT (draft) -> thumbnail + contact sheet -> QA gate -> optional independent critic -> report.md
// Output: out/edit/<id>/ (NOT READY_TO_SEND: the owner decides what is delivered). Reuses factory/lib (finish, qa, util).
const { ROOT, run, dur, readJSON, writeJSON, log, r2, silences, loudness, fs, path } = require('../lib/util.cjs');
const F = require('../lib/finish.cjs');
const { qa, report: qaReport, frameStat } = require('../lib/qa.cjs');

const argv = process.argv.slice(2);
const input = argv.find((a) => /\.(mp4|mov|mkv|webm|m4v)$/i.test(a));
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const flag = (k) => argv.includes(k);
if (!input) { console.error('usage: node factory/edit/run_edit.cjs <input.mp4> --id <name> [--lang ar] [--terms "..."] [--tail 0.7] [--style tight] [--critic] [--no-render]'); process.exit(2); }
const id = opt('--id', path.basename(input).replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_'));
const lang = opt('--lang', 'ar'), TAIL = +opt('--tail', 0.7), style = opt('--style', 'tight');
const W = `${ROOT}/factory/edit/work/${id}`, OD = `${ROOT}/out/edit/${id}`;
const KIT = `${ROOT}/.claude/skills/video-editing-skill/scripts`;
fs.mkdirSync(W, { recursive: true }); fs.mkdirSync(OD, { recursive: true });
const SRC = `${W}/input${path.extname(input).toLowerCase()}`;
if (!fs.existsSync(SRC)) fs.copyFileSync(input, SRC);   // the original is never touched
const py = (args) => run('python', ['-I', ...args], { soft: true });

function probe(f) {
  const j = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate:stream_side_data=rotation:format=duration,size', '-of', 'json', f]).stdout);
  const v = j.streams.find((s) => s.codec_type === 'video') || {}, a = j.streams.find((s) => s.codec_type === 'audio');
  const [n, d] = (v.r_frame_rate || '30/1').split('/');
  // phone videos are often stored landscape with a rotation flag; the picture people see is the rotated one
  const rot = Math.abs(((v.side_data_list || []).find((x) => x.rotation !== undefined) || {}).rotation || 0);
  const turned = rot === 90 || rot === 270;
  return { w: turned ? v.height : v.width, h: turned ? v.width : v.height, fps: +(n / (d || 1)).toFixed(2), dur: +j.format.duration, size: +j.format.size, audio: !!a };
}
function frozen(f) {
  const e = run('ffmpeg', ['-hide_banner', '-i', f, '-vf', 'fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-an', '-f', 'null', '-'], { soft: true }).stderr;
  const ys = [...e.matchAll(/YAVG=([0-9.]+)/g)].map((m) => +m[1]); const out = []; let s = null;
  ys.forEach((y, i) => { if (y < 0.35) { if (s == null) s = i; } else if (s != null) { if (i - s >= 6) out.push([s / 10, i / 10]); s = null; } });
  if (s != null && ys.length - s >= 6) out.push([s / 10, ys.length / 10]);
  return out;
}
function blacks(f) {
  const e = run('ffmpeg', ['-hide_banner', '-i', f, '-vf', 'blackdetect=d=0.2:pix_th=0.06', '-an', '-f', 'null', '-'], { soft: true }).stderr;
  return [...e.matchAll(/black_start:([0-9.]+) black_end:([0-9.]+)/g)].map((m) => [+m[1], +m[2]]);
}
const fmtR = (r) => (r.length ? r.map((x) => `${r2(x[0])}-${r2(x[1])}s`).join(', ') : 'none');

// 1) diagnose the input (measure, never judge taste)
function diagnose(f, tr) {
  const p = probe(f), L = p.audio ? loudness(f) : null, sil = p.audio ? silences(f, -38, 0.4) : [], bl = blacks(f), fz = frozen(f);
  const lastWord = tr && tr.words.length ? tr.words[tr.words.length - 1].end : null, firstWord = tr && tr.words.length ? tr.words[0].start : null;
  const checks = [];
  const add = (name, ok, detail, sev = 'high') => checks.push({ name, ok, detail, sev });
  add('has audio', p.audio, p.audio ? 'yes' : 'NO AUDIO TRACK');
  add('aspect 9:16 for phone delivery', p.h > p.w, `${p.w}x${p.h}`, 'med');
  add('resolution at least 1080 wide', Math.min(p.w, p.h) >= 1080 || p.w >= 1920, `${p.w}x${p.h} (${p.fps} fps)`, 'low');
  if (L) { add('loudness -14 LUFS (±1)', Math.abs(L.I + 14) <= 1, `${L.I} LUFS`, 'med'); add('true peak under -1 dBTP', L.P <= -1, `${L.P} dBFS`, 'med'); }
  add('no silent gap over 0.4 s', !sil.length, fmtR(sil), 'med');
  add('no black frames', !bl.length, fmtR(bl));
  add('no frozen picture over 0.6 s', !fz.length, fmtR(fz), 'med');
  const f0 = frameStat(f, 0.05); add('frame 0 shows content', f0.ymax - f0.ymin > 60, `luma range ${f0.ymin}-${f0.ymax}`);
  if (lastWord != null) {
    add('breathing room after the last spoken word (>= 0.6 s)', p.dur - lastWord >= 0.6, `${r2(p.dur - lastWord)} s after the last word`, 'med');
    add('voice starts within 0.6 s (no dead opening)', firstWord <= 0.6, `first word at ${r2(firstWord)} s`, 'low');
  }
  return { probe: p, loud: L, silences: sil, blacks: bl, frozen: fz, checks };
}
const table = (cs) => '| check | result | detail |\n|---|---|---|\n' + cs.map((c) => `| ${c.name} | ${c.ok ? 'PASS' : c.sev === 'low' ? 'NOTE' : 'FIX'} | ${c.detail} |`).join('\n');

// frame-accurate reframe: foreground fitted, blurred copy fills the rest; tail pad = last frame held + silence
function reframe(src, out, Wd, Hd, tail) {
  const D = probe(src).dur;
  const fc = `[0:v]split[a][b];[a]scale=${Wd}:${Hd}:force_original_aspect_ratio=increase,crop=${Wd}:${Hd},boxblur=28:4,eq=brightness=-0.06[bg];`
    + `[b]scale=${Wd}:${Hd}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,tpad=stop_mode=clone:stop_duration=${tail},format=yuv420p[v];[0:a]apad=pad_dur=${tail}[a]`;
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', (D + tail).toFixed(3), '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '192k', out]);
  return out;
}

(async () => {
  const t0 = Date.now();
  log(`input ${input}`);
  // 2) transcribe locally
  const trDir = `${W}/tr`;
  const targs = [`${KIT}/transcribe_cpp.py`, SRC, '--out', trDir, '--lang', lang]; if (opt('--terms')) targs.push('--terms', opt('--terms'));
  const tr0 = py(targs); if (tr0.status !== 0) log('transcription failed: ' + (tr0.stderr || tr0.stdout).slice(-300));
  const tr = fs.existsSync(`${trDir}/transcript.json`) ? readJSON(`${trDir}/transcript.json`) : null;
  if (tr) log(`transcript: ${tr.words.length} words (${tr.source})`);

  // 3) diagnose BEFORE
  const before = diagnose(SRC, tr);
  log('diagnose (input):\n' + table(before.checks));

  // 4) plan + cut (video-editing-skill). Zero cuts is a valid answer.
  const cfg = { video: SRC, style, punch_in: 0, retakes: false, stutters: false, captions: { srt: true, burn: false }, audio: { denoise: false, lufs: -14 }, ...(fs.existsSync(`${W}/edit.extra.json`) ? readJSON(`${W}/edit.extra.json`) : {}) };
  writeJSON(`${W}/edit.json`, cfg);
  const pl = py([`${KIT}/edit_video.py`, `${W}/edit.json`, '--transcript', `${trDir}/transcript.json`, '--out', `${W}/edited`, '--plan']);
  const plan = fs.existsSync(`${W}/edited/edit-plan.md`) ? fs.readFileSync(`${W}/edited/edit-plan.md`, 'utf8') : '(plan failed) ' + pl.stderr.slice(-300);
  log('plan: ' + (plan.split('\n').find((l) => /->/.test(l)) || '').trim());
  if (flag('--no-render')) { fs.writeFileSync(`${OD}/diagnose.md`, `# Diagnose — ${id}\n\n${table(before.checks)}\n\n${plan}`); return; }
  const rn = py([`${KIT}/edit_video.py`, `${W}/edit.json`, '--transcript', `${trDir}/transcript.json`, '--out', `${W}/edited`]);
  const edited = `${W}/edited/edited.mp4`; if (!fs.existsSync(edited)) throw new Error('edit render failed: ' + rn.stderr.slice(-500));

  // 5) reframe to 9:16, 1:1, 16:9 with tail pad, then -14 LUFS on each (video copied)
  const outs = {};
  for (const [tag, wd, hd] of [['9x16', 1080, 1920], ['1x1', 1080, 1080], ['16x9', 1920, 1080]]) {
    const tmp = `${W}/${id}_${tag}_pre.mp4`, fin = `${OD}/${id}_${tag}.mp4`;
    reframe(edited, tmp, wd, hd, TAIL); let L = F.loudnorm(tmp, fin); if (L.P > -1.0) L = F.loudnorm(tmp, fin, -14, -3.5);  /* AAC can overshoot a quiet source that needed a big boost */ outs[tag] = { file: fin, ...L }; log(`${tag}: ${fin} (${L.I} LUFS, ${L.P} dBTP)`);
  }
  const master = outs['9x16'].file;
  // 6) captions (draft), thumbnail, contact sheet
  const srtSrc = `${W}/edited/captions.srt`; if (fs.existsSync(srtSrc)) fs.copyFileSync(srtSrc, `${OD}/${id}.srt`);
  F.thumbnail(master, `${OD}/${id}_thumb.jpg`);
  const D = dur(master); F.contact(master, `${OD}/${id}_sheet.jpg`, Array.from({ length: 8 }, (_, i) => r2(0.2 + (D - 0.4) * i / 7)));
  // 7) QA gate on the master + diagnose AFTER
  const lw = tr && tr.words.length ? tr.words[tr.words.length - 1].end : 0, fw = tr && tr.words.length ? tr.words[0].start : 0;
  const q = qa({ file: master, voiceStart: fw, voiceDur: Math.max(0.1, lw - fw), reading: null, check: null, labelOn: false });
  const after = diagnose(master, tr);
  log(`QA ${q.pass ? 'PASS' : 'FAIL'}`);

  // 8) optional independent critic (uploads the OUTPUT video to Gemini with the owner's own key; off unless --critic)
  let criticNote = 'not run (add --critic; it uploads the output video to Google Gemini)';
  if (flag('--critic')) {
    const cr = run('node', [`${ROOT}/scripts/gemini_critic.mjs`, master, `${OD}/critic.md`, 'gemini-3.8-flash', String(Math.round(D))], { soft: true, env: { ...process.env, CRITIC_AUDIO: '1' } });
    criticNote = cr.status === 0 && fs.existsSync(`${OD}/critic.md`) ? `done: ${id}/critic.md` : 'failed: ' + (cr.stderr || cr.stdout).slice(-300);
    log('critic ' + criticNote);
  }

  // 9) report
  const f = (n) => (n == null ? '-' : r2(n));
  const md = [`# ${id} — edit report`, `Input: \`${input}\` (kept untouched; working copy in factory/edit/work/${id}/). Finished in ${Math.round((Date.now() - t0) / 1000)} s on this machine, local only.`, '',
    '## Before → after', '| | before | after (9:16 master) |', '|---|---|---|',
    `| size | ${before.probe.w}x${before.probe.h} | 1080x1920 |`, `| duration | ${f(before.probe.dur)} s | ${f(after.probe.dur)} s |`,
    `| loudness | ${before.loud ? before.loud.I : '-'} LUFS | ${after.loud ? after.loud.I : '-'} LUFS |`, `| true peak | ${before.loud ? before.loud.P : '-'} dBFS | ${after.loud ? after.loud.P : '-'} dBFS |`, '',
    '## Diagnose of the INPUT (measured)', table(before.checks), '',
    '## Edit plan (video-editing-skill)', plan.replace(/^# .*\n/, ''), '',
    '## Transcript (whisper.cpp small, local) — DRAFT, proofread before any caption is used', '```', tr ? fs.readFileSync(`${trDir}/transcript.txt`, 'utf8') : '(none)', '```', '',
    '## QA gate on the delivered 9:16 master', qaReport(q), '', '## Independent critic', criticNote, '',
    '## Files', ...Object.values(outs).map((o) => `- ${path.basename(o.file)}`), `- ${id}.srt (draft), ${id}_thumb.jpg, ${id}_sheet.jpg`, '',
    '## What the tool CANNOT check by itself', '- Claims, prices, numbers and faces on screen versus AGENTS.md rules 2 and 3 (no OCR here): use `--critic` or read the frames.', '- Arabic transcript accuracy: whisper small mishears; do not publish the SRT without proofreading.'].join('\n');
  fs.writeFileSync(`${OD}/report.md`, md); fs.writeFileSync(`${OD}/diagnose_input.md`, `# Diagnose — ${id}\n\n${table(before.checks)}\n`);
  log(`done -> ${OD}`);
})().catch((e) => { console.error('[edit] ERROR', e.stack || e.message); process.exit(1); });
