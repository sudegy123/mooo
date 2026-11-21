// Video effects for the factory: runs the vendored /effects skill (.claude/skills/effects, 51 talking-head effects by
// Vibha Ramprakash, MIT, reviewed 2026-11-19) with its own Python on G:. Local only: face tracking (YuNet) and person
// cut-out (MediaPipe selfie segmenter) run on the CPU from bundled models; nothing is uploaded.
// Best on real footage of a person (the owner on camera, real recordings). 2D stage characters are not faces to YuNet.
//
// Usage:
//   node factory/tools/effects.cjs --list
//   node factory/tools/effects.cjs <in.mp4> <fx> [out.mp4] --start 3 --end 6 [--text "..."] [--opt key=value ...]
//   node factory/tools/effects.cjs <in.mp4> --plan plan.json [out.mp4]          plan = {"effects":[{"fx","start","end",...}]}
//   add --still 1.5,4.2 to write PNG check frames instead of a video (look at them before the full render)
// In a job: "effects": [{ "fx": "spotlight", "start": 0.3, "end": 2.4, "text": "..." }] is applied to the render
// before music, loudness and formats (run.cjs step 6).
const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const SKILL = path.join(ROOT, '.claude', 'skills', 'effects');
const PY = path.join(SKILL, '.venv', 'Scripts', 'python.exe');
const FX = path.join(SKILL, 'scripts', 'fx.py');

function env() {
  const tmp = path.join(ROOT, '.cache', 'tmp'); fs.mkdirSync(tmp, { recursive: true });
  // keep temp files and any model/pip cache on G: (AGENTS.md 5b)
  return { ...process.env, TEMP: tmp, TMP: tmp, PIP_CACHE_DIR: path.join(ROOT, '.cache', 'pip'), PYTHONNOUSERSITE: '1', PYTHONIOENCODING: 'utf-8' };
}
function ready() {
  if (!fs.existsSync(PY)) throw new Error(`effects skill not set up: ${PY} missing (install: python -m venv .venv && .venv\\Scripts\\python -m pip install -r requirements.txt in ${SKILL})`);
}
// run fx.py with raw arguments; returns { ok, out }
function fx(args, { quiet = false } = {}) {
  ready();
  const r = spawnSync(PY, ['-I', FX, ...args], { cwd: SKILL, env: env(), encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit', maxBuffer: 1 << 26 });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}
// apply a list of effects (job.effects) to a video; writes a plan next to the output and renders it
function applyEffects(src, effects, dst, { still } = {}) {
  src = path.resolve(src); dst = path.resolve(dst);
  const plan = dst.replace(/\.[^.]+$/, '') + '_effects.json';
  fs.writeFileSync(plan, JSON.stringify({ effects }, null, 1));
  const args = ['--plan', plan, src, dst]; if (still) args.push('--still', String(still));
  const r = fx(args, { quiet: true });
  if (!r.ok) throw new Error('effects failed: ' + r.out.slice(-600));
  return dst;
}
module.exports = { fx, applyEffects };

if (require.main === module) {
  const a = process.argv.slice(2);
  if (!a.length) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 13).join('\n')); process.exit(2); }
  if (a.includes('--list')) process.exit(fx(['--list']).ok ? 0 : 1);
  // split positionals from --flags (every flag here takes one value)
  const pos = [], flags = [];
  // fx.py runs inside the skill folder, so file paths must be absolute
  for (let i = 0; i < a.length; i++) { if (a[i].startsWith('--')) { flags.push(a[i], ['--plan', '--images'].includes(a[i]) ? path.resolve(a[i + 1]) : a[i + 1]); i++; } else pos.push(a[i]); }
  const plan = flags.includes('--plan');
  if (pos[0]) pos[0] = path.resolve(pos[0]);
  if (pos[plan ? 1 : 2]) pos[plan ? 1 : 2] = path.resolve(pos[plan ? 1 : 2]);
  const src = pos[0], name = plan ? 'effects' : pos[1];
  if (!src || !name) { console.error('need <in.mp4> and an effect name (or --plan)'); process.exit(2); }
  const out = pos[plan ? 1 : 2] || src.replace(/\.[^.]+$/, '') + `_${name}` + (flags.includes('--still') ? '.png' : '.mp4');
  const t0 = Date.now(); const r = fx(plan ? [src, out, ...flags] : [name, src, out, ...flags]);
  console.log(r.ok ? `done in ${Math.round((Date.now() - t0) / 1000)} s -> ${out}` : 'effects failed');
  process.exit(r.ok ? 0 : 1);
}
