// Gemini clip pair -> one ad: match cut on the face (A -> B), /effects overlays, Arabic captions, -14 LUFS.
// Spoken lines and overlay words come from the brief (written by the brain: brain_gemini_video.cjs + brain_effects_text.cjs).
// Usage: node scripts/build_gemini_pair.cjs <brief.json> <A.mp4> <aIn> <aOut> <B.mp4> <bIn> <bOut> <outDir>
//   aIn/aOut, bIn/bOut = seconds kept from each clip. The cut lands on aOut -> bIn.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const [briefF, A, aIn, aOut, Bf, bIn, bOut, OUT] = process.argv.slice(2);
if (!OUT) { console.error('usage: node scripts/build_gemini_pair.cjs <brief.json> <A.mp4> <aIn> <aOut> <B.mp4> <bIn> <bOut> <outDir>'); process.exit(2); }
const brief = JSON.parse(fs.readFileSync(briefF, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
const sh = (cmd, args, o = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 26, ...o });
const PY = path.join(ROOT, '.claude/skills/effects/.venv/Scripts/python.exe');
const probe = (f) => JSON.parse(sh('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', f])).streams[0];
const v = probe(A), W = v.width, H = v.height, FPS = eval(v.r_frame_rate);
const fr = (t) => Math.round(+t * FPS) / FPS;   // snap to frames
const a0 = fr(aIn), a1 = fr(aOut), b0 = fr(bIn), b1 = fr(bOut), LA = a1 - a0;

// 1) faces on both sides of the cut (YuNet, bundled with the effects skill)
const face = (f, t) => Object.values(JSON.parse(sh(PY, ['-I', path.join(ROOT, 'scripts/faces.py'), f, String(t)], { stdio: ['ignore', 'pipe', 'ignore'] }).trim()))[0];
const FA = face(A, +(a1 - 1 / FPS).toFixed(3)), FB = face(Bf, b0);
if (!FA || !FB) throw new Error('no face found at the cut');
// brief.minScale: when both sides already match (one locked-off take cut in two), force a visible punch-in so the cut
// reads as a deliberate "before -> after" beat instead of a skipped frame
let s = Math.max(brief.minScale || 1, FA.w / FB.w, FA.cx / FB.cx, (W - FA.cx) / (W - FB.cx), FA.cy / FB.cy, (H - FA.cy) / (H - FB.cy));
s = Math.min(s, 1.6);
const cl = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const x0 = cl(FA.cx - s * FB.cx, W * (1 - s), 0), y0 = cl(FA.cy - s * FB.cy, H * (1 - s), 0);
const miss = Math.hypot(x0 + s * FB.cx - FA.cx, y0 + s * FB.cy - FA.cy);
console.log(`match cut @${LA.toFixed(2)}s: face A ${JSON.stringify(FA)} B ${JSON.stringify(FB)} -> scale ${s.toFixed(3)}, miss ${miss.toFixed(1)} px`);

