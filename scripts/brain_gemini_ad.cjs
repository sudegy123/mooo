// All words of a 3-clip Gemini ad (spoken lines A/B, overlays, CTA), written THROUGH the Sudegy brain (AGENTS.md rule 3),
// then the three video prompts built from fixed director templates (docs/gemini-video-prompts-2026-11-19.md).
// Input: briefs/gemini-video/<slug>.concept.json (market, dialect, owner's offer, forbidden claims, story, cast).
// Output: briefs/gemini-video/<slug>.json in the shape build_gemini_pair.cjs reads (lineA, lineB, overlay, ctaWord, prompts).
// Usage: node scripts/brain_gemini_ad.cjs briefs/gemini-video/<slug>.concept.json
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const cf = process.argv[2]; if (!cf) { console.error('usage: node scripts/brain_gemini_ad.cjs <concept.json>'); process.exit(2); }
const C = JSON.parse(fs.readFileSync(cf, 'utf8'));
const out = cf.replace(/\.concept\.json$/, '.json');

const TASK = `You write every word of a short vertical video ad for ${C.audience}. Market: ${C.market}.
The ad is three AI-generated clips. Clip A: ${C.story.A} Clip B: ${C.story.B} Clip C: ${C.story.C}
The offer (the owner's own words, the ONLY facts you may use): ${C.offer}
${C.forbidden_claims}

Return JSON exactly:
{"hook":"...","lineA":"...","lineB":"...","behind":"...","rows":["...","...","..."],"ctaWord":"...","cta":"..."}
- Language for everything: ${C.dialect}.
- lineA: spoken by the pharmacist to camera in clip A, 7 to 11 words, ONE sentence. It starts with the hook.
- hook: the first 3 to 6 words of lineA, naming the pain in its first words (what pharmacy owners feel, not a question to the viewer).
- lineB: spoken by the pharmacist in clip B, 7 to 11 words, ONE sentence: what the system lets him do (show available alternatives), never a promised outcome.${C.lineBIdea ? ` Meaning to express: ${C.lineBIdea}` : ''}
- behind: 1 or 2 words naming the pain, shown huge behind his head in clip A.
- rows: 3 features from the offer as iPhone-style switches, 2 to 3 words each, at most 16 characters each including spaces. Start with the alternatives feature.
- ctaWord: ONE simple Arabic word pharmacy owners comment to get the free sample (${C.ctaHint}).
- cta: the closing on-screen line, 4 to 8 words, contains «ctaWord» written inside «», asks them to comment that word for a free sample of the system for their pharmacy. One sentence, no question mark.
No numbers, prices, percentages, guarantees, emojis, exclamation marks, or medical claims.
QUALITY: read every line aloud first. It must sound like a real pharmacist in ${C.market} talking to a friend: correct grammar, short everyday words, the pharmacist speaks about himself in the first person singular, no stiff written phrases. Every switch row must be instantly clear to a pharmacy owner.
${(C.rejected || []).length ? 'Rejected earlier (do NOT write anything like these): ' + C.rejected.map((x) => `«${x}»`).join(' ; ') : ''}`;

