// Real word timings for the karaoke captions: whisper.cpp (free, local, G:) transcribes the final voice take,
// then a sequence alignment maps every script word to a recognised word (spelling may differ slightly).
// Unmatched words are interpolated by letter count. Falls back to the letter estimate if the match rate is low.
const { ROOT, run, fs, r2, readJSON } = require('./util.cjs');
const CLI = `${ROOT}/tools/whisper/bin/Release/whisper-cli.exe`, MODEL = `${ROOT}/tools/whisper/models/ggml-small.bin`;
const available = () => fs.existsSync(CLI) && fs.existsSync(MODEL);

const norm = (w) => String(w).toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[.،؟?!,:؛«»"'()\-]/g, '')
  .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').trim();
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
const sim = (a, b) => { const A = norm(a), B = norm(b); if (!A || !B) return 0; return 1 - lev(A, B) / Math.max(A.length, B.length); };

function transcribe(wav, dir, lang = 'ar') {
  const w16 = `${dir}/voice16k.wav`, base = `${dir}/whisper`;
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ar', '16000', '-ac', '1', w16]);
  try { const fd = fs.openSync(w16, 'r'); fs.closeSync(fd); } catch (_) {}
  run(CLI, ['-m', MODEL, '-l', lang === 'en' ? 'en' : 'ar', '-f', w16, '-t', '4', '-ml', '1', '-sow', '-oj', '-of', base, '-np'], { timeout: 600000 });
  const j = readJSON(`${base}.json`);
  return (j.transcription || []).map((s) => ({ text: s.text.trim(), a: s.offsets.from / 1000, b: s.offsets.to / 1000 })).filter((x) => norm(x.text));
}

// global alignment (Needleman-Wunsch) of script words to recognised words
function alignSeq(S, R) {
  const n = S.length, m = R.length, GAP = 0.75;
  const D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), P = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  for (let i = 1; i <= n; i++) { D[i][0] = i * GAP; P[i][0] = 1; } for (let j = 1; j <= m; j++) { D[0][j] = j * GAP; P[0][j] = 2; }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const s = sim(S[i - 1], R[j - 1].text), diag = D[i - 1][j - 1] + (1 - s) * 1.2, up = D[i - 1][j] + GAP, left = D[i][j - 1] + GAP;
    if (diag <= up && diag <= left) { D[i][j] = diag; P[i][j] = 0; } else if (up <= left) { D[i][j] = up; P[i][j] = 1; } else { D[i][j] = left; P[i][j] = 2; }
  }
  const map = new Array(n).fill(null); let i = n, j = m;
  while (i > 0 && j > 0) { if (P[i][j] === 0) { if (sim(S[i - 1], R[j - 1].text) >= 0.5) map[i - 1] = j - 1; i--; j--; } else if (P[i][j] === 1) i--; else j--; }
  return map;
}

// returns per-sentence word timings relative to the voice file, or null if the match is too weak
function alignWords(voiceFile, sentences, dir, lang = 'ar') {
  if (!available()) return null;
  const R = transcribe(voiceFile, dir, lang);
  const words = sentences.flatMap((s, si) => s.text.trim().split(/\s+/).map((w) => ({ w, si })));
  const map = alignSeq(words.map((x) => x.w), R);
  const hit = map.filter((x) => x != null).length;
  if (hit < words.length * 0.55) return { ok: false, rate: r2(hit / words.length) };
  const T = words.map((x, k) => (map[k] != null ? [R[map[k]].a, R[map[k]].b] : null));
  // interpolate gaps by letter weight between known neighbours
  for (let k = 0; k < T.length; k++) {
    if (T[k]) continue; let e = k; while (e < T.length && !T[e]) e++;
    const t0 = k > 0 ? T[k - 1][1] : 0, t1 = e < T.length ? T[e][0] : (T[k - 1] ? T[k - 1][1] + 0.5 : 0.5);
    const len = words.slice(k, e).map((x) => Math.max(2, norm(x.w).length)), tot = len.reduce((a, b) => a + b, 0); let t = t0;
    for (let q = k; q < e; q++) { const d = (t1 - t0) * len[q - k] / tot; T[q] = [t, t + d]; t += d; }
    k = e - 1;
  }
  const out = sentences.map(() => []); words.forEach((x, k) => out[x.si].push([r2(T[k][0]), r2(Math.max(T[k][1], T[k][0] + 0.08))]));
  return { ok: true, rate: r2(hit / words.length), words: out };
}
module.exports = { alignWords, available };
