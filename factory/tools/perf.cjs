// Performance log: the account's own TikTok numbers decide which patterns the factory prefers.
//   node factory/tools/perf.cjs add <job-id> --variant 1 --views 420 --avg 6.5 --stopped 1 --full 2.1 --likes 7 --comments 0 --shares 1 --saves 2 --followers 3
//   node factory/tools/perf.cjs report
// Video features (hook pattern, score, length, first scene) are read from the job and its script. `report` writes
// factory/perf/learned.json once 10+ videos are logged; copy.cjs and idea_engine.cjs then prefer the best patterns.
const { ROOT, readJSON, writeJSON, fs } = require('../lib/util.cjs');
const F = `${ROOT}/factory/perf/log.json`, L = `${ROOT}/factory/perf/learned.json`;
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const rows = fs.existsSync(F) ? readJSON(F) : [];

if (argv[0] === 'add') {
  const id = argv[1]; if (!id) { console.error('job id missing'); process.exit(2); }
  const v = +opt('--variant', 1);
  let job = {}, script = {}; try { job = readJSON(`${ROOT}/factory/jobs/${id}.json`); } catch { /* old or external video */ }
  try { script = readJSON(`${ROOT}/factory/work/${id}/script.json`); } catch { /* none */ }
  const hook = v > 1 && script.hooks ? script.hooks[v - 2] : (script.sentences || [])[0] || {};
  const row = { id, variant: v, loggedAt: new Date().toISOString(), hook: hook.text || null, pattern: hook.pattern || null, hookScore: hook.hookScore ?? hook.score ?? null,
    firstScene: (job.scenes || [])[0] ? job.scenes[0].type : null, format: job.format || null,
    views: +opt('--views', 0), avgWatch: +opt('--avg', 0), stoppedAt: +opt('--stopped', 0), fullPct: +opt('--full', 0),
    likes: +opt('--likes', 0), comments: +opt('--comments', 0), shares: +opt('--shares', 0), saves: +opt('--saves', 0), followers: +opt('--followers', 0) };
  rows.push(row); writeJSON(F, rows); console.log('logged', JSON.stringify(row));
} else if (argv[0] === 'report') {
  if (!rows.length) { console.log('no videos logged yet'); process.exit(0); }
  const by = {}; rows.forEach((r) => { const k = r.pattern || 'unknown'; (by[k] = by[k] || []).push(r); });
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const table = Object.entries(by).map(([k, a]) => ({ pattern: k, videos: a.length, medianAvgWatch: med(a.map((r) => r.avgWatch)), medianStopped: med(a.map((r) => r.stoppedAt)), medianViews: med(a.map((r) => r.views)), seeds: a.reduce((s, r) => s + r.comments + r.saves + r.followers, 0) }))
    .sort((a, b) => b.medianAvgWatch - a.medianAvgWatch);
  console.table(table);
  if (rows.length >= 10) {
    const best = table.filter((t) => t.pattern !== 'unknown' && t.videos >= 2).slice(0, 3).map((t) => t.pattern);
    writeJSON(L, { updatedAt: new Date().toISOString(), basedOn: rows.length, bestPatterns: best, table });
    console.log('learned.json updated: prefer', best.join(', ') || '(not enough per pattern)');
  } else console.log(`${rows.length}/10 videos logged; learned.json is written from 10 on`);
} else { console.log('usage: perf.cjs add <job-id> [--variant N --views --avg --stopped --full --likes --comments --shares --saves --followers] | perf.cjs report'); }