// 2) join: A, then B starting zoomed on A's face position and relaxing (hold 0.12 s, 0.7 s power2.inOut)
const K = 4, HOLD = 0.12, DUR = 0.7, HEAD = 1.0, t = `(in/${FPS})`, u = `clip((${t}-${HOLD})/${DUR},0,1)`;
const p = `if(lt(${u},0.5),2*${u}*${u},1-pow(-2*${u}+2,2)/2)`, S = `(${s}+(1-${s})*${p})`;
const zx = `${K}*(${-x0}*(1-${p}))/${S}`, zy = `${K}*(${-y0}*(1-${p}))/${S}`;
const joined = path.join(OUT, 'joined.mp4');
const fc = [
  `[0:v]trim=${a0}:${a1},setpts=PTS-STARTPTS[a]`,
  `[1:v]trim=${b0}:${b0 + HEAD},setpts=PTS-STARTPTS,scale=${W * K}:${H * K}:flags=lanczos,zoompan=z='${S}':x='${zx}':y='${zy}':d=1:s=${W}x${H}:fps=${FPS}[bh]`,
  `[1:v]trim=${b0 + HEAD}:${b1},setpts=PTS-STARTPTS[bt]`,
  `[a][bh][bt]concat=n=3:v=1:a=0,format=yuv420p[v]`,
  `[0:a]atrim=${a0}:${a1},asetpts=PTS-STARTPTS,afade=t=out:st=${(LA - 0.02).toFixed(3)}:d=0.02[aa]`,
  `[1:a]atrim=${b0}:${b1},asetpts=PTS-STARTPTS,afade=t=in:d=0.02[ab]`,
  // brief.cutSfx: a short sound on the cut (factory/sfx), peaking just after the cut
  brief.cutSfx ? `[aa][ab]concat=n=2:v=0:a=1[au0];[2:a]adelay=${Math.max(0, Math.round((LA - 0.12) * 1000))}:all=1,volume=${brief.cutSfxVolume || 0.45}[sx];[au0][sx]amix=inputs=2:duration=first:normalize=0[au]` : `[aa][ab]concat=n=2:v=0:a=1[au]`,
].join(';');
sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', A, '-i', Bf, ...(brief.cutSfx ? ['-i', path.resolve(ROOT, brief.cutSfx)] : []), '-filter_complex', fc, '-map', '[v]', '-map', '[au]', '-c:v', 'libx264', '-crf', '16', '-c:a', 'aac', '-b:a', '192k', joined]);
const LB = b1 - b0, END = LA + LB;

// 3) effects (timeline of the joined clip): pain word behind her head in A, feature switches in B, comment word at the end
const ov = brief.overlay || {};
const effects = [];
if (ov.behind) effects.push({ fx: 'spotlight', start: 0, end: +(LA - 0.04).toFixed(2), text: ov.behind });
// the switches card sits under her chin (above the head it hid behind her hijab when the face is high in frame);
// then line B's caption moves to the top so the two never overlap. Shown 4.4 s: 3 rows pass the reading rule.
// with a demo recording (brief.demo) the real screen takes over a little after she starts line B, so the card ends there
const bTalk = LA + Math.max(0, (brief.bSpeech || 0) - b0);
// brief.demo with no segs = only a closing clip (e.g. a third Gemini clip C) behind the CTA, nothing cut into B
const DM = brief.demo, dStart = DM && DM.segs && DM.segs.length ? +(bTalk + (DM.after || 1.5)).toFixed(2) : END;
// brief.captionB = 'bottom' (face high in frame: a top caption would cover it): then the card must end before line B starts
const capBPos = brief.captionB || (ov.rows ? 'top' : 'bottom');
const cardEnd = Math.min(LA + 0.7 + 4.4, dStart - 0.05, capBPos === 'bottom' ? bTalk - 0.1 : Infinity);
if (ov.rows) effects.push({ fx: 'apple-toggles', start: +(LA + 0.7).toFixed(2), end: +cardEnd.toFixed(2), text: ov.rows.join('|'), pos: 'below' });
// comment-box only on request (brief.useComment): its panel shows a handle and a reply, which must be Sudegy's own words
if (ov.comment && brief.useComment) effects.push({ fx: 'comment-box', start: +(END - 2.4).toFixed(2), end: +(END - 0.05).toFixed(2), text: ov.comment, handle: 'sudegy', reply: ov.reply, chip: ov.chip });
const fxOut = path.join(OUT, 'fx.mp4');
console.log('effects:', effects.map((e) => `${e.fx} ${e.start}-${e.end}`).join(', '));
require(path.join(ROOT, 'factory/tools/effects.cjs')).applyEffects(joined, effects, fxOut);

