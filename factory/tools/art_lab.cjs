// Art lab: shows every 2D character (art v2) on every backdrop, with idle life and a few beats, through the REAL
// compose/scenes/stage code, but without a job, voice, API calls or a render. Output: a HyperFrames snapshot contact sheet.
// Usage: node factory/tools/art_lab.cjs [--render]
//   default  -> compositions/_lab-art-v2 + out/lab/art_v2_sheet.jpg (6 frames, one per scene)
//   --render -> also renders out/lab/art_v2.mp4 (draft quality) to check motion and render speed
const { ROOT, run, fs } = require('../lib/util.cjs');
const { compose, planTimes } = require('../lib/compose.cjs');

const client = JSON.parse(fs.readFileSync(`${ROOT}/factory/clients/sudegy.json`, 'utf8'));
const SEC = 2.4;
const scenes = [
  // speaks: true = lip-sync to the narration words of this scene
  { type: 'stage', bg: 'room', chars: [{ id: 'g', type: 'man_gulf', x: 330, speaks: true }, { id: 'w', type: 'woman', x: 770 }], props: [{ id: 'clk', type: 'clock', x: 820, y: 690, scale: 0.5 }], beats: [{ do: 'point', who: 'w', at: 0.8, side: 'l', hold: 1.2 }, { do: 'spin', prop: 'clk', at: 0.2, dur: 2, turns: 2 }] },
  { type: 'stage', bg: 'clinic', chars: [{ id: 'd', type: 'dentist_doctor', x: 320, speaks: true }, { id: 'p', type: 'patient_pain', x: 770 }], props: [{ id: 'ph', type: 'phoneHand', x: 560, y: 1230, scale: 0.9, front: true }], beats: [{ do: 'nod', who: 'd', at: 0.6 }] },
  { type: 'stage', bg: 'shop', chars: [{ id: 's', type: 'man_sd', x: 300 }, { id: 'e', type: 'seller', x: 800 }], props: [{ id: 'sh', type: 'jarShelf', x: 760, y: 1000 }, { id: 'ct', type: 'counter', x: 560, y: 1270, front: true }], beats: [{ do: 'wave', who: 'e', at: 0.3, dur: 1.2 }, { do: 'smile', who: 's', at: 0.5 }] },
  { type: 'stage', bg: 'office', chars: [{ id: 'b', type: 'factory_boss', x: 330 }, { id: 'f', type: 'doctor_f', x: 790 }], props: [{ id: 'dk', type: 'desk', x: 520, y: 1270 }, { id: 'lp', type: 'laptop', x: 640, y: 1246 }, { id: 'inv', type: 'inverter', x: 60, y: 1200, scale: 0.8 }, { id: 'bat', type: 'battery', x: 920, y: 1220, scale: 0.75 }], beats: [{ do: 'angry', who: 'b', at: 0.4 }, { do: 'surprise', who: 'f', at: 0.6 }, { do: 'trip', prop: 'inv', at: 1.0 }, { do: 'drain', prop: 'bat', at: 0.3, dur: 1.6 }] },
  { type: 'stage', bg: 'dark', chars: [{ id: 'k', type: 'factory_worker', x: 320 }, { id: 'h', type: 'patient_happy', x: 780 }], props: [{ id: 'ac', type: 'ac', x: 360, y: 560 }, { id: 'lm', type: 'lamp', x: 860, y: 640 }, { id: 'sr', type: 'siren', x: 180, y: 640 }], beats: [{ do: 'cheer', who: 'h', at: 0.4 }, { do: 'acOn', prop: 'ac', at: 0.3 }] },
  { type: 'stage', bg: 'light', chars: [{ id: 'm', type: 'doctor_m', x: 320 }, { id: 'o', type: 'man_gulf', x: 780, opts: { art: 1 } }], props: [{ id: 'jr', type: 'jars', x: 90, y: 1500, scale: 0.6 }], beats: [{ do: 'sad', who: 'm', at: 0.4 }] },
  // meme reactions with the recurring cast (factory/cast.json): faces, emotes, focus lines, camera punch-in
  { type: 'stage', bg: 'shop', chars: [{ id: 'a', cast: 'bu_saad', x: 300 }, { id: 'b', cast: 'noura', x: 790 }], beats: [{ do: 'face', who: 'a', as: 'shock', at: 0.2, hold: 0 }, { do: 'impact', who: 'a', at: 0.2, dur: 2.0 }, { do: 'emote', who: 'a', kind: 'exclaim', at: 0.3, hold: 2.0 }, { do: 'face', who: 'b', as: 'smug', at: 0.5, hold: 0 }] },
  { type: 'stage', bg: 'office', chars: [{ id: 'a', cast: 'hamad', x: 300 }, { id: 'b', cast: 'am_osman', x: 790 }], beats: [{ do: 'face', who: 'a', as: 'cry', at: 0.2, hold: 0 }, { do: 'emote', who: 'a', kind: 'sweat', pos: 'left', at: 0.3, hold: 2.0 }, { do: 'face', who: 'b', as: 'dead', at: 0.4, hold: 0 }, { do: 'emote', who: 'b', kind: 'zzz', at: 0.5, hold: 2.0 }] },
  { type: 'stage', bg: 'clinic', chars: [{ id: 'a', cast: 'dr_sara', x: 300 }, { id: 'b', type: 'doctor_m', x: 790 }], beats: [{ do: 'face', who: 'a', as: 'rage', at: 0.2, hold: 0 }, { do: 'emote', who: 'a', kind: 'anger', at: 0.3, hold: 2.0 }, { do: 'face', who: 'b', as: 'wow', at: 0.4, hold: 0 }, { do: 'emote', who: 'b', kind: 'sparkle', at: 0.5, hold: 2.0 }] },
  { type: 'stage', bg: 'room', chars: [{ id: 'a', type: 'woman', x: 300 }, { id: 'b', type: 'seller', x: 790 }], beats: [{ do: 'face', who: 'a', as: 'love', at: 0.2, hold: 0 }, { do: 'emote', who: 'a', kind: 'heart', at: 0.3, hold: 2.0 }, { do: 'face', who: 'b', as: 'nervous', at: 0.4, hold: 0 }, { do: 'emote', who: 'b', kind: 'question', at: 0.5, hold: 2.0 }] },
  { type: 'stage', bg: 'shop', chars: [{ id: 'a', cast: 'bu_saad', x: 380 }], els: [{ id: 't', kind: 'bubble', text: 'بكم؟', x: 700, y: 640, show: true }], beats: [{ do: 'face', who: 'a', as: 'dead', at: 0.3, hold: 0 }, { do: 'zoomTo', who: 'a', at: 0.5, scale: 1.6, hold: 1.5 }, { do: 'emote', who: 'a', kind: 'idea', at: 0.6, hold: 1.8 }] },
  // deliberate mistake: the face check must flag this card
  { type: 'stage', bg: 'room', chars: [{ id: 'x', type: 'doctor_m', x: 540 }], els: [{ id: 'cov', kind: 'card', text: 'بطاقة فوق الوجه', x: 330, y: 830, show: true }] },
];
const labels = ['غرفة: خليجي يتكلم وامرأة', 'عيادة: طبيب يتكلم ومريض', 'محل: سوداني وبائع', 'مكتب: مدير وطبيبة', 'مسرح غامق: عامل ومريض سعيد', 'قديم مقابل جديد', 'صدمة وخطوط تركيز مقابل ثقة', 'بكاء وعرق مقابل ملل', 'غضب مقابل انبهار', 'حب مقابل توتر', 'تكبير الكاميرا على الوجه', 'اختبار: بطاقة فوق الوجه'];
const sentences = scenes.map((s, i) => ({ role: `r${i}`, text: labels[i], keyword: '' }));
scenes.forEach((s, i) => { s.say = [`r${i}`]; });

