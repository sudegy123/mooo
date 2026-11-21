// Generates ALL on-screen copy + the accompanying WhatsApp message for a video THROUGH the Sudegy brain (AGENTS.md rule 3).
// Imports sudegy-sales read-only: GULF_BRAIN rules, gemini.js askJSON, and the checkFirstMessage quality gate. Edits nothing there.
// Usage: node scripts/brain_copy.cjs <out.json>
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const { checkFirstMessage } = require(`${SALES}/gulf_manager.js`);

const out = process.argv[2];
if (!out) { console.error('usage: node brain_copy.cjs <out.json>'); process.exit(2); }

const FACTS = `WHAT THE VIDEO SHOWS (these are the only facts you may use; it is the REAL live demo of a sample clinic website, not a signed client):
- A visitor opens the clinic page on the phone, steps into a 3D mouth, taps the tooth that bothers them.
- Answers a few simple questions: how it feels, how strong (1-10), how long, whether it wakes them at night.
- Gets a plain summary with a suggested urgency (for example "book within 24 hours") and general guidance. The page itself says it is guidance, not a diagnosis.
- One tap sends that summary to the clinic on WhatsApp, so the clinic receives a ready, organised booking request.
VIDEO FORMAT: 15 seconds, vertical, must be understood on mute. Beats: hook 0-2s, one pain line 2-4s, demo (3 captions) 4-11s, result 11-13s, closing line 13-15s.
It is a sample built to show the idea; Sudegy would build the same for the clinic in the clinic's own name and branding (free mockup offer is allowed).`;

const TASK = `${FACTS}

TASK: write the Arabic (white Gulf Arabic, لهجة بيضاء مهذبة) copy for this video and the first WhatsApp message that carries it. Return JSON exactly:
{
 "hooks":[
  {"id":"a","type":"problem_question","text":"...","cta":"..."},
  {"id":"b","type":"immediate_benefit","text":"...","cta":"..."},
  {"id":"c","type":"direct_callout","text":"...","cta":"..."}
 ],
 "pain_line":"...",
 "demo_captions":["...","...","..."],
 "result_line":"...",
 "message":"..."
}
RULES:
- hooks[].text: max 38 characters, readable in under 2 seconds, one idea. Types: a = a question that makes the owner picture a booking request waiting; b = a short plain benefit; c = a direct callout to clinic owners/managers. NEVER assert something about THEIR clinic (no "you are losing patients", no "your reception is busy"). No numbers, percentages, prices, guarantees, results claims, emojis, links, exclamation marks.
- hook b must state what the owner GETS (an outcome in plain words), not describe a process or feature. Hook c must name dental clinic owners ("عيادات الأسنان"), not "medical clinics".
- hooks[].cta: max 34 characters, shown at the END, AFTER the viewer has watched the whole demo, so it must be the NEXT step (for example getting a free sample in the clinic's own name and branding), never "watch" or "see how". It still pays off THAT hook's promise (message-match). Say "نموذج" (a sample page in their name) and never "معاينة" (it reads like a medical exam). No price, no deadline, no "الآن".
- pain_line: max 46 characters, neutral and true for any clinic (about enquiries arriving at night/weekend), not an accusation. Natural, fluent, concise Arabic: one clear idea, no repeated words or redundant phrasing.
- demo_captions: three PLAIN STRINGS (not objects), each max 22 characters, matching the three demo moments: pick the tooth / describe the pain / get the summary and next step. Do not use the words تشخيص or triage.
- result_line: max 46 characters: what the clinic team sees (a ready, organised booking request on WhatsApp). No numbers.
- message: the FIRST WhatsApp message per GULF OUTREACH RULES (40-70 words, 3-4 short lines, greeting + self-intro, one true observation limited to: the attached 15-second video shows a sample, one sentence of what we would build for THEIR clinic, ONE permission question). No link, no price, no emojis, no medical claims, never the words تشخيص or triage. Use "الفيديو المرفق" as the reference to the video.`;

(async () => {
  const system = brain.GULF_BRAIN();
  let best = null, log = [];
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = await askJSON(TASK + (log.length ? `\nPREVIOUS ATTEMPT FAILED: ${log[log.length - 1]}. Fix exactly that.` : ''), { system, temperature: 0.6 });
    const problems = [];
    const gate = checkFirstMessage(r.message);
    if (gate.length) problems.push('message gate: ' + gate.join(', '));
    const bad = /(تشخيص|triage|%|\d)/i;
    (r.hooks || []).forEach((h) => { if ((h.text || '').length > 42) problems.push(`hook ${h.id} too long (${h.text.length})`); if ((h.cta || '').length > 38) problems.push(`cta ${h.id} too long (${h.cta.length})`); if (bad.test(h.text + ' ' + h.cta)) problems.push(`hook/cta ${h.id} contains number or banned word`); if (/[!！]|[\u{1F300}-\u{1FAFF}]/u.test(h.text + h.cta)) problems.push(`hook/cta ${h.id} exclamation/emoji`); });
    if ((r.pain_line || '').length > 50) problems.push('pain_line too long');
    // models sometimes return {step,text} objects instead of strings: normalise before checking
    r.demo_captions = (r.demo_captions || []).map((c) => (typeof c === 'string' ? c : (c && (c.text || c.caption)) || ''));
    r.demo_captions.forEach((c, i) => { if (!c || c.length > 26 || /(تشخيص|triage)/i.test(c)) problems.push(`caption ${i} empty/long/banned (${c.length})`); });
    if ((r.result_line || '').length > 50 || /\d/.test(r.result_line || '')) problems.push('result_line long/number');
    if (!r.hooks || r.hooks.length !== 3 || !r.demo_captions || r.demo_captions.length !== 3) problems.push('wrong shape');
    log.push(problems.join('; ') || 'ok');
    console.log(`attempt ${attempt}: ${problems.length ? problems.join('; ') : 'PASSED all gates'}`);
    if (!problems.length) { best = r; break; }
  }
  if (!best) { console.error('brain output never passed the gates; nothing written'); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), via: 'sudegy_brain.js GULF_BRAIN + gemini.js askJSON + gulf_manager.checkFirstMessage', attempts: log, copy: best }, null, 2));
  console.log('written', out);
})().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
