// Sudegy video factory — one command from a job file to delivered, checked videos.
// Usage: node factory/run.cjs factory/jobs/<job>.json [--variants N] [--redo-copy] [--no-render] [--preview] [--music <file|none>]
//   copy -> voice -> reels -> compose -> check -> (preview) -> render -> finish -> qa -> deliver, per hook variant.
const { ROOT, run, readJSON, writeJSON, abs, hash, log, fs, r2 } = require('./lib/util.cjs');
const { writeScript, writePost, gateSentences } = require('./lib/copy.cjs');
const { makeVoice } = require('./lib/voice.cjs');
const { buildReel } = require('./lib/reels.cjs');
const { compose, planTimes } = require('./lib/compose.cjs');
const F = require('./lib/finish.cjs');
const { qa, report } = require('./lib/qa.cjs');

const argv = process.argv.slice(2);
const jobFile = argv.find((a) => a.endsWith('.json'));
const flag = (k) => argv.includes(k);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
if (!jobFile) { console.error('usage: node factory/run.cjs factory/jobs/<job>.json [--variants N] [--redo-copy] [--no-render] [--preview]'); process.exit(2); }

const HF = (args, outLog) => run('powershell', ['-NoProfile', '-File', `${ROOT}/scripts/hf.ps1`, ...args], { soft: true, ...(outLog ? {} : {}) });
const clean = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');