const wc = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
(async () => {
  let r, p = [];
  for (let k = 1; k <= 5; k++) {
    r = await askJSON(TASK + (p.length ? `\nPREVIOUS ATTEMPT FAILED: ${p.join('; ')}. Fix exactly that.` : ''), { system: brain.BRAIN(), temperature: 0.6 });
    p = [];
    if (wc(r.hook) < 3 || wc(r.hook) > 6) p.push('hook must be 3-6 words');
    if (!String(r.lineA || '').startsWith(String(r.hook || '').replace(/[.؟?،]$/, ''))) p.push('lineA must start with the hook');
    for (const x of ['lineA', 'lineB']) { const n = wc(r[x]); if (n < 7 || n > 11) p.push(`${x} has ${n} words (7-11)`); }
    if (wc(r.behind) < 1 || wc(r.behind) > 2) p.push('behind must be 1-2 words');
    if (!Array.isArray(r.rows) || r.rows.length !== 3 || r.rows.some((x) => wc(x) < 2 || wc(x) > 3 || x.trim().length > 16)) p.push('rows: 3 rows of 2-3 words, max 16 characters');
    if (wc(r.ctaWord) !== 1) p.push('ctaWord must be one word');
    if (!r.cta || !r.cta.includes(`«${String(r.ctaWord || '').trim()}»`) || wc(r.cta) < 4 || wc(r.cta) > 8) p.push('cta must be 4-8 words and contain «ctaWord»');
    if (/[0-9٠-٩%!]|مضمون|تضمن|نضمن|مؤكد|دائم|أكبر|عالمي|تشخيص|وصف/.test(JSON.stringify(r))) p.push('banned digit or claim word (guarantee, biggest/global, diagnosis, prescribing)');
    const rej = (C.rejected || []).map((x) => x.replace(/\s*\(.*\)\s*$/, '').trim());
    const hit = [r.lineA, r.lineB, r.behind, ...(r.rows || [])].filter((x) => rej.some((y) => String(x || '').includes(y) || y.includes(String(x || '').trim())));
    if (hit.length) p.push('repeats rejected text: ' + hit.join(' / '));
    if (C.lineBMust && !String(r.lineB || '').includes(C.lineBMust)) p.push(`lineB must contain «${C.lineBMust}»`);
    if (!p.length) break;
    console.error(`attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('brain copy failed the gate: ' + p.join('; '));

  const { pharmacist, customer, place } = C.cast;
  const frame = 'Vertical 9:16. One single continuous shot, no scene cuts. Locked-off camera on a tripod at eye level behind the counter line, medium shot, the pharmacist centred with his face in the upper third and clear space above his head.';
  const look = 'Realistic, natural skin texture, shot on a modern smartphone camera, true-to-life colours.';
  const neg = 'No on-screen text, no captions, no subtitles, no logos, no readable brand names on any box or sign, no music.';
  const prompts = {
    A: `${frame} ${look} ${pharmacist}, standing behind the counter of ${place}. ${customer} stands at the counter in the foreground, seen from the side, holding a paper prescription. [0-4s] The pharmacist looks straight into the camera, worried, and immediately says in Sudanese Arabic: "${r.lineA}" [4-8s] He turns to the shelves, searches, shakes his head; the customer takes back his prescription and walks out of frame. The pharmacist exhales and looks back into the camera. Sound: his voice, quiet street noise from outside. ${neg}`,
    // every prompt repeats the full cast: each generation starts without memory of the others
    B: `${frame} ${look} ${pharmacist}, standing behind the counter of ${place}. ${customer} stands at the counter in the foreground, seen from the side. Exactly the same framing and camera position as the previous clip. [0-2s] The pharmacist looks down at the tablet on the counter and taps it, his face relaxes. [2-4s] He takes a plain white medicine box from the shelf and hands it to the customer, who nods and smiles. [4-8s] The pharmacist looks into the camera, calm and confident, and says in Sudanese Arabic: "${r.lineB}" Sound: his voice, a soft tap on the tablet, quiet street noise. ${neg}`,
    C: `Vertical 9:16. One single continuous shot, no scene cuts. Slow, smooth push-in from a wide shot of ${place}, organised shelves, two customers being served, and behind the counter ${pharmacist}, smiling while he works. ${look} Calm and welcoming. Sound: soft room tone only. No dialogue. ${neg}`,
  };
  const res = {
    slug: C.slug, vertical: C.vertical, market: C.market, concept: cf, hook: r.hook.trim(), lineA: r.lineA.trim(), lineB: r.lineB.trim(),
    ctaWord: r.ctaWord.trim(), overlay: { behind: r.behind.trim(), rows: r.rows.map((x) => x.trim()), cta: r.cta.trim() },
    prompts, made: new Date().toISOString(),
  };
  fs.writeFileSync(out, JSON.stringify(res, null, 2));
  console.log(JSON.stringify({ hook: res.hook, lineA: res.lineA, lineB: res.lineB, ctaWord: res.ctaWord, overlay: res.overlay }, null, 1));
  console.log('written ' + out);
})().catch((e) => { console.error(e.message); process.exit(1); });
