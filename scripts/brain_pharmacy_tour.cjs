// Pharmacy system tour (owner request 2026-11-19): idea → critique → verification → narration.
// Facts = ONLY what the live demo https://sudegy-pharmacy.pages.dev/ really does (checked in its code, G:\sudegy-pharmacy\cloudflare-upload).
// Steps:
//   node scripts/brain_pharmacy_tour.cjs concepts briefs/pharmacy-tour/concepts.json      brain writes 3 ideas
//   node scripts/brain_pharmacy_tour.cjs critique briefs/pharmacy-tour/concepts.json briefs/pharmacy-tour/critique.json   agy critic (independent)
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const SALES = 'C:/Users/Admin/sudegy-sales';
const AGY = path.join(process.env.LOCALAPPDATA, 'agy', 'bin', 'agy.exe');

// Verified features (id → fact). Each maps to a screen in the demo (see briefs/pharmacy-tour.md, verification table).
const FACTS = {
  F1: 'Today board: the owner sees the shift sales, gross profit, cash expected in the drawer and Bankak transfers, plus a list "needs your attention now" ranked by importance, and a one-tap WhatsApp summary of the day.',
  F2: 'Point of sale: search by medicine name, active ingredient or barcode scan. If the medicine is out of stock it shows the alternatives on the shelf with the same active ingredient (the pharmacist decides). It warns when two medicines in the same invoice interact. Payment by cash, Bankak, credit (آجل) or mixed.',
  F3: 'Prescriptions by photo: the customer sends a photo of the prescription through the pharmacy WhatsApp link; it lands on a board (new, preparing, ready, delivered); the pharmacist prepares the items, can swap one for an alternative with the same active ingredient, and a ready WhatsApp message tells the customer to come and collect.',
  F4: 'Chronic patients: blood pressure, diabetes and insulin patients with their refill dates; the system shows who is due in the next days or late, prepares a WhatsApp reminder message, and the order can be prepared before they come.',
  F5: 'Customers and loyalty: a customer registers with his phone number only, collects points with every invoice and uses them as a discount at the cashier; top customers tiers; customer credit (debts) and collection.',
  F6: 'Stock and expiry: each item with its stock, nearest expiry, price and shelf place; filters for low and out of stock; a reorder list grouped by supplier based on the daily sales rate; batches expiring within ninety days; expired batches blocked from sale; insulin fridge temperature log (manual readings or a sensor); controlled medicines register.',
  F7: 'Suppliers: what the pharmacy owes each drug company, the payment schedule and the purchase invoices.',
  F8: 'Cash desk: shift closing and reconciliation of the drawer, a log of Bankak transfer notices that warns when the same notice number is used on two invoices, expenses, profit by department.',
  F9: 'Owner control: the log flags discounts above a staff member\'s permission, deleting an invoice after printing and opening the drawer without a sale; separate permissions for owner, pharmacist and cashier.',
  F10: 'Power and internet cuts: selling continues and is saved on the device, then syncs when the connection returns.',
  F11: 'Works on the phone, the tablet and the cashier computer; the demo opens with the pharmacy\'s own name.'
};
const FORBIDDEN = 'Never say or imply: guaranteed sales, guaranteed returning customers (مضمون، نضمن، تضمن), more profit as a fact, the biggest / global, any number, price or percentage in the voice or captions. The system never prescribes and never diagnoses: the pharmacist decides on any alternative. WhatsApp messages are PREPARED by the system and sent by the pharmacist (never say it sends by itself). Bankak is not connected: the pharmacist records the notice number and the system warns about duplicates.';
const AUDIENCE = 'owners of community pharmacies in Sudan (Khartoum, Omdurman, Port Sudan, Madani); many run the pharmacy with one or two staff, suffer power cuts, lost sales when a medicine is missing, cashier mistakes and Bankak transfer fraud';
module.exports = { FACTS, FORBIDDEN, AUDIENCE };

function askAgy(prompt) {
  const r = spawnSync(AGY, ['-p', prompt], { encoding: 'utf8', maxBuffer: 1 << 24, timeout: 300000 });
  const m = String(r.stdout || '').match(/\{[\s\S]*\}/);
  if (!m) throw new Error('agy gave no JSON: ' + String(r.stdout || r.stderr || '').slice(0, 300));
  return JSON.parse(m[0]);
}

