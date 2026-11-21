const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);

const TASK = `
We are creating a TikTok video (9:16 vertical, 25 seconds) showcasing Sudegy's latest web design & smart funnel project: an interactive luxury flower boutique store (https://flowerstore-4xu.pages.dev/).

The video is targeted at business owners, boutique brands, clinics, and store owners in the Gulf / Middle East.
The goal of the video: Show how Sudegy builds custom luxury stores and smart funnels that stop time-wasting inquiries ("بكم؟") and turn traffic into direct paying orders and qualified WhatsApp dossiers.
At the end of the video, we pitch Sudegy's November Special Launch Offer (ready in 3 days, fully integrated with WhatsApp and order management).

RULE 1: First frame (0–2s) MUST BE a strong hook: a concrete pain or result in plain Arabic words (not a logo or company name).
Generate 4 powerful, punchy hook variants for Beat 1:
1. Pain question (سؤال يلمس الألم المباشر للتاجر/صاحب النشاط في ضياع الزوار واستفسارات "بكم؟")
2. Immediate outcome/result hook (نتيجة مباشرة يراها صاحب العمل)
3. Contrast / Pattern interrupt hook (مقارنة صادمة بين متجر عادي بطيء وبين نظام ذكي يحول الزوار لمبيعات)
4. Portfolio authority hook (تقديم أحدث أعمال Sudegy بنبرة فخامة ونتيجة تجارية)

Format each hook with:
- "tag": Short luxury badge text (e.g., "✦ SUDEGY • نمو رقمي ذكي ✦")
- "title_part1": First 2-3 words (white)
- "title_part2_gold": The power phrase (gold serif)
- "card_badge": Emoji + badge title
- "card_title": Punchy statement (under 35 chars)
- "card_desc": Concise, high-converting outcome description (under 80 chars)
- "card_tag": Checkmark feature/outcome tag

Return JSON array of hooks under key "hooks".
`;

(async () => {
  try {
    const system = brain.GULF_BRAIN ? brain.GULF_BRAIN() : 'Sudegy sales engine: focus on business outcomes, eliminating "بكم؟" shopping, turning traffic into booked orders.';
    const res = await askJSON(TASK, { system, temperature: 0.5 });
    console.log(JSON.stringify(res, null, 2));
    fs.writeFileSync('G:/sudegy-video-studio/out/flower_store/brain_hooks.json', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error from brain:', err.message);
  }
})();
