// Idea engine: indirect-selling video ideas (种草 / "sell without pitching") through the Sudegy brain.
// Grounded in the brain's real OFFERS and VERTICALS; the product appears late, as the natural end of the story.
// Evidence: docs/viral-playbook-2026-11-12.md. Usage:
//   node factory/tools/idea_engine.cjs --vertical dental [--n 8] [--objection "لدينا نظام مشابه"] [--lang ar]
// Writes ideas/<vertical>-<date>.json and .md. Ideas are proposals for the owner, not finished copy.
const { ROOT, SALES, readJSON, writeJSON, fs, log } = require('../lib/util.cjs');
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const { HOOKS, scoreHook, weakOpener } = require('../lib/copy.cjs');

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const vertical = opt('--vertical', 'dental'), N = +opt('--n', 8), lang = opt('--lang', 'ar'), objection = opt('--objection', '');
const V = brain.VERTICALS[vertical], O = brain.OFFERS[vertical];
if (!V || !O) { console.error('unknown vertical; use one of: ' + Object.keys(brain.VERTICALS).join(', ')); process.exit(2); }
const cast = readJSON(`${ROOT}/factory/cast.json`).cast;
let learned = null; try { learned = readJSON(`${ROOT}/factory/perf/learned.json`); } catch { /* no data yet */ }

const ANGLES = [
  ['avoid_trap', 'Avoid-the-trap guide: how to judge options before buying; our way is one fair option among the criteria.'],
  ['daily_skit', 'Relatable daily skit: the pain happening, with an exaggerated reaction; the fix appears only in the last beat.'],
  ['hot_take', 'Hot take on a common belief in this trade, backed by the video.'],
  ['behind_scenes', 'Behind the scenes: how the work is really done (study the workflow first, then build).'],
  ['checklist', 'Checklist worth saving: the full list is shown on screen.'],
  ['cost_of_nothing', 'The quiet cost of doing nothing: what keeps leaking every week, without inventing numbers.'],
  ['objection', 'A real objection answered calmly and fairly.'],
  ['series', 'Episode of a recurring series with the same cast; ends on an open question for the next episode.'],
  ['self_test', 'Five-second self-test: three yes/no questions the viewer answers in their head.'],
  ['comparison', 'Fair comparison of two ways of working (never a named competitor).'],
  ['template', 'A free template or script shown fully on screen (for example a WhatsApp reply).'],
  ['outcome', 'Outcome showcase: the finished result in the first frame, then how it works.'],
];

(async () => {
  const prompt = `You plan short vertical videos (15-25 s) that SELL INDIRECTLY for Sudegy. Viewers must feel helped or entertained; the offer appears once, late, as the natural end of the story, never in the hook.
Target viewer: ${V.target}. Their real pain: ${V.pain}. What usually hooks them: ${V.hook}.
What Sudegy really offers this vertical (the only product facts you may use): ${O}
${objection ? `A real prospect objection to answer fairly: «${objection}»\n` : ''}Indirect angles to use (pick different ones): ${ANGLES.map(([k, d]) => `${k} = ${d}`).join(' | ')}
Hook patterns (pick one per idea): ${HOOKS.patterns.map((p) => `${p.id} (${p.how})`).join(' | ')}
${learned && learned.bestPatterns && learned.bestPatterns.length ? `On this account these hook patterns held viewers longest: ${learned.bestPatterns.join(', ')}. Prefer them.\n` : ''}Recurring cartoon cast you may use (fictional, never presented as real customers): ${Object.entries(cast).map(([k, c]) => `${k} = ${c.name_ar}, ${c.role_ar}: ${c.persona}`).join(' | ')}
Visual tools: 2D characters with meme reactions (shock, cry, rage, smug, dead, wow, love, nervous), emotes over heads, camera punch-in on a face, manga impact lines, chat bubbles, cards, real app screen recordings. The first frame must SHOW what the hook says. Few spoken words; let the picture carry it.
Rules: no numbers, prices, statistics, testimonials, guarantees or result claims; no fake reviews; never attack a named competitor; hook at most six words in ${lang === 'ar' ? 'simple Arabic' : 'English'}, never starting with a greeting or "have you ever wondered".
Write ${N} ideas, each a different angle. Return JSON only:
{"ideas":[{"title":"short working title","angle":"angle id","hook":"the spoken hook","hookPattern":"pattern id","emotion":"fear|empathy|curiosity|trust|outrage","firstFrame":"what is on screen at 0.0 s","beats":["3 to 5 short scene beats"],"productMoment":"the one late beat where Sudegy appears and how","implicitCta":"how the viewer is moved to act without a direct ask","seedSignal":"what the viewer does if it worked (comment word, save, profile visit, search)","cast":["cast ids used"]}]}`;
  const r = await askJSON(prompt, { system: lang === 'ar' ? brain.GULF_BRAIN() : undefined, temperature: 0.85 });
  const ideas = (r.ideas || []).map((x) => {
    const sc = scoreHook(x.hook, { pattern: x.hookPattern }), problems = [];
    if (weakOpener(x.hook)) problems.push('weak opener');
    if (/\d|[٠-٩]/.test(JSON.stringify(x))) problems.push('contains digits');
    if (/مضمون|ضمان|الأفضل|100%/.test(JSON.stringify(x))) problems.push('claim word');
    if (String(x.hook || '').trim().split(/\s+/).length > 6) problems.push('hook over six words');
    return { ...x, hookScore: sc.score, hookWhy: sc.why, problems };
  }).sort((a, b) => (a.problems.length - b.problems.length) || (b.hookScore - a.hookScore));
  const stamp = new Date().toISOString().slice(0, 10), base = `${ROOT}/ideas/${vertical}-${stamp}`;
  writeJSON(`${base}.json`, { vertical, objection, generatedAt: new Date().toISOString(), via: 'sudegy_brain + askJSON (idea_engine)', ideas });
  const md = [`# Indirect-selling ideas: ${V.label} (${stamp})`, objection ? `Objection answered: «${objection}»\n` : '', 'Proposals for the owner. Heuristic hook score is directional only. Build one with a job file; the factory gates still apply.\n',
    ...ideas.map((x, i) => `## ${i + 1}. ${x.title}${x.problems.length ? `  (check: ${x.problems.join(', ')})` : ''}\n- Angle: ${x.angle} · Emotion: ${x.emotion} · Hook pattern: ${x.hookPattern} · score ${x.hookScore}\n- Hook: «${x.hook}»\n- First frame: ${x.firstFrame}\n- Beats: ${(x.beats || []).join(' → ')}\n- Product moment: ${x.productMoment}\n- Implicit CTA: ${x.implicitCta}\n- Success signal: ${x.seedSignal}\n- Cast: ${(x.cast || []).join(', ') || '-'}\n`)].join('\n');
  fs.writeFileSync(`${base}.md`, md);
  log(`${ideas.length} ideas -> ${base}.md`);
  ideas.forEach((x, i) => console.log(`${i + 1}. [${x.hookScore}] ${x.hook}  (${x.angle}, ${x.hookPattern})${x.problems.length ? '  !' + x.problems.join(',') : ''}`));
})().catch((e) => { console.error(e.message); process.exit(1); });