if (require.main === module) (async () => {
  const [step, a, b] = process.argv.slice(2);
  if (step === 'concepts') {
    const brain = require(`${SALES}/sudegy_brain.js`);
    const { askJSON } = require(`${SALES}/gemini.js`);
    const TASK = `We are making ONE premium vertical (9:16) video that walks a pharmacy owner through the whole Sudegy pharmacy system, like a tutorial and a showcase at once, so that owners understand what the system does, why each part matters to them, and want it.
Audience: ${AUDIENCE}.
Picture: the REAL screen recording of the system on a phone (dark black and gold design), with chapter titles, zooms on the important part of each screen and a visible finger tap. Narration: one Sudanese voice, one continuous take. Length about ninety seconds to two minutes for WhatsApp and sales; a separate short TikTok cut comes later.
Facts you may use (ONLY these): ${JSON.stringify(FACTS)}
${FORBIDDEN}
Rules: outcome-first (each chapter opens with the owner's pain or the result, then the screen proves it); the first two seconds are a moving real screen with a spoken hook of six words or fewer that names a pain or result in its first words; something changes every one to two seconds at the start; one call to action at the end: comment the word «نظام» to get a free demo in the pharmacy's name.
Give THREE clearly different ideas (different story spine: e.g. one day in the pharmacy from opening to closing, the owner who is away from the pharmacy, five problems that cost a pharmacy, etc.).
Return JSON: {"concepts":[{"name":"...","spine":"one sentence: the story idea","hook":"spoken hook in everyday Sudanese Arabic, six words or fewer","chapters":[{"facts":["F2"],"title":"short Arabic chapter title (two to four words)","pain":"the owner's pain in plain words","show":"what the screen recording shows","why":"why it matters to the owner"}],"ending":"how it ends and loops back to the start","why_it_works":"..."}]}
Use six to nine chapters per idea and cover as many facts as fit naturally (all of F1 to F11 across the chapters is best).`;
    const r = await askJSON(TASK, { system: brain.BRAIN(), temperature: 0.8 });
    fs.mkdirSync(path.dirname(a), { recursive: true });
    fs.writeFileSync(a, JSON.stringify({ source: 'brain (BRAIN)', made: new Date().toISOString(), ...r }, null, 2));
    r.concepts.forEach((c, i) => { console.log(`\n#${i + 1} ${c.name}\n  spine: ${c.spine}\n  hook: ${c.hook}`); c.chapters.forEach((ch) => console.log(`   - [${ch.facts.join(',')}] ${ch.title}: ${ch.pain}`)); console.log('  ending: ' + c.ending); });
  } else if (step === 'critique') {
    const C = JSON.parse(fs.readFileSync(a, 'utf8')).concepts;
    const prompt = `You are two people at once: (1) the owner of a busy community pharmacy in Khartoum who gets many sales messages, and (2) a strict short-video critic who knows that most viewers leave in the first two seconds. Critique these three video ideas for a pharmacy system video (a real screen recording tour with a Sudanese voice, ninety seconds to two minutes, for WhatsApp and sales). For each idea: would you keep watching after two seconds and why; is it clear what the system does; what feels fake, boring, too long or confusing for a Sudanese pharmacy owner; which chapter is the strongest and which is weak; score from one to ten. Then pick the best idea and list the concrete fixes it needs. Be honest and specific, no praise for its own sake.
Ideas (JSON): ${JSON.stringify(C)}
Answer with ONLY JSON: {"reviews":[{"name":"...","keep_watching":"...","clear":"...","weak":"...","strongest_chapter":"...","weakest_chapter":"...","score":0}],"best":"name","fixes":["..."]}. Do not use any tools.`;
    const r = askAgy(prompt);
    fs.writeFileSync(b, JSON.stringify({ source: 'agy (Gemini, Antigravity CLI) as independent critic', made: new Date().toISOString(), ...r }, null, 2));
    r.reviews.forEach((x) => console.log(`\n${x.name}: ${x.score}/10\n  keep: ${x.keep_watching}\n  weak: ${x.weak}\n  strongest: ${x.strongest_chapter} | weakest: ${x.weakest_chapter}`));
    console.log('\nBEST:', r.best); r.fixes.forEach((f) => console.log('  fix:', f));
  } else { console.error('usage: concepts <out> | critique <concepts> <out>'); process.exit(2); }
})().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
