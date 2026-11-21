// Voice: ONE continuous Gemini TTS take for the whole script, pauses normalised, then the fastest tempo that still
// passes the reading rule (viral pace without unreadable captions).
const { ROOT, run, dur, silences, words, log, r2, fs } = require('./util.cjs');

function tts(text, out, style, voice = 'Kore') {
  if (voice.startsWith('ar-')) {
    const rateMatch = style && style.match(/\+?\-?\d+%/);
    const rate = rateMatch ? rateMatch[0] : '+10%';
    run('python', [`${ROOT}/scripts/generate_edge_tts.py`, text, out, voice, rate]);
    if (!fs.existsSync(out)) throw new Error('TTS produced no file');
    return out;
  }
  run('node', [`${ROOT}/scripts/gemini_tts.mjs`, text, out, voice, style], { stdio: ['ignore', 'pipe', 'pipe'] });
  if (!fs.existsSync(out)) throw new Error('TTS produced no file');
  return out;
}
// keep every pause at ~0.32 s: long enough to find sentence boundaries, short enough to feel continuous
function tidy(raw, out) {
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.42:stop_silence=0.32:stop_threshold=-45dB', '-ar', '48000', '-ac', '1', out]);
  return out;
}
function retime(src, out, tempo) {
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `atempo=${tempo},loudnorm=I=-16:TP=-1.5:LRA=11`, '-ar', '48000', '-ac', '1', out]);
  return out;
}

// sentence boundaries: the longest pause near each expected end (by letter share), fallback to the N-1 longest pauses
function boundaries(file, sentences) {
  const D = dur(file), P = silences(file);
  const chars = sentences.map((s) => s.text.replace(/\s+/g, '').length), total = chars.reduce((a, b) => a + b, 0);
  let acc = 0; const expected = chars.slice(0, -1).map((c) => (acc += c) / total * D);
  const chosen = []; let last = -1, ok = true;
  for (const e of expected) {
    const cand = P.map((p, i) => ({ p, i, d: Math.abs((p[0] + p[1]) / 2 - e), len: p[1] - p[0] })).filter((c) => c.i > last && c.d <= 1.6 && c.p[0] > 0.2);
    if (!cand.length) { ok = false; break; }
    cand.sort((a, b) => b.len - a.len || a.d - b.d); chosen.push(cand[0].p); last = cand[0].i;
  }
  if (!ok || chosen.length !== expected.length) {
    const inner = P.filter((p) => p[0] > 0.2 && p[1] < D - 0.1);
    const top = [...inner].sort((a, b) => (b[1] - b[0]) - (a[1] - a[0])).slice(0, expected.length).sort((a, b) => a[0] - b[0]);
    if (top.length !== expected.length) throw new Error('could not find sentence boundaries');
    chosen.length = 0; chosen.push(...top);
  }
  const spans = sentences.map((s, i) => ({ role: s.role, start: i === 0 ? 0 : chosen[i - 1][1], end: i === sentences.length - 1 ? lastSpeech(P, D) : chosen[i][0] }));
  return { D, spans, cuts: chosen.map((p) => (p[0] + p[1]) / 2) };
}
const lastSpeech = (P, D) => { const l = P[P.length - 1]; return l && l[1] >= D - 0.05 ? l[0] : D; };

// reading rule: every sentence must stay on screen 0.35 s per word + 0.7 s
function readingCheck(sentences, spans, cuts, tail = 1.2) {
  return sentences.map((s, i) => {
    const from = i === 0 ? 0 : cuts[i - 1], to = i === sentences.length - 1 ? spans[i].end + tail : cuts[i];
    const need = 0.35 * words(s.text).length + 0.7, have = to - from;
    return { role: s.role, words: words(s.text).length, need: r2(need), have: r2(have), ok: have >= need - 0.05 };
  });
}

async function makeVoice({ sentences, dir, style, maxLen, minTempo = 0.95, maxTempo = 1.22, voice = 'Kore', reuseRaw = true }) {
  fs.mkdirSync(dir, { recursive: true });
  const text = sentences.map((s) => s.text).join(' ');
  const raw = `${dir}/voice_raw.wav`, clean = `${dir}/voice_clean.wav`, outp = `${dir}/voice.wav`;
  const key = `${dir}/voice_text.txt`;
  if (!(reuseRaw && fs.existsSync(raw) && fs.existsSync(key) && fs.readFileSync(key, 'utf8') === text + '|' + style + '|' + voice)) {
    tts(text, raw, style || 'warm, clear and confident Standard Arabic, natural pace, short natural pause after each sentence', voice);
    fs.writeFileSync(key, text + '|' + style + '|' + voice);
  }
  tidy(raw, clean);
  const base = dur(clean);
  let pick = null, report = null;
  for (let t = maxTempo; t >= minTempo - 1e-9; t = +(t - 0.04).toFixed(2)) {
    retime(clean, outp, t);
    const b = boundaries(outp, sentences); const rc = readingCheck(sentences, b.spans, b.cuts);
    const fits = !maxLen || b.D + 1.3 <= maxLen;
    report = { tempo: t, D: r2(b.D), reading: rc, fitsLength: fits };
    if (rc.every((x) => x.ok)) { pick = { ...b, tempo: t }; break; }
  }
  if (!pick) { log('reading rule not met even at the slowest tempo; keeping it and flagging the sentences'); retime(clean, outp, minTempo); pick = { ...boundaries(outp, sentences), tempo: minTempo }; }
  log(`voice ${r2(base)}s raw -> tempo ${pick.tempo} -> ${r2(pick.D)}s`);
  return { file: outp, tempo: pick.tempo, D: pick.D, spans: pick.spans, cuts: pick.cuts, reading: readingCheck(sentences, pick.spans, pick.cuts), report };
}

// per-word timing inside each sentence span (letter-weighted estimate)
function wordTimes(sentences, spans, offset) {
  const strip = (w) => w.replace(/[ً-ٰٟ.،؟?!,:؛]/g, '');
  return sentences.map((s, i) => {
    const ws = words(s.text), wt = ws.map((w) => Math.max(2, strip(w).length)), tot = wt.reduce((a, b) => a + b, 0);
    const a0 = spans[i].start, span = spans[i].end - a0; let t = a0 - 0.03;
    return ws.map((_, k) => { const a = t; t += span * wt[k] / tot; return [r2(offset + a), r2(offset + t)]; });
  });
}
module.exports = { makeVoice, boundaries, readingCheck, wordTimes, tts, tidy, retime };
