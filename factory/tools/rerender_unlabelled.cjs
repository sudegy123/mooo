// One-off batch (2026-10-22): re-render every delivered video without the on-screen demo label.
// The labelled original is moved to archive/with_label/<same path>, the new render takes its place under the same name.
// Usage: node factory/tools/rerender_unlabelled.cjs [startIndex]
// 2026-10-22: the owner asked to re-render only the two factory videos (mazin-myth-01, andoria-pov-01); the batch runs only with --run.
if (!process.argv.includes('--run')) { console.log('batch disabled: only the two factory videos are re-rendered (pass --run to process the rest)'); process.exit(0); }
const { ROOT, run, fs, path, loudness } = require('../lib/util.cjs');
const { loudnorm } = require('../lib/finish.cjs');
const HF = (args) => run('powershell', ['-NoProfile', '-File', `${ROOT}/scripts/hf.ps1`, ...args], { soft: true });
const R = 'READY_TO_SEND';
const rowsFor = (name, src) => { const d = JSON.parse(fs.readFileSync(`${ROOT}/${src}`, 'utf8')); const rows = (d.rows || d).filter((r) => r.name === name); const f = `${ROOT}/.cache/rows_one_${name}.json`; fs.writeFileSync(f, JSON.stringify({ rows })); return f; };
const ITEMS = [
  { comp: 'aesthetic-ad-en', rows: 'briefs/rows_aesthetic_en.json', name: 'aesthetic_en', dest: `${R}/aesthetic/sudegy_aesthetic_doctors_ad_EN_v2_45s.mp4` },
  { comp: 'aesthetic-ad', rows: 'briefs/rows_aesthetic.json', name: 'aesthetic', dest: `${R}/aesthetic/sudegy_aesthetic_doctors_ad_v2_49s.mp4` },
  { comp: 'aesthetic-ad3', rows: 'briefs/rows_aesthetic3.json', name: 'aesthetic3', dest: `${R}/aesthetic/sudegy_aesthetic_doctors_ad_v3_characters_49s.mp4` },
  { comp: 'andoria-ad3', rows: 'briefs/rows_andoria3.json', name: 'andoria3', dest: `${R}/andoria/andoria_solar_calculator_v3_characters_44s.mp4` },
  { comp: 'andoria-explainer', rows: 'briefs/rows_andoria.json', name: 'andoria', dest: `${R}/andoria/andoria_solar_advisor_explainer_33s.mp4` },
  { comp: 'mazin-ad4', rows: 'briefs/rows_mazin4.json', name: 'mazin4', dest: `${R}/mazin/drmazin_skin_analyser_v4_characters_46s.mp4` },
  { comp: 'mazin-explainer3', rows: 'briefs/rows_mazin3.json', name: 'mazin3', dest: `${R}/mazin/drmazin_skin_analyser_explainer_v3_motion_46s.mp4` },
  { comp: 'mazin-explainer2', rows: 'briefs/rows_mazin2.json', name: 'mazin2', dest: `${R}/mazin/drmazin_skin_analyser_explainer_v2_46s.mp4` },
  { comp: 'mazin-explainer', rows: 'briefs/rows_mazin.json', name: 'mazin', dest: `${R}/mazin/old/drmazin_skin_analyser_explainer_40s.mp4` },
  { comp: 'mazin-sample-a', rows: 'briefs/rows_mazin_sample_a.json', name: 'mazin_sample_A_luxury', dest: `${R}/mazin/samples/mazin_sample_A_luxury.mp4` },
  { comp: 'mazin-sample-b', rows: 'briefs/rows_mazin_sample_b.json', name: 'mazin_sample_B_story', dest: `${R}/mazin/samples/mazin_sample_B_story.mp4` },
  { comp: 'mazin-sample-c', rows: 'briefs/rows_mazin_sample_c.json', name: 'mazin_sample_C_poll', dest: `${R}/mazin/samples/mazin_sample_C_poll.mp4` },
  { comp: 'mazin-new-a', rows: 'briefs/rows_mazin_new_a.json', name: 'mazin_new_A_microscope', dest: `${R}/mazin/samples_new/mazin_new_A_microscope.mp4` },
  { comp: 'mazin-new-b', rows: 'briefs/rows_mazin_new_b.json', name: 'mazin_new_B_teardown3d', dest: `${R}/mazin/samples_new/mazin_new_B_teardown3d.mp4` },
  { comp: 'mazin-new-c', rows: 'briefs/rows_mazin_new_c.json', name: 'mazin_new_C_liquidgold', dest: `${R}/mazin/samples_new/mazin_new_C_liquidgold.mp4` },
  { comp: 'dental-triage-15s', rows: 'briefs/rows_c.json', name: 'hook_c', dest: `${R}/sudegy_dental_hook_c_silent_23s.mp4` },
  { comp: 'dental-triage-narrated', rows: null, dest: `${R}/sudegy_dental_hook_c_narrated_25s.mp4` },
  { comp: 'dental-triage-voice', rows: null, dest: `${R}/sudegy_dental_hook_c_23s_voice_EXPERIMENTAL.mp4` },
  { comp: 'dental-triage-15s', rows: 'briefs/rows.json', name: 'hook_a', dest: `${R}/old_versions/old_15s_fast/sudegy_dental_hook_a_23s.mp4`, replaces: `${R}/old_versions/old_15s_fast/sudegy_dental_15s_hook_a.mp4` },
  { comp: 'dental-triage-15s', rows: 'briefs/rows.json', name: 'hook_b', dest: `${R}/old_versions/old_15s_fast/sudegy_dental_hook_b_23s.mp4`, replaces: `${R}/old_versions/old_15s_fast/sudegy_dental_15s_hook_b.mp4` },
  { copyOf: `${R}/sudegy_dental_hook_c_silent_23s.mp4`, dest: `${R}/old_versions/old_15s_fast/sudegy_dental_hook_c_23s.mp4`, replaces: `${R}/old_versions/old_15s_fast/sudegy_dental_15s_hook_c.mp4` },
];
// files open in a video player are locked on Windows: retry every 20 s for up to 10 min
const retry = (fn, what) => { for (let k = 0; k < 30; k++) { try { return fn(); } catch (e) { if (e.code !== 'EBUSY' && e.code !== 'EPERM') throw e; if (k === 0) console.log(`waiting: ${what} is open in another program (close the video player)`); run('powershell', ['-NoProfile', '-Command', 'Start-Sleep -Seconds 20']); } } throw new Error('still locked: ' + what); };
const archive = (rel) => { const src = `${ROOT}/${rel}`; if (!fs.existsSync(src)) return; const dst = `${ROOT}/archive/with_label/${rel.replace(/^READY_TO_SEND\//, '')}`; fs.mkdirSync(path.dirname(dst), { recursive: true }); retry(() => fs.renameSync(src, dst), rel); };
const start = +(process.argv[2] || 0), OUT = `${ROOT}/out/unlabelled`; fs.mkdirSync(OUT, { recursive: true });
const summary = [];
for (let k = start; k < ITEMS.length; k++) {
  const it = ITEMS[k], t0 = Date.now();
  try {
    let raw;
    if (it.copyOf) { raw = `${ROOT}/${it.copyOf}`; }
    else if (it.rows) {
      const rows = rowsFor(it.name, it.rows), dir = `${OUT}/${it.comp}_${it.name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      const r = HF(['render', '--batch', rows, '--output', `${dir}/{name}.mp4`, '--quality', 'looks', '--workers', '1', '--fps', '30', '--strict-variables', `${ROOT}/compositions/${it.comp}`]);
      raw = `${dir}/${it.name}.mp4`; if (!fs.existsSync(raw)) throw new Error('render failed: ' + String(r.stdout + r.stderr).replace(/\x1b\[[0-9;]*m/g, '').slice(-400));
    } else {
      raw = `${OUT}/${it.comp}.mp4`; fs.rmSync(raw, { force: true });
      const r = HF(['render', '--output', raw, '--quality', 'looks', '--workers', '1', '--fps', '30', `${ROOT}/compositions/${it.comp}`]);
      if (!fs.existsSync(raw)) throw new Error('render failed: ' + String(r.stdout + r.stderr).replace(/\x1b\[[0-9;]*m/g, '').slice(-400));
    }
    const fin = `${OUT}/final_${k}.mp4`;
    if (it.copyOf) fs.copyFileSync(raw, fin); else loudnorm(raw, fin);
    archive(it.dest); if (it.replaces) archive(it.replaces);
    fs.mkdirSync(path.dirname(`${ROOT}/${it.dest}`), { recursive: true }); fs.copyFileSync(fin, `${ROOT}/${it.dest}`);
    const L = loudness(`${ROOT}/${it.dest}`);
    summary.push(`${k} OK  ${it.dest}  ${Math.round((Date.now() - t0) / 1000)}s  ${L.I} LUFS ${L.P} dBTP`);
  } catch (e) { summary.push(`${k} FAIL ${it.dest}: ${e.message.slice(0, 300)}`); }
  console.log(summary[summary.length - 1]);
}
console.log('\nSUMMARY\n' + summary.join('\n'));
