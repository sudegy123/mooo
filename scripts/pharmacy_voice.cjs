// Voice for the pharmacy v2: ONE continuous Gemini TTS take of the dialect narration (factory makeVoice: pauses
// normalised, fastest tempo that passes the reading rule, sentence boundaries), then whisper word timings for captions.
// Also writes two short comparison samples (hook + pain) in other voices.
// Usage: node scripts/pharmacy_voice.cjs <narration.json> <outDir> [voice=Fenrir]
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { makeVoice, tts, tidy } = require(path.join(ROOT, 'factory/lib/voice.cjs'));
const { alignWords } = require(path.join(ROOT, 'factory/lib/align.cjs'));
const [nf, OUT, voice = 'Fenrir', lang = 'sd'] = process.argv.slice(2);
const N = JSON.parse(fs.readFileSync(nf, 'utf8'));
const sentences = N.sentences.map((s) => ({ role: s.beat, text: /[.؟?]$/.test(s.text.trim()) ? s.text.trim() : s.text.trim() + '.' }));
const STYLE_SA = 'Speak as a young Saudi woman from Riyadh, a pharmacist, in authentic everyday Saudi Najdi dialect with natural Saudi intonation and rhythm, the way she really talks to a friend: warm, relaxed, confident, slightly smiling, medium pace with small natural breaths between phrases and a short pause after each sentence. Sound like a real person recorded on a phone, not like an announcer or a robot: no theatrical emphasis, no sing-song. Pronounce it the Saudi way (for example ج as in ج, ق as a soft ق/g where Saudis say it), not Standard Arabic, not Egyptian, not Sudanese.';
const STYLE_SD = 'Speak in authentic everyday Sudanese Arabic with a Khartoum accent and Sudanese intonation, like a Sudanese pharmacist chatting with a friend: warm, confident and natural, medium-fast pace, a short natural pause after each sentence. Pronounce it the Sudanese way, not Gulf, not Egyptian, not Standard Arabic.';
const STYLE = lang === 'sa' ? STYLE_SA : STYLE_SD;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const v = await makeVoice({ sentences, dir: OUT, style: STYLE, voice, minTempo: 0.92, maxTempo: 1.12 });
  let al = null; try { al = alignWords(v.file, sentences, OUT, 'ar'); } catch (e) { al = { ok: false, error: e.message }; }
  fs.writeFileSync(path.join(OUT, 'voice.json'), JSON.stringify({ voice, style: STYLE, sentences, ...v, aligned: al && al.ok ? al.words : null, alignRate: al && al.rate }, null, 1));
  console.log(`voice ${voice}: ${v.D.toFixed(2)} s at tempo ${v.tempo}; whisper match ${al && al.rate != null ? Math.round(al.rate * 100) + '%' : 'n/a'}`);
  v.reading.forEach((r, i) => console.log(`  ${r.role.padEnd(8)} ${v.spans[i].start.toFixed(2)}-${v.spans[i].end.toFixed(2)}  reading ${r.have}/${r.need}${r.ok ? '' : ' (!)'}`));
  // comparison samples: hook + pain in two other voices
  for (const alt of (lang === 'sa' ? ['Aoede', 'Leda'] : ['Orus', 'Charon']).filter((x) => x !== voice)) {
    const raw = path.join(OUT, `sample_${alt}_raw.wav`);
    try { tts(sentences.slice(0, 2).map((s) => s.text).join(' '), raw, STYLE, alt); tidy(raw, path.join(OUT, `sample_${alt}.wav`)); console.log('sample', alt, 'ok'); } catch (e) { console.log('sample', alt, 'failed:', e.message); }
  }
})().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