// 3b) optional real product demo (brief.demo = { file, after, segs: [[from,to],...], tail: [from,to] }):
//     from dStart until her line ends, the picture cuts to the screen recording (sped up to fit) while her voice goes on;
//     then the recording keeps playing at normal speed under the closing CTA (brief.overlay.cta), with a music bed.
let main = fxOut, TOTAL = END, ctaWin = null;
if (DM) {
  DM.segs = DM.segs || [];
  const fps = 24, M = END - dStart, N = DM.segs.reduce((a, [f, t]) => a + (t - f), 0), sp = M > 0 ? N / M : 1;
  // DM.tailSpeed < 1 slows the closing shot so the CTA gets its reading time when the clip runs out
  const tSp = DM.tailSpeed || 1, tail = DM.tail ? (DM.tail[1] - DM.tail[0]) / tSp : 0;
  const fit = `fps=${fps},scale=1080:-2:flags=lanczos,crop=1080:1920,setsar=1,format=yuv420p`;
  const parts = [`[0:v]trim=0:${dStart},setpts=PTS-STARTPTS,fps=${fps},setsar=1,format=yuv420p[p0]`];
  // slow centred push-in on the recording after its first segment: pages that sit still (summary, chat) never freeze
  const push = (rate) => `,zoompan=z='min(1+${rate}*on,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=${fps}`;
  DM.segs.forEach(([f, t], i) => parts.push(`[1:v]trim=${f}:${t},setpts=(PTS-STARTPTS)/${sp.toFixed(4)},${fit}${i ? push(0.004) : ''}[d${i}]`));
  // DM.blurTop: blur the top N px of the tail (e.g. a phone number in a chat header), then dim it under the CTA
  if (tail) parts.push(`[1:v]trim=${DM.tail[0]}:${DM.tail[1]},setpts=(PTS-STARTPTS)/${tSp},${fit}${DM.blurTop ? `,split[t0][t1];[t1]crop=1080:${DM.blurTop}:0:0,boxblur=28:3[tb];[t0][tb]overlay=0:0` : ''}${push(0.0015)},drawbox=x=0:y=0:w=iw:h=ih:color=black@0.5:t=fill[tl]`);
  const ins = ['[p0]', ...DM.segs.map((_, i) => `[d${i}]`), ...(tail ? ['[tl]'] : [])];
  parts.push(`${ins.join('')}concat=n=${ins.length}:v=1:a=0[v]`);
  parts.push(`[0:a]apad=pad_dur=${tail.toFixed(2)}[a]`);
  main = path.join(OUT, 'demo.mp4');
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', fxOut, '-i', path.resolve(ROOT, DM.file), '-filter_complex', parts.join(';'), '-map', '[v]', '-map', '[a]', '-t', (END + tail).toFixed(2), '-c:v', 'libx264', '-crf', '16', '-c:a', 'pcm_s16le', main.replace(/\.mp4$/, '.mkv')]);
  main = main.replace(/\.mp4$/, '.mkv');
  TOTAL = END + tail; if (tail && ov.cta) ctaWin = [END, TOTAL - 0.05];
  console.log(`demo: ${M.toFixed(2)} s of recording at ${sp.toFixed(2)}x from ${dStart}s, tail ${tail.toFixed(2)} s`);
}
// music bed under everything (ducked under her voice), so the closing card is not silent
if (brief.music) main = require(path.join(ROOT, 'factory/lib/finish.cjs')).mixMusic(main, brief.music, path.join(OUT, 'mix.mp4'), { volume: brief.musicVolume || 0.18 });

