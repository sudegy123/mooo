// TikTok post copy for a Sudan-market video: written by the Sudegy brain (BRAIN, not the Gulf one), Khartoum dialect
// pass by the Antigravity CLI (agy, text only), then gated (AGENTS.md section 8: caption starts with the search phrase,
// 3-5 hashtags, brand "Sudegy | سوديجي"; no digits, guarantees, or promises to reply/send).
// Usage: node scripts/brain_post_sudan.cjs <narration.json> <out.txt>
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);
// optional: [features shown in the video] [cta idea], so the post matches what THIS video shows and says
const [nf, out, FEAT = 'alternatives with the same active ingredient, chronic refill reminders, prescription by photo, low-stock alerts, loyalty points', CTA_IDEA = 'for a free sample of the system for their pharmacy'] = process.argv.slice(2);
const N = JSON.parse(fs.readFileSync(nf, 'utf8'));
const script = N.sentences.map((s) => s.text).join(' ');
const SEARCH = ['برنامج صيدلية', 'نظام صيدلية', 'برنامج ادارة صيدلية'];
const AGY = path.join(process.env.LOCALAPPDATA, 'agy', 'bin', 'agy.exe');

const TASK = `Write the TikTok post that goes with this short video for pharmacy owners in Sudan.
Video voice-over: ${script}
Return JSON: {"caption":"...","body":"...","cta":"...","hashtags":["...","...","...","..."]}
- caption: first line under 110 characters. It MUST start with the exact search words «${SEARCH[0]}» (people type them in TikTok search), then names the pain: the medicine is missing and the customer goes to another pharmacy.
- body: two short lines on what the system does (${FEAT}). Include the brand written exactly «Sudegy | سوديجي».
- cta: ask them to comment the word «نظام» ${CTA_IDEA}.
- hashtags: 4 relevant hashtags (Arabic or common English), include #صيدلية and #السودان. No #fyp style tags.
Language: everyday spoken Sudanese Arabic (Khartoum). No numbers, prices, percentages, guarantees, result claims, emojis, exclamation marks. Do not promise that anyone will reply or send anything.`;

function gate(r) {
  const p = [], body = `${r.caption} ${r.body} ${r.cta}`;
  if (!String(r.caption || '').trim().startsWith(SEARCH[0])) p.push(`caption must start with «${SEARCH[0]}»`);
  if (!/Sudegy \| سوديجي/.test(r.body || '')) p.push('body must contain «Sudegy | سوديجي»');
  if (!/نظام/.test(r.cta || '')) p.push('cta must contain نظام');
  if (!Array.isArray(r.hashtags) || r.hashtags.length < 3 || r.hashtags.length > 5) p.push('3-5 hashtags');
  if (/[0-9٠-٩%!]/.test(body)) p.push('no digits/%/!');
  if (/مضمون|نضمن|تضمن|مؤكد|أكبر|عالمي|تشخيص/.test(body)) p.push('banned claim word');
  if (/سنرسل|نرسل ليك|نرسل لك|بنرسل|حنرسل|سنرد|بنرد|حنرد|نتواصل|بنتواصل|حنتواصل/.test(body)) p.push('no promise to reply/send');
  if (/مربوط ببنكك|مرتبط ببنكك|يرسل براهو|بيرسل براهو|تلقائي/.test(body)) p.push('untrue claim (Bankak is not connected; WhatsApp messages are prepared, not sent automatically)');
  return p;
}
(async () => {
  let r, p = [];
  for (let k = 1; k <= 4; k++) {
    r = await askJSON(TASK + (p.length ? `\nPREVIOUS ATTEMPT FAILED: ${p.join('; ')}. Fix exactly that.` : ''), { system: brain.BRAIN(), temperature: 0.6 });
    p = gate(r); if (!p.length) break; console.error(`brain attempt ${k}: ${p.join('; ')}`);
  }
  if (p.length) throw new Error('brain post failed: ' + p.join('; '));
  const brainR = { ...r };
  // dialect pass (caption, body, cta only), re-gated; keep the brain version if agy fails the gate
  const ask = `You are a native Sudanese copy editor from Khartoum. Rewrite these three TikTok post lines into natural everyday Khartoum Sudanese Arabic, same meaning and order. Keep the first words «${SEARCH[0]}» at the very start of caption, keep «Sudegy | سوديجي» exactly in body, keep the word «نظام» in cta. Remove Gulf and Egyptian words. No numbers, guarantees, exclamation marks, emojis, and never promise to reply or send anything. Answer with ONLY JSON {"caption":"...","body":"...","cta":"..."}. Do not use any tools.\n${JSON.stringify({ caption: r.caption, body: r.body, cta: r.cta })}`;
  const a = spawnSync(AGY, ['-p', ask], { encoding: 'utf8', maxBuffer: 1 << 24, timeout: 240000 });
  const m = String(a.stdout || '').match(/\{[\s\S]*\}/);
  let used = 'brain';
  if (m) { try { const d = { ...JSON.parse(m[0]), hashtags: r.hashtags }; const q = gate(d); if (!q.length) { r = d; used = 'brain + agy dialect pass'; } else console.error('agy version failed the gate: ' + q.join('; ')); } catch { console.error('agy answer was not JSON'); } }
  const tags = r.hashtags.map((h) => (h.startsWith('#') ? h : '#' + h.replace(/\s+/g, '_')));
  const txt = `${r.caption.trim()}\n\n${r.body.trim()}\n\n${r.cta.trim()}\n\n${tags.join(' ')}\n`;
  fs.writeFileSync(out, txt);
  fs.writeFileSync(out.replace(/\.txt$/, '.json'), JSON.stringify({ source: used, brain: brainR, final: r, made: new Date().toISOString() }, null, 2));
  console.log(`(${used})\n` + txt);
})().catch((e) => { console.error(e.message); process.exit(1); });
