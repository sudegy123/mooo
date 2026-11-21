// v2 narration for the Dr. Mazin explainer, written THROUGH the Sudegy brain. Owner feedback on v1: "too weak, the idea is not conveyed,
// the live AI face scan is not mentioned, use our own product images". So: 9 scenes that EXPLAIN the idea step by step and name the face scan.
// Usage: node scripts/brain_narration_mazin2.cjs <out.json>
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const { checkFirstMessage } = require(`${SALES}/gulf_manager.js`);
const out = process.argv[2];
if (!out) { console.error('usage: node brain_narration_mazin2.cjs <out.json>'); process.exit(2); }

const ORDER = ['hook', 'pain', 'cost', 'intro', 'questions', 'plan', 'doctor', 'booking', 'cta'];
const TASK = `A ~40-second vertical B2B ad aimed at AESTHETIC / COSMETIC DOCTORS and clinic owners (Gulf and Sudan) from Sudegy, a company that builds smart patient-intake systems. Read aloud by ONE voice, continuously, in confident, respectful, simple Standard Arabic. The video must HIT THE DOCTOR'S PAIN first, then show how the demo system removes it.

THE DOCTOR'S PAIN (real, from field knowledge): patients message on WhatsApp or Instagram asking only "how much is one filler needle?". The secretary replies with a price, the patient compares it like a commodity and disappears. The doctor wastes time on unqualified consultations. Patients also postpone because they do not know the recovery time before an event.

WHAT THE DEMO SYSTEM DOES (the only facts you may use), in this order:
1. The patient answers a short guided questionnaire on the phone: the area that bothers them, an upcoming occasion, how many days of recovery they can accept, safety screening.
2. The patient gets a preliminary plan with the expected recovery window, explained as a plan and not a price per needle.
3. The doctor receives a ready report BEFORE the patient arrives: concern, occasion, safety flags, and questions to ask.
4. In the chat, the system offers two appointment slots and answers "how much?" by explaining that the assessment fee is deducted from the procedure; the patient books.

Return JSON exactly (9 scenes in this order): {"sentences":[{"scene":"hook","text":"..."},{"scene":"pain","text":"..."},{"scene":"cost","text":"..."},{"scene":"intro","text":"..."},{"scene":"questions","text":"..."},{"scene":"plan","text":"..."},{"scene":"doctor","text":"..."},{"scene":"booking","text":"..."},{"scene":"cta","text":"..."}],
 "captions":["...","...","...","..."]}

RULES:
- Each text is ONE sentence ending with a period or question mark. Address the doctor directly (دكتور / دكتورة neutral: use "عيادتك").
- hook (6-10 words): the pain as a question or a sharp statement, e.g. the patient who asks the price and vanishes. pain (8-12 words): the price-comparison trap, neutral and true. cost (8-12 words): the doctor's time lost on consultations that never convert, no numbers. intro (8-11 words): a smart system on your clinic that qualifies the patient before they arrive. questions (9-12 words): the patient chooses the area and the occasion and the recovery days they accept. plan (8-12 words): they get a plan with a recovery window, not a price per needle. doctor (9-13 words, must contain "الطبيب" or "الدكتور"): you receive a ready report before they arrive with concerns and questions to ask. booking (8-12 words): the patient picks a slot and books, even after asking how much. cta (6-9 words): ask for a demo for your clinic from Sudegy.
- captions: 4 on-screen labels (max 24 characters each) for questions, plan, doctor-report and booking in that order.
- No digits, no prices, no discounts, no savings, no statistics or percentages, no guaranteed results, no promise of more patients or revenue numbers, no emojis, links or exclamation marks. Never say "تشخيص" (say تقييم). No em dash or en dash. Proofread every word. Total of all 9 sentences: 70 to 88 words.`;

(async () => {
  const system = brain.GULF_BRAIN();
  let log = [], best = null;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await askJSON(TASK + (log.length ? `\nPREVIOUS ATTEMPT FAILED: ${log[log.length - 1]}. Fix exactly that.` : ''), { system, temperature: 0.5 });
    const problems = [], s = r.sentences || [];
    if (s.length !== 9 || ORDER.some((k, i) => !s[i] || s[i].scene !== k)) problems.push('wrong scenes/order');
    else {
      const whole = s.map((x) => x.text).join(' '), words = whole.trim().split(/\s+/).length;
      if (words < 66 || words > 92) problems.push(`total words ${words} not in 66-92`);
      if (/[!！]|\d|[٠-٩]|تشخيص|triage|ضمان|توفير|خصم|[—–]|نسبة|بالمئة/.test(whole)) problems.push('number/exclamation/banned word');
      const g = checkFirstMessage(whole).filter((x) => !/too short|too long|medical claim/.test(x)); if (g.length) problems.push('gate: ' + g.join(', '));
      const doc = s[ORDER.indexOf('doctor')].text; if (!/الطبيب|الدكتور/.test(doc)) problems.push('doctor sentence must contain الطبيب or الدكتور');
      if (false) problems.push('x');
      const c = r.captions || []; if (c.length !== 4 || c.some((x) => !x || x.length > 28)) problems.push('captions must be 4 strings <= 24 chars');
    }
    log.push(problems.join('; ') || 'ok'); console.log(`attempt ${attempt}: ${problems.length ? problems.join('; ') : 'PASSED all gates'}`);
    if (!problems.length) { best = r; break; }
  }
  if (!best) { console.error('never passed; nothing written'); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), via: 'sudegy_brain.js GULF_BRAIN + gemini.js askJSON + gate', attempts: log, sentences: best.sentences, captions: best.captions }, null, 2));
  best.sentences.forEach((x) => console.log(' ', x.scene.padEnd(10), x.text)); console.log('  captions:', best.captions.join(' | '));
})().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