// 4) Arabic captions (libass shapes Arabic) + loudness. Line A shows from frame 0 (hook rule); line B from when she
//    starts speaking in clip B (brief.bSpeech, measured with silencedetect), to the end.
// break a two-part line at its comma, so the caption never splits a phrase («البديل في / الشاشة»). Each line starts
// with a right-to-left mark: after a manual \N libass otherwise lays a line out left-to-right (words reversed).
const RLM = '‏';
const capText = (s) => RLM + s.replace(/\.$/, '').replace(/،\s*/, `،\\N${RLM}`);
const ts = (x) => { const h = Math.floor(x / 3600), m = Math.floor(x / 60) % 60, sec = (x % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${sec}`; };
const ass = path.join(OUT, 'captions.ass');
const capA = [0, LA - 0.04], capB = [LA + Math.max(0, (brief.bSpeech || 0) - b0), END - 0.05];
fs.writeFileSync(ass, `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Segoe UI,64,&H00FFFFFF,&H00FFFFFF,&H64000000,&H8C000000,1,0,0,0,100,100,0,0,3,18,0,2,90,90,520,178
Style: CapTop,Segoe UI,64,&H00FFFFFF,&H00FFFFFF,&H64000000,&H8C000000,1,0,0,0,100,100,0,0,3,18,0,8,90,90,240,178
Style: Cta,Segoe UI,80,&H00FFFFFF,&H00FFFFFF,&H006E760F,&H006E760F,1,0,0,0,100,100,0,0,3,26,0,5,110,110,0,178
Style: Brand,Segoe UI,46,&H00FFFFFF,&H00FFFFFF,&H64000000,&H00000000,1,0,0,0,100,100,0,0,1,3,0,2,90,90,330,178

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,${ts(capA[0])},${ts(capA[1])},Cap,,0,0,0,,${capText(brief.lineA)}
Dialogue: 0,${ts(capB[0])},${ts(capB[1])},${capBPos === 'top' ? 'CapTop' : 'Cap'},,0,0,0,,${capText(brief.lineB)}
${ctaWin ? `Dialogue: 1,${ts(ctaWin[0])},${ts(ctaWin[1])},Cta,,0,0,0,,{\\fad(180,0)}${ov.cta}
Dialogue: 1,${ts(ctaWin[0])},${ts(ctaWin[1])},Brand,,0,0,0,,{\\fad(180,0)}Sudegy | سوديجي
` : ''}`);
const final = path.join(OUT, 'ad_9x16.mp4');
const assArg = ass.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '$1\\:');
// burn captions, then the factory's two-pass loudness (-14 LUFS, true peak under -2 dB)
const burned = path.join(OUT, 'burned.mkv');
sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', main, '-vf', `ass='${assArg}'`, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', burned]);
const Fin = require(path.join(ROOT, 'factory/lib/finish.cjs'));
let L = Fin.loudnorm(burned, final);
// a high crest (loud speech peaks in Gemini audio, whoosh, music swells) can stop linear loudnorm below target:
// even the level out first (dynaudnorm), then normalise again. Measured on the pharmacy ad: -15.1 -> -14.6 LUFS.
if (L.I < -15) {
  const comp = path.join(OUT, 'burned_comp.mkv');
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', burned, '-c:v', 'copy', '-af', 'dynaudnorm=f=150:g=15', '-c:a', 'pcm_s16le', comp]);
  L = Fin.loudnorm(comp, final);
}
console.log(`loudness ${L.I} LUFS, peak ${L.P}`);

// 5) check frames: frame 0, both sides of the cut, each effect's middle, the end
const at = [0.05, LA - 0.04, LA + 0.01, LA + 0.5, ...effects.map((e) => (e.start + e.end) / 2),
  ...(DM ? [dStart + 0.2, (dStart + END) / 2, END - 0.3] : []), ...(ctaWin ? [(ctaWin[0] + ctaWin[1]) / 2] : []), TOTAL - 0.3].map((x) => +x.toFixed(2));
const shots = at.map((x, i) => { const f = path.join(OUT, `chk_${i}.png`); sh('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(x), '-i', final, '-frames:v', '1', '-vf', 'scale=270:-1', f]); return f; });
sh('ffmpeg', ['-y', '-loglevel', 'error', ...shots.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=${shots.length}`, path.join(OUT, 'check.jpg')]);
shots.forEach((f) => fs.unlinkSync(f));
fs.writeFileSync(path.join(OUT, 'build.json'), JSON.stringify({ brief: briefF, A, aIn: a0, aOut: a1, B: Bf, bIn: b0, bOut: b1, cut: LA, scale: s, miss, effects, checkAt: at, END, TOTAL, demo: DM || null, cta: ctaWin }, null, 1));
console.log(`done: ${final} (${TOTAL.toFixed(2)} s); check frames at ${at.join(', ')} -> ${path.join(OUT, 'check.jpg')}`);
