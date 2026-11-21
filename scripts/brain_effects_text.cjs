// On-screen words for /effects overlays, written THROUGH the Sudegy brain (AGENTS.md rule 3).
// Reads the brief written by brain_gemini_video.cjs (vertical + spoken lines) and adds:
//   behind  = 1-2 word pain word that glows behind the head in clip A (spotlight)
//   rows    = 3 short settings rows (2-4 words) that switch on in clip B (apple-toggles): what the system lets patients do
//   comment = one word the viewer is invited to comment (comment-box)
// Usage: node scripts/brain_effects_text.cjs briefs/gemini-video/<name>.json
const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
const file = process.argv[2]; if (!file) { console.error('usage: node scripts/brain_effects_text.cjs <brief.json>'); process.exit(2); }
const B = JSON.parse(fs.readFileSync(file, 'utf8'));

const TASK = `A short vertical ad for ${B.vertical} businesses in the Gulf. Clip A, she says: "${B.lineA}". Clip B, after a match cut, she says: "${B.lineB}".
The offer: ${brain.OFFERS[B.vertical]}
Write the on-screen words for the overlays. Return JSON exactly: {"behind":"...","rows":["...","...","..."],"comment":"..."${B.ctaWord ? ',"cta":"..."' : ''}}${B.ctaWord ? `\n- cta: the closing on-screen line, 4 to 8 Arabic words, asking the viewer to send us the word «${B.ctaWord}» (write it exactly like that, inside «») to get a free sample page for their clinic. One sentence, no question mark.` : ''}
- behind: 1 or 2 Arabic words naming the pain of clip A, shown huge behind her head.
- rows: 3 rows of 2 to 3 Arabic words each, at most 16 characters per row including spaces (they sit next to a switch on a narrow card), shown as iPhone setting switches turning on in clip B. Each row is something the clinic page lets patients do (a feature), consistent with lineB. Not results, not promises.
- comment: ONE Arabic word viewers would type in the comments to get the free sample.
No numbers, percentages, guarantees, emojis, exclamation marks, medical claims, or the word تشخيص.`;

(async () => {
  let r, p = [];
  for (let k = 1; k <= 4; k++) {
    r = await askJSON(TASK + (p.length ? `\nPREVIOUS ATTEMPT FAILED: ${p.join('; ')}. Fix exactly that.` : ''), { system: brain.GULF_BRAIN(), temperature: 0.5 });
    p = []; const wc = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
    if (wc(r.behind) < 1 || wc(r.behind) > 2) p.push('behind must be 1-2 words');
    if (!Array.isArray(r.rows) || r.rows.length !== 3 || r.rows.some((x) => wc(x) < 2 || wc(x) > 3 || x.trim().length > 16)) p.push('rows must be 3 rows of 2-3 words, max 16 characters each');
    if (wc(r.comment) !== 1) p.push('comment must be one word');
    if (/[0-9٠-٩%!]|تشخيص|مضمون|مؤكد|دائم/.test(JSON.stringify(r))) p.push('banned digit/word');
    if (B.ctaWord && (!r.cta || !r.cta.includes(`«${B.ctaWord}»`) || wc(r.cta) < 4 || wc(r.cta) > 8)) p.push(`cta must be 4-8 words and contain «${B.ctaWord}»`);
    if (!p.length) break; console.error(`attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('gate: ' + p.join('; '));
  B.overlay = { behind: r.behind.trim(), rows: r.rows.map((x) => x.trim()), comment: r.comment.trim(), ...(r.cta ? { cta: r.cta.trim() } : {}) };
  fs.writeFileSync(file, JSON.stringify(B, null, 2));
  console.log(JSON.stringify(B.overlay, null, 1));
})().catch((e) => { console.error(e.message); process.exit(1); });
