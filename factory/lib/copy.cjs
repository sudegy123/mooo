// Script writing for a job: the Sudegy brain writes it for the chosen viral format, local gates enforce the rules,
// a second Gemini pass proofreads spelling only, and N alternative hooks are produced for A/B variants.
const { ROOT, SALES, words, log, readJSON, fs } = require('./util.cjs');
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
let gate = null; try { gate = require(`${SALES}/gulf_manager.js`).checkFirstMessage; } catch { gate = null; }

// Hook patterns and weak openers (evidence: docs/viral-playbook-2026-11-12.md). learned.json is written by
// factory/tools/perf.cjs from this account's own TikTok numbers and biases the pattern choice.
const HOOKS = readJSON(`${ROOT}/factory/hooks.json`);
const PATTERN_IDS = HOOKS.patterns.map((p) => p.id);
const learned = () => { try { return readJSON(`${ROOT}/factory/perf/learned.json`); } catch { return null; } };
const normTxt = (t) => String(t || '').toLowerCase().replace(/[ً-ٰٟ.،؟?!,:؛«»"']/g, '').replace(/[أإآ]/g, 'ا').trim();
function weakOpener(text) {
  const t = normTxt(text);
  return [...HOOKS.weak_openers.ar, ...HOOKS.weak_openers.en].find((w) => t.startsWith(normTxt(w))) || null;
}
// Heuristic 0-100 hook score, used to order alternatives and to flag weak hooks. Directional, not a prediction.
function scoreHook(text, { pattern, search = [] } = {}) {
  const t = String(text || '').trim(), n = words(t).length, why = []; let s = 0;
  if (n <= 4) { s += 30; why.push(`${n} words`); } else if (n <= 6) { s += 24; why.push(`${n} words`); } else why.push(`${n} words, too long`);
  if (weakOpener(t)) { s -= 30; why.push('weak opener'); }
  if (/^(لا |لماذا|ليش|ليه|كم |وين|أين|توقف|احذر|انتبه|لما |يا |احفظ|اختبر|ثلاث|ثلاثة|علامتان|خطأ|أخطاء|stop|don't|why|when|pov)/i.test(t)) { s += 15; why.push('strong first word'); }
  if (/ك(\s|$|[؟?.،])|كم(\s|$|[؟?.،])|أنت|\byour?\b/i.test(t)) { s += 15; why.push('speaks to the viewer'); }
  const sw = (search || []).flatMap((p) => words(p)).map(normTxt).filter((w) => w.length > 2);
  if (sw.some((w) => normTxt(t).includes(w))) { s += 15; why.push('has a search word'); }
  if (/[؟?]/.test(t) || /(^|\s)(لا|ليس|ليست|بدون|بلا|لن|لم)\s/.test(t) || /\b(not|no|never|without|stop)\b/i.test(t)) { s += 15; why.push('tension'); }
  if (pattern && PATTERN_IDS.includes(pattern)) { s += 10; why.push(pattern); }
  return { score: Math.max(0, Math.min(100, s)), why };
}

const GLOBAL_BANNED_AR = ['تشخيص', 'triage'];
function gateSentences({ sentences, format, client, lang, allowDigits }) {
  const problems = [];
  const roles = format.roles.map((r) => r.role);
  if (sentences.length !== roles.length || roles.some((r, i) => !sentences[i] || sentences[i].role !== r)) return ['wrong roles/order: need ' + roles.join(',')];
  sentences.forEach((s, i) => {
    // the hook gets no tolerance: TikTok data 2026-11-12 (docs/tiktok-algorithm-2026-11-12.md) — viewers leave at 0:01
    const n = words(s.text).length, [mn, mx] = format.roles[i].words, tol = s.role === 'hook' ? 0 : 2;
    if (n < mn - 1 || n > mx + tol) problems.push(`${s.role} has ${n} words, needs ${mn}-${mx}`);
    if (s.role === 'hook') { const w = weakOpener(s.text); if (w) problems.push(`hook opens with a weak opener ("${w}"): start on the pain, the result or a bold claim`); }
    if (s.keyword && !s.text.includes(s.keyword)) problems.push(`${s.role} keyword "${s.keyword}" is not in the sentence`);
  });
  const all = sentences.map((s) => s.text).join(' ');
  if (!allowDigits && /\d|[٠-٩]/.test(all)) problems.push('digits are not allowed (write numbers as words)');
  if (/[!！—–]/.test(all)) problems.push('no exclamation marks or long dashes');
  if (/[\u{1F300}-\u{1FAFF}]/u.test(all)) problems.push('no emojis');
  const banned = [...GLOBAL_BANNED_AR, ...(client.banned || [])].filter((b) => all.includes(b));
  if (banned.length) problems.push('banned words: ' + banned.join(', '));
  if (lang === 'ar' && gate) { const g = gate(all).filter((x) => !/too short|too long|medical claim/.test(x)); if (g.length) problems.push('brain gate: ' + g.join(', ')); }
  return problems;
}

function prompt({ job, client, format, nHooks, lang }) {
  const L = lang === 'ar' ? 'warm, simple Standard Arabic (فصحى مبسطة) that Sudanese and Gulf viewers follow easily' : 'plain, confident English';
  return `You write the voice-over for a VIRAL vertical short video (${format.length[0]}-${format.length[1]} seconds) for ${client.name}.
Format: ${format.name_ar} — why it spreads: ${format.why}
${format.brain || ''}
Audience/market: ${client.market}. Tone: ${client.tone}. Language: ${L}. One narrator voice reads every sentence continuously.
Topic / angle for this video: ${job.topic}
${job.notes ? 'Director notes: ' + job.notes : ''}
FACTS you may use (nothing else; never invent numbers, prices, statistics, testimonials or results):
${client.facts.map((f) => '- ' + f).join('\n')}
Client rules: ${(client.rules || []).join(' ')} Never use these words: ${(client.banned || []).join('، ')}.
Write exactly these sentences in this order (one sentence each, ending with . or ؟):
${format.roles.map((r) => `- ${r.role} (${r.words[0]}-${r.words[1]} words): ${r.purpose}`).join('\n')}
${format.loop ? 'The last sentence must echo a word from the first so the video loops.' : ''}
For every sentence also give "keyword": the single most important word, copied exactly from that sentence (it will be underlined on screen).
HOOK PATTERNS (measured on large TikTok samples; the examples show structure only, write your own words):
${HOOKS.patterns.map((p) => `- ${p.id} (${p.name_ar}): ${p.how} Example: «${p.examples_ar[0]}» Limit: ${p.honesty}`).join('\n')}
${job.hookPattern ? `The main hook MUST use the pattern "${job.hookPattern}".` : 'Choose the pattern that fits this topic best for the main hook.'}${(() => { const L2 = learned(); return L2 && L2.bestPatterns && L2.bestPatterns.length ? ` On this account these patterns held viewers longest so far: ${L2.bestPatterns.join(', ')}; prefer them when they fit.` : ''; })()}
Also give ${nHooks} alternative hooks ("hooks") for A/B testing, each obeying the hook rules and each using a DIFFERENT pattern from the list (not the main hook's pattern).
Never open a hook with a greeting, "have you ever wondered", "today we will", "in this video" or a story opener such as "let me tell you".
EMOTION: build the video on ONE emotion: ${job.emotion || 'empathy for a daily pain, fear of a real avoidable loss, or curiosity'}. Do not use aspiration or hope as the main register.
INDIRECT SELLING: ${job.seed || 'teach or show something useful first; the product appears as the natural end of the story, never as a pitch, and never in the hook.'}
FEWER WORDS: stay at the short end of each word range when the picture can carry the meaning.
Rules: the hook has at most six words and names the viewer's pain or the result in its first three words (TikTok viewers decide in the first second); the topic words people would type in TikTok search appear in the hook or the next sentence; concrete and visual; no greetings; no brand name in the hook; ${lang === 'ar' ? 'no digits, write numbers in Arabic words; ' : ''}no exclamation marks, emojis, links or long dashes; gender-neutral address; proofread.
Return JSON only: {"hookPattern":"pattern id of the main hook","sentences":[{"role":"...","text":"...","keyword":"..."}],"hooks":[{"text":"...","keyword":"...","pattern":"pattern id"}]}`;
}

async function proofread(texts, lang) {
  if (lang !== 'ar') return { texts, changes: [] };
  const r = await askJSON(`You are a meticulous Arabic proofreader. Fix ONLY spelling mistakes, typos, wrong letters and clear grammar errors in each line (for example "تركوبتك" must become "تركيبتك"). Do not change word choice, style, meaning, punctuation style or length. Return JSON: {"lines":["..."],"changes":[{"from":"...","to":"..."}]} with lines in the same order.\nLINES:\n${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`, { temperature: 0 });
  const lines = Array.isArray(r.lines) && r.lines.length === texts.length ? r.lines.map((x) => String(x).replace(/^\d+\.\s*/, '').trim()) : texts;
  // only accept edits that keep the word count (spelling, not rewriting)
  const out = texts.map((t, i) => (lines[i] && Math.abs(words(lines[i]).length - words(t).length) <= 1 ? lines[i] : t));
  return { texts: out, changes: (r.changes || []).filter((c) => c && c.from && c.to && c.from !== c.to) };
}

async function writeScript({ job, client, format }) {
  const lang = job.lang || 'ar', nHooks = Math.max(0, (job.variants && job.variants.hooks || 1) - 1) + 2;
  const system = lang === 'ar' ? brain.GULF_BRAIN() : undefined;
  const log2 = []; let best = null;
  for (let a = 1; a <= 6 && !best; a++) {
    const r = await askJSON(prompt({ job, client, format, nHooks, lang }) + (log2.length ? `\nPREVIOUS ATTEMPT FAILED: ${log2[log2.length - 1]}. Fix exactly that.` : ''), { system, temperature: 0.7 });
    const p = gateSentences({ sentences: r.sentences || [], format, client, lang, allowDigits: job.allowDigits });
    log2.push(p.join('; ') || 'ok'); log(`copy attempt ${a}: ${p.length ? p.join('; ') : 'passed gates'}`);
    if (!p.length) best = r;
  }
  if (!best) throw new Error('copy never passed the gates: ' + log2.join(' | '));
  // proofread the script and the hooks (spelling only)
  const all = [...best.sentences.map((s) => s.text), ...(best.hooks || []).map((h) => h.text)];
  const pr = await proofread(all, lang);
  best.sentences.forEach((s, i) => { s.text = pr.texts[i]; if (s.keyword && !s.text.includes(s.keyword)) s.keyword = pickKeyword(s.text); });
  // name the pattern and score every hook (heuristic), then order the alternatives best first and drop repeats of the main hook
  const main = best.sentences[0], mainPattern = PATTERN_IDS.includes(best.hookPattern) ? best.hookPattern : (PATTERN_IDS.includes(job.hookPattern) ? job.hookPattern : null);
  const ms = scoreHook(main.text, { pattern: mainPattern, search: job.search }); main.pattern = mainPattern; main.hookScore = ms.score; main.hookWhy = ms.why;
  const hooks = (best.hooks || []).map((h, i) => ({ ...h, text: pr.texts[best.sentences.length + i] }))
    .filter((h) => !gateSentences({ sentences: [{ role: format.roles[0].role, text: h.text, keyword: h.keyword && h.text.includes(h.keyword) ? h.keyword : '' }], format: { ...format, roles: [format.roles[0]] }, client, lang, allowDigits: job.allowDigits }).length)
    .filter((h) => normTxt(h.text) !== normTxt(main.text))
    .map((h) => { const pt = PATTERN_IDS.includes(h.pattern) ? h.pattern : null, sc = scoreHook(h.text, { pattern: pt, search: job.search }); return { text: h.text, keyword: h.keyword, pattern: pt, score: sc.score, why: sc.why }; })
    .sort((a, b) => b.score - a.score);
  log(`hook "${main.text}" pattern ${mainPattern || '?'} score ${ms.score} (${ms.why.join(', ')})`);
  return { generatedAt: new Date().toISOString(), via: 'sudegy_brain + askJSON + hook patterns + gates + proofread', attempts: log2, proofreadChanges: pr.changes, sentences: best.sentences, hooks };
}
const pickKeyword = (t) => words(t).map((w) => w.replace(/[.،؟?]/g, '')).sort((a, b) => b.length - a.length)[0];

// social post copy for the delivery folder
const POST_BANNED = ['بدقة', 'تماما', 'تماماً', 'مضمون', 'ضمان', 'خصم', 'مجانا', 'مجاناً', '100%', 'الأفضل'];
async function writePost({ job, client, script, lang = 'ar' }) {
  for (let a = 1; a <= 4; a++) {
    const txt = await writePostOnce({ job, client, script, lang });
    const bad = [...POST_BANNED, ...(client.banned || [])].filter((b) => txt.includes(b));
    // the prompt forbids promising a reply or a send; the brain still wrote «وسنرسل لك» on 2026-11-12, so gate it
    if (/سنرسل|نرسل لك|سنرد|سنتواصل|نتواصل معك|بنرسل|we will send|we'll send|we will reply/i.test(txt)) bad.push('promise to reply/send');
    if (!bad.length && !/\d{2,}/.test(txt.replace(/#\S+/g, ''))) return txt;
    log(`post attempt ${a} rejected: ${bad.join(', ') || 'numbers'}`);
  }
  throw new Error('post copy never passed the gate');
}
async function writePostOnce({ job, client, script, lang = 'ar' }) {
  const r = await askJSON(`Write the social media post that goes with this short video for ${client.name} (${client.market}).
Video script: ${script.map((s) => s.text).join(' ')}
${job.search && job.search.length ? `Search phrases real people typed to find this topic on TikTok (from TikTok Studio): ${job.search.map((x) => `«${x}»`).join(', ')}. The caption MUST start with the first of these phrases, written naturally, and one more of them must appear in the body or the hashtags.\n` : ''}Return JSON: {"caption":"first line under 120 characters that starts with the exact words people type in TikTok search for this topic (plain words, no hashtag) and makes people open the post","body":"two to three short lines","cta":"one ask (comment a keyword or visit ${client.url})","hashtags":["max five relevant hashtags"]}.
Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Same rules: no prices, no statistics, no guarantees, no result claims, no emojis. Never use these words: ${[...POST_BANNED, ...(client.banned || [])].join('، ')}. Do not promise that someone will reply or send anything.`, { system: lang === 'ar' ? brain.GULF_BRAIN() : undefined, temperature: 0.6 });
  const tags = (r.hashtags || []).slice(0, 5).map((h) => (h.startsWith('#') ? h : '#' + h.replace(/\s+/g, '_')));
  return `${r.caption || ''}\n\n${r.body || ''}\n\n${r.cta || ''}\n\n${tags.join(' ')}`.trim();
}
module.exports = { writeScript, writePost, gateSentences, proofread, scoreHook, weakOpener, HOOKS };
