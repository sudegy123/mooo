// Continuous narration for the 30-second Sudegy luxury enterprise brand video.
// Written THROUGH the Sudegy brain (GULF_BRAIN + gemini.js askJSON + quality gates).
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
let gate = null; try { gate = require(`${SALES}/gulf_manager.js`).checkFirstMessage; } catch { gate = null; }

const out = process.argv[2] || 'G:/sudegy-video-studio/briefs/narration_luxury.json';

const TASK = `You are the lead copywriter and brand voice for Sudegy (سوديجي).
We have a 30-second ultra-luxury, cinematic enterprise brand video featuring:
1. (0-6s): Elite executives boarding a private jet on a red carpet, overlooking a modern skyline.
2. (6-12s): Close-up of a high-end skeleton mechanical watch with intricate gears being wound, followed by a celebratory gala dinner toast.
3. (12-18s): A black Lamborghini Aventador driving along a coastal highway, followed by fireworks exploding over the Burj Khalifa and city skyline.
4. (18-25s): A confident, smiling business leader in a tuxedo on a luxury yacht at night, followed by a golden-hour aerial view of downtown Dubai.
5. (25-30s): The golden shining SUDEGY logo on black.

SUDEGY'S FACTS & IDENTITY (use only these principles):
- Sudegy builds custom customer-acquisition and smart operational engines (bespoke ERP and CRM systems) for enterprises and high-ticket service businesses.
- We feature senior business specialists (including a consultant with GLG) who audit operational workflows and revenue bottlenecks first.
- We do not build generic templates; our senior engineers architect custom systems tailored precisely to your operational cycle with full ownership.
- Tone: Authoritative, executive, visionary, calm, prestigious Standard Arabic (فصحى فخمة وواثقة).

Write a continuous voice-over narration in ONE flowing take.
Return JSON exactly:
{
  "sentences": [
    { "scene": "ambition", "text": "...", "duration": "0-6s" },
    { "scene": "precision", "text": "...", "duration": "6-12s" },
    { "scene": "velocity", "text": "...", "duration": "12-18s" },
    { "scene": "peace", "text": "...", "duration": "18-25s" },
    { "scene": "closing", "text": "...", "duration": "25-30s" }
  ]
}

RULES:
- Exactly these 5 scenes in this order.
- Each text is ONE sentence ending with a period.
- Word counts per sentence:
  1. ambition: 10-14 words (about high ambitions, true enterprise leadership).
  2. precision: 11-15 words (comparing operational excellence to precision mechanics).
  3. velocity: 10-14 words (how Sudegy engineers custom systems to accelerate growth).
  4. peace: 11-15 words (giving the leader full ownership and complete operational control).
  5. closing: 6-9 words (the prestigious signature: سوديجي.. أنظمة ذكية تليق بطموحك).
- Total words across all 5 sentences: 55 to 68 words (matching exactly 26-28s of spoken audio).
- No digits (write numbers in words if needed), no prices, no discounts, no guarantees.
- Never use these words: تشخيص, ضمان, مضمون, خصم.
- No exclamation marks, no emojis, no English words (except Sudegy or سوديجي).
- Must flow seamlessly as one continuous narrative take.`;

(async () => {
  const system = brain.GULF_BRAIN();
  let log = [], best = null;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await askJSON(TASK + (log.length ? `\nPREVIOUS ATTEMPT FAILED: ${log[log.length - 1]}. Fix exactly that.` : ''), { system, temperature: 0.6 });
    const problems = [];
    const s = r.sentences || [];
    const order = ['ambition', 'precision', 'velocity', 'peace', 'closing'];
    if (s.length !== 5 || order.some((k, i) => !s[i] || s[i].scene !== k)) problems.push('wrong scenes/order');
    else {
      const whole = s.map((x) => x.text).join(' ');
      const words = whole.trim().split(/\s+/).length;
      if (words < 50 || words > 72) problems.push(`total words ${words} not in 50-72`);
      if (/[!！]|\d|[٠-٩]|تشخيص|triage|ضمان|مضمون|خصم|[—–]/.test(whole)) problems.push('banned word/digit/punctuation');
      if (gate) {
        const g = gate(whole).filter((x) => !/too short|too long|medical claim/.test(x));
        if (g.length) problems.push('brain gate: ' + g.join(', '));
      }
    }
    log.push(problems.join('; ') || 'ok');
    console.log(`attempt ${attempt}: ${problems.length ? problems.join('; ') : 'PASSED all gates'}`);
    if (!problems.length) { best = r; break; }
  }
  if (!best) { console.error('Narration never passed gates'); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), via: 'sudegy_brain.js GULF_BRAIN + gemini.js askJSON', sentences: best.sentences }, null, 2));
  console.log('Successfully written to:', out);
  best.sentences.forEach((s) => console.log(`  [${s.scene}] ${s.text} (${s.text.split(/\\s+/).length} words)`));
})();