const dir = `${ROOT}/compositions/_lab-art-v2`, W = `${ROOT}/factory/work/_lab-art-v2`, OUT = `${ROOT}/out/lab`;
[dir, W, OUT].forEach((d) => fs.mkdirSync(d, { recursive: true }));
const END = SEC * scenes.length, O = 0;
const wav = `${W}/silence.wav`;
run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(END), wav]);
const voice = { file: wav, D: END - 1.3, cuts: scenes.slice(1).map((_, i) => SEC * (i + 1)), spans: scenes.map((_, i) => ({ role: `r${i}`, start: i * SEC + 0.1, end: i * SEC + SEC - 0.5 })), reading: [] };
planTimes({ sentences, voice, O, scenes });
const comp = compose({ job: { id: 'art-lab', lang: 'ar', scenes }, client, sentences, voice, O, scenes, reels: {}, dir, name: 'art-lab' });
console.log(`composition ${dir} (${comp.END}s)`);

const hf = (args) => run('powershell', ['-NoProfile', '-File', `${ROOT}/scripts/hf.ps1`, ...args], { soft: true });
const clean = (x) => String(x || '').replace(/\x1b\[[0-9;]*m/g, '');
const ck = clean(hf(['check', dir]).stdout);
console.log('check:', (ck.match(/◇\s+Check (passed|failed)[^\n]*/) || ['?'])[0]);
const fc = run('node', [`${ROOT}/factory/tools/face_check.cjs`, dir], { soft: true });
console.log('face check: ' + clean(fc.stdout || fc.stderr).trim());
const at = scenes.map((s) => (s.w[0] + Math.min(1.6, (s.w[1] - s.w[0]) * 0.7)).toFixed(2)).join(',');
const sn = clean(hf(['snapshot', dir, '--at', at]).stdout);
const m = sn.match(/([A-Z]:\\[^\n]*contact-sheet[^\n]*\.jpg)/);
if (m) { fs.copyFileSync(m[1].trim(), `${OUT}/art_v2_sheet.jpg`); console.log('sheet:', `${OUT}/art_v2_sheet.jpg`); } else console.log('snapshot output:\n' + sn.slice(-800));
if (process.argv.includes('--render')) {
  const t0 = Date.now();
  const r = hf(['render', '--output', `${OUT}/art_v2.mp4`, '--quality', 'draft', '--workers', '1', '--fps', '30', dir]);
  console.log(`render ${((Date.now() - t0) / 1000).toFixed(0)} s for ${END} s of video`, r.status === 0 ? '' : clean(r.stderr).slice(-400));
}
