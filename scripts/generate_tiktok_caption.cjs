const fs = require('fs');
const SALES = 'C:/Users/Admin/sudegy-sales';
const brain = require(`${SALES}/sudegy_brain.js`);
const { askJSON } = require(`${SALES}/gemini.js`);

const TASK = `
We are publishing the video on TikTok (and Instagram Reels) for Sudegy.
Video topic: Showcasing Sudegy's latest work (an interactive luxury boutique flower store: flowerstore-4xu.pages.dev) demonstrating how a custom smart store/funnel eliminates "بكم؟" questions and turns visitors into direct paying orders and qualified WhatsApp dossiers.
Special November Offer: Full system ready in 3 days with WhatsApp integration and CRM.

Write 3 distinct TikTok / Reels video descriptions (Captions / وصف الفيديو):

Option 1: Pain & Problem Solver (مباشر يلمس ألم التجار وضياع إعلاناتهم في "بكم؟" مع حل Sudegy)
Option 2: Behind-The-Scenes & Portfolio Authority (استعراض كواليس تصميم وبرمجة متجر فاخر وكيف يرفع المبيعات)
Option 3: Short Punchy Viral (قصير، سريع، مركز على عرض نوفمبر الخاص)

For each option provide:
- Hook Line (السطر الأول الجاذب في الوصف قبل "قراءة المزيد")
- Body (نص الوصف مقسم لأسطر قصيرة مريحة للقراءة)
- CTA (الدعوة لاتخاذ إجراء واضحة: رابط البايو / رسائل خاصة)
- Hashtags (هاشتاقات نشطة ومستهدفة للخليج ورواد الأعمال والمتاجر الإلكترونية)

Also generate the accompanying WhatsApp message (under 60 words per Sudegy Brain rules) for direct outreach.

Return JSON format:
{
  "options": [
    {
      "title": "...",
      "hook": "...",
      "body": "...",
      "cta": "...",
      "hashtags": "..."
    }
  ],
  "whatsapp_message": "..."
}
`;

(async () => {
  try {
    const system = brain.GULF_BRAIN ? brain.GULF_BRAIN() : 'Sudegy sales engine: high converting copy for businesses in the Gulf.';
    const res = await askJSON(TASK, { system, temperature: 0.6 });
    fs.writeFileSync('G:/sudegy-video-studio/out/flower_store/video_captions.json', JSON.stringify(res, null, 2));
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