(async () => {
  const job = readJSON(abs(jobFile));
  const client = readJSON(`${ROOT}/factory/clients/${job.client}.json`);
  const formats = readJSON(`${ROOT}/factory/formats.json`);
  const format = formats[job.format]; if (!format) throw new Error('unknown format ' + job.format);
  const W = `${ROOT}/factory/work/${job.id}`; fs.mkdirSync(W, { recursive: true });
  const O = job.voiceStart != null ? job.voiceStart : 0.25;
  // TikTok opener rule (docs/tiktok-algorithm-2026-11-12.md, AGENTS.md section 8): text-slide openers lost most viewers at 0:01.
  // Stop before spending API calls or render time; the owner can still ask for one with --allow-title-opener.
  const s0 = (job.scenes || [])[0];
  if (s0 && s0.type === 'title' && !flag('--allow-title-opener')) throw new Error('scene 0 is a "title" text slide. Start with a moving picture instead: a "stage" scene with a character acting from the first frame, a "phone" scene with the real screen, or "media". See docs/tiktok-algorithm-2026-11-12.md. Override only if the owner asks: --allow-title-opener');

  // 1) copy: written by the brain (cached) or supplied in the job
  let script;
  const scriptFile = `${W}/script.json`;
  if (job.script) {
    const sentences = job.script.map((t, i) => (typeof t === 'string' ? { role: format.roles[i].role, text: t } : t));
    const p = gateSentences({ sentences, format, client, lang: job.lang || 'ar', allowDigits: job.allowDigits });
    if (p.length) throw new Error('job script fails the gates: ' + p.join('; '));
    script = { sentences, hooks: job.hooks || [] };
  } else if (fs.existsSync(scriptFile) && !flag('--redo-copy')) script = readJSON(scriptFile);
  else { script = await writeScript({ job, client, format }); writeJSON(scriptFile, script); }
  log('script:\n' + script.sentences.map((s) => `  ${s.role.padEnd(9)} ${s.text}   [${s.keyword || ''}]`).join('\n'));
  if (script.hooks && script.hooks.length) log('alternative hooks:\n' + script.hooks.map((h, i) => `  h${i + 2}: ${h.text}${h.pattern ? `   [${h.pattern}${h.score != null ? ', score ' + h.score : ''}]` : ''}`).join('\n'));
  if (flag('--copy-only')) return;

  const nVar = Math.min(+opt('--variants', job.variants && job.variants.hooks || 1), 1 + (script.hooks || []).length);
  const delivered = [];
  for (let v = 1; v <= nVar; v++) {
    const sentences = script.sentences.map((s) => ({ ...s }));
    if (v > 1) { const h = script.hooks[v - 2]; sentences[0] = { ...sentences[0], text: h.text, keyword: h.keyword, pattern: h.pattern || null, hookScore: h.score != null ? h.score : null }; }
    const VD = `${W}/v${v}`; fs.mkdirSync(VD, { recursive: true });
    log(`---- variant ${v}: ${sentences[0].text}`);

    // 2) voice (one take, fastest readable tempo)
    const voice = await makeVoice({ sentences, dir: VD, style: job.voiceStyle, maxLen: format.length[1] + 2, minTempo: job.minTempo || 0.95, maxTempo: job.maxTempo || 1.22, voice: job.voice || 'Kore' });
    log('reading: ' + voice.reading.map((x) => `${x.role} ${x.have}/${x.need}${x.ok ? '' : ' (!)'}`).join(' | '));
    // real word timings for the karaoke (whisper.cpp on G:), cached per voice take
    if (!flag('--no-align')) {
      const cacheA = `${VD}/aligned.json`, vkey = hash(fs.statSync(voice.file).size + ':' + sentences.map((s) => s.text).join('|'));
      let al = fs.existsSync(cacheA) && readJSON(cacheA).key === vkey ? readJSON(cacheA) : null;
      if (!al) { try { const t0 = Date.now(); al = { key: vkey, ...(require('./lib/align.cjs').alignWords(voice.file, sentences, VD, job.lang || 'ar') || { ok: false }) }; al.secs = Math.round((Date.now() - t0) / 1000); writeJSON(cacheA, al); } catch (e) { al = { ok: false, error: e.message }; } }
      if (al.ok) { voice.aligned = al.words; log(`karaoke: real word timings (whisper match ${Math.round(al.rate * 100)}%)`); } else log('karaoke: estimated word timings (' + (al.error || `whisper match ${Math.round((al.rate || 0) * 100)}%`) + ')');
    }

    // 3) plan the scene windows, then build phone reels for each phone group
    const scenes = JSON.parse(JSON.stringify(job.scenes));
    planTimes({ sentences, voice, O, scenes });
    const reels = {};
    const groups = {}; scenes.forEach((s) => { if (s.type === 'phone') (groups[s.group || 'p'] = groups[s.group || 'p'] || []).push(s); });
    for (const [g, list] of Object.entries(groups)) {
      const phases = [];
      list.forEach((s, k) => {
        const d0 = s.w[1] - s.w[0] - (k === 0 ? 0.15 : 0) - (k === list.length - 1 ? 0.25 : 0);
        const parts = s.phases || [s.clip ? { clip: s.clip } : { rec: s.rec || 'app', segs: s.segs }];   // a scene may be split into several phases
        const W = parts.reduce((a, p) => a + (p.weight || 1), 0);
        parts.forEach((p) => phases.push(p.clip ? { dur: d0 * (p.weight || 1) / W, clip: p.clip } : { dur: d0 * (p.weight || 1) / W, rec: p.rec || 'app', segs: p.segs }));
      });
      const key = hash(phases); const cacheF = `${VD}/reel_${g}.json`;
      if (fs.existsSync(cacheF) && readJSON(cacheF).key === key && fs.existsSync(readJSON(cacheF).file)) reels[g] = readJSON(cacheF);
      else { reels[g] = { key, ...buildReel({ client, phases, dir: `${VD}/reels`, name: `ph_${g}` }) }; writeJSON(cacheF, reels[g]); }
      log(`phone ${g}: reel ${r2(reels[g].dur)}s, taps ${reels[g].taps.length}`);
    }

    // 4) compose + check
    const name = `${job.id}_v${v}`, CD = `${ROOT}/compositions/f-${job.id}-v${v}`;
    const comp = compose({ job, client, sentences, voice, O, scenes, reels, dir: CD, name });
    const ck = HF(['check', CD]); const ckOut = clean(ck.stdout + ck.stderr);
    const errs = [...ckOut.matchAll(/(\d+) error\(s\)/g)].reduce((s, m) => s + +m[1], 0);
    const check = { ok: /Check passed/.test(ckOut), summary: (ckOut.match(/◇\s+Check (passed|failed)/) || ['?'])[0] + `; ${errs} errors` };
    log(`compose ${CD} (${comp.END}s, ${comp.sfxCount} sfx) — ${check.summary}`);
    if (!check.ok) { fs.writeFileSync(`${VD}/check.txt`, ckOut); log('check failed, see ' + `${VD}/check.txt`); }
    // 4b) faces stay visible (owner rule 2026-11-12): headless Chrome plays the composition and measures every card,
    //     bubble, tag, caption and front prop against each character's eyes + mouth. Severe = >= 35% for >= 0.3 s.
    const fcFile = `${VD}/face_check.json`; if (fs.existsSync(fcFile)) fs.unlinkSync(fcFile);
    const fcRun = run('node', [`${ROOT}/factory/tools/face_check.cjs`, CD, '--json', fcFile], { soft: true });
    const faceCheck = fs.existsSync(fcFile) ? readJSON(fcFile) : { error: clean(fcRun.stderr || fcRun.stdout).slice(-300) };
    if (faceCheck.error) log('face check could not run: ' + faceCheck.error);
    else log(`faces: ${faceCheck.events.length ? faceCheck.events.map((e) => `${e.severe ? 'SEVERE ' : ''}${e.el} over ${e.who} ${e.from}-${e.to}s (${Math.round(e.cover * 100)}%)`).join('; ') : 'all visible'}`);
    if (faceCheck.severe && !flag('--allow-face-cover')) throw new Error('a card or bubble covers a face (listed above). Move it away from the face, or mark the element faceOk: true / run with --allow-face-cover if the owner wants it');
    if (flag('--preview')) {
      const at = scenes.map((s) => r2((s.w[0] + s.w[1]) / 2)).join(',');
      const sn = clean(HF(['snapshot', CD, '--at', at]).stdout); const m = sn.match(/([A-Z]:\\[^\n]*contact-sheet[^\n]*\.jpg)/); log('preview: ' + (m ? m[1] : 'see .hyperframes/artifacts/snapshots'));
    }
    if (flag('--no-render')) continue;

    // 5) render
    const OD = `${ROOT}/out/factory/${job.id}/v${v}`; fs.mkdirSync(OD, { recursive: true });
    const raw = `${OD}/${name}_raw.mp4`;
    const t0 = Date.now();
    const quality = opt('--quality', 'standard');
    const rr = HF(['render', '--output', raw, '--quality', quality, '--workers', '1', '--fps', '30', CD]);
    fs.writeFileSync(`${OD}/render.log`, clean(rr.stdout + rr.stderr));
    if (!fs.existsSync(raw)) throw new Error('render failed, see ' + `${OD}/render.log`);
    log(`rendered in ${Math.round((Date.now() - t0) / 1000)}s`);

    // 6) finish: music bed with ducking, loudness, formats, SRT, thumbnail
    const music = opt('--music', job.music === undefined ? null : job.music);
    let pre = raw;
    // 6a) optional video effects from the vendored /effects skill (job.effects), before music and loudness
    if (job.effects && job.effects.length) {
      const t1 = Date.now();
      pre = require('./tools/effects.cjs').applyEffects(raw, job.effects, `${OD}/${name}_fx.mp4`);
      log(`effects: ${job.effects.map((e) => `${e.fx} ${e.start}-${e.end}s`).join(', ')} (${Math.round((Date.now() - t1) / 1000)}s)`);
    }
    if (music && music !== 'none') pre = F.mixMusic(raw, music, `${OD}/${name}_mix.mp4`, { volume: job.musicVolume || 0.22 });
    const master = `${OD}/${name}_9x16.mp4`; const L = F.loudnorm(pre, master);
    log(`master ${master} (${L.I} LUFS, ${L.P} dBTP)`);
    const fm = flag('--no-formats') ? {} : F.formats(master, `${OD}/${name}`);
    const wt = comp.wt; F.srt(sentences, wt, `${OD}/${name}.srt`);
    F.thumbnail(master, `${OD}/${name}_thumb.jpg`);
    F.contact(master, `${OD}/${name}_sheet.jpg`, scenes.map((s) => r2((s.w[0] + s.w[1]) / 2)));

    // 7) quality gate
    const hookSpan = (voice.spans || [])[0];
    const opener = { scene: (job.scenes || [])[0], hookWords: String(sentences[0].text || '').trim().split(/\s+/).filter(Boolean).length, hookEnd: hookSpan ? O + hookSpan.end : null };
    const q = qa({ file: master, voiceStart: O, voiceDur: voice.D, reading: voice.reading, check, labelOn: !!(job.label || client.label), opener, faces: faceCheck });
    log(`QA ${q.pass ? 'PASS' : 'FAIL'}\n` + report(q));

    // 8) deliver
    const DD = `${ROOT}/READY_TO_SEND/${client.id}/${job.id}`; fs.mkdirSync(DD, { recursive: true });
    const tag = nVar > 1 ? `_hook${v}` : '';
    const files = [[master, `${job.id}${tag}_9x16.mp4`], [fm['1x1'], `${job.id}${tag}_1x1.mp4`], [fm['16x9'], `${job.id}${tag}_16x9.mp4`], [`${OD}/${name}.srt`, `${job.id}${tag}.srt`], [`${OD}/${name}_thumb.jpg`, `${job.id}${tag}_thumb.jpg`]];
    // a file open in a video player is locked on Windows: wait for it (20 s steps, up to 10 min) instead of failing
    const put = (a, b) => { for (let k = 0; k < 30; k++) { try { fs.copyFileSync(a, b); return; } catch (e) { if (e.code !== 'EBUSY' && e.code !== 'EPERM') throw e; if (k === 0) log(`waiting: ${b} is open in another program (close the video player)`); run('powershell', ['-NoProfile', '-Command', 'Start-Sleep -Seconds 20']); } } throw new Error('still locked: ' + b); };
    if (q.pass || flag('--deliver-anyway')) files.forEach(([a, b]) => a && fs.existsSync(a) && put(a, `${DD}/${b}`));
    delivered.push({ v, hook: sentences[0].text, pattern: sentences[0].pattern || null, hookScore: sentences[0].hookScore != null ? sentences[0].hookScore : null, pass: q.pass, q, master });
  }
  if (flag('--no-render')) return;

  // post copy + report for the job
  const DD = `${ROOT}/READY_TO_SEND/${client.id}/${job.id}`;
  let post = ''; try { post = await writePost({ job, client, script: script.sentences, lang: job.lang || 'ar' }); } catch (e) { post = '(post copy failed: ' + e.message + ')'; }
  fs.writeFileSync(`${DD}/post.txt`, post);
  const md = [`# ${job.id} — ${client.name}`, `Format: **${format.name_ar}** (${job.format}) · created ${new Date().toISOString().slice(0, 16)}`, '',
    '## Script', ...script.sentences.map((s) => `- **${s.role}**: ${s.text}`), '',
    ...delivered.map((d) => `## Variant ${d.v}${d.pass ? '' : ' (NOT delivered: QA failed)'}\nHook: ${d.hook}${d.pattern ? `\nHook pattern: ${d.pattern}${d.hookScore != null ? ` · heuristic score ${d.hookScore}/100` : ''}` : ''}\n\n${report(d.q)}\n`), '## Post', '```', post, '```'].join('\n');
  fs.writeFileSync(`${DD}/report.md`, md);
  log(`delivered to ${DD}`);
})().catch((e) => { console.error('[factory] ERROR', e.stack || e.message); process.exit(1); });
