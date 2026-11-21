// English version of the aesthetic-doctors ad narration, generated through the shared Gemini helper; includes a "proof" sentence about the published sources.
// Usage: node scripts/brain_narration_aesthetic_en.cjs <out.json>
const fs = require('fs');
const { askJSON } = require('C:/Users/Admin/sudegy-sales/gemini.js');
const out = process.argv[2];
const ORDER = ['hook', 'pain', 'cost', 'intro', 'questions', 'plan', 'doctor', 'booking', 'proof', 'cta'];
const TASK = `A ~48-second vertical B2B ad in ENGLISH aimed at AESTHETIC / COSMETIC DOCTORS and clinic owners, from Sudegy, a company that builds smart patient-intake systems. Read aloud by ONE voice, continuously, in confident, respectful, plain English that a non-native reader can follow. Hit the doctor's pain first, then show how the demo system removes it.

THE DOCTOR'S PAIN: patients message on WhatsApp or Instagram asking only "how much is one filler needle?". The reply gives a price, the patient compares it like a commodity and disappears. The doctor wastes time on consultations that never convert.

WHAT THE DEMO SYSTEM DOES (the only facts you may use), in this order:
1. The patient answers a short guided questionnaire on the phone: the area that bothers them, an upcoming occasion, how many recovery days they accept, safety screening.
2. The patient gets a preliminary plan with an expected recovery window, explained as a plan and not a price per needle.
3. The doctor receives a ready report BEFORE the patient arrives: concern, occasion, safety flags and questions to ask.
4. In the chat the system offers two appointment slots and answers "how much?" by explaining the assessment fee is deducted from the procedure; the patient books.
5. PROOF: the question flow is informed by published sources: a 2020 consensus on pre and post treatment of facial injectables, a study that recorded the most frequent questions of 30 aesthetic patients, and a study of public views on cosmetic procedures in Riyadh. It is informed by them, NOT validated or certified by them, and it is a demonstration, not a medical device.

Return JSON exactly: {"sentences":[{"scene":"hook","text":"..."},{"scene":"pain","text":"..."},{"scene":"cost","text":"..."},{"scene":"intro","text":"..."},{"scene":"questions","text":"..."},{"scene":"plan","text":"..."},{"scene":"doctor","text":"..."},{"scene":"booking","text":"..."},{"scene":"proof","text":"..."},{"scene":"cta","text":"..."}],"captions":["...","...","...","..."]}

RULES:
- Each text is ONE sentence ending with a period or question mark, 7 to 10 words, no more.
- hook: the pain as a question about the patient who asks the price and vanishes. pain: the price-comparison trap. cost: the doctor's time lost on consultations that never convert, no numbers. intro: a smart system on your clinic that qualifies the patient before they arrive. questions: the patient picks the area, the occasion and the recovery days they accept. plan: a plan with a recovery window, not a price per needle. doctor: a ready report reaches the doctor before the patient arrives (must contain the word "doctor"). booking: the patient books a slot, even after asking the price. proof: the questions are informed by published clinical research (say "informed by", never "proven", "validated" or "certified"). cta: ask Sudegy for a demo for your clinic.
- captions: 4 on-screen labels (max 22 characters) for questions, plan, doctor report and booking, in that order.
- No digits (write numbers as words), no prices, no discounts, no statistics or percentages, no guaranteed results, no promise of more patients or revenue, no emojis, no exclamation marks, no em or en dashes. The word "diagnosis" is not allowed (say assessment). Proofread every word. Total of all 10 sentences: 70 to 95 words.`;
(async () => {
  let log = [], best = null;
  for (let a = 1; a <= 6; a++) {
    const r = await askJSON(TASK + (log.length ? `\nPREVIOUS ATTEMPT FAILED: ${log[log.length - 1]}. Fix exactly that.` : ''), { temperature: 0.5 });
    const p = [], s = r.sentences || [];
    if (s.length !== 10 || ORDER.some((k, i) => !s[i] || s[i].scene !== k)) p.push('wrong scenes/order');
    else {
      const whole = s.map((x) => x.text).join(' '), words = whole.trim().split(/\s+/).length;
      if (words < 70 || words > 95) p.push(`total words ${words} not in 70-95`);
      s.forEach((x) => { const n = x.text.trim().split(/\s+/).length; if (n > 11) p.push(`${x.scene} has ${n} words`); });
      if (/[!]|\d|[—–]|diagnos|guarantee|proven|validated|certified|percent|%/i.test(whole)) p.push('banned word, digit or dash');
      if (!/doctor/i.test(s[6].text)) p.push('doctor sentence must contain doctor');
      if (!/informed/i.test(s[8].text)) p.push('proof sentence must say informed');
      const c = r.captions || []; if (c.length !== 4 || c.some((x) => !x || x.length > 24)) p.push('captions must be 4 strings <= 22 chars');
    }
    log.push(p.join('; ') || 'ok'); console.log(`attempt ${a}: ${p.length ? p.join('; ') : 'PASSED all gates'}`);
    if (!p.length) { best = r; break; }
  }
  if (!best) { console.error('never passed'); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), via: 'gemini.js askJSON + local gate', attempts: log, sentences: best.sentences, captions: best.captions }, null, 2));
  best.sentences.forEach((x) => console.log(' ', x.scene.padEnd(10), x.text)); console.log('  captions:', best.captions.join(' | '));
})().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
