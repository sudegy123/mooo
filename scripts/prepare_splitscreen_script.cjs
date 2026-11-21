const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';

// The 3 Hook Variants requested by AGENTS.md rule 4 and the user's brief
const VARIANTS = [
  {
    id: 'v1_visual',
    name: 'التباين البصري المباشر',
    hook_ar: 'شاهد الفرق: على اليمين فوضى استقبال تهدر الإعلانات، وعلى اليسار نظام ذكي يفرز الحالات في ثوانٍ.',
    hook_keyword: 'الفرق'
  },
  {
    id: 'v2_cost',
    name: 'ألم الهدر المالي والإعلاني',
    hook_ar: 'عيادة تنفق عشرين ألفاً في الإعلانات وتضيع الرسائل، أم عيادة تستقبل تقارير الحالات الجاهزة تلقائياً؟',
    hook_keyword: 'عشرين ألفاً'
  },
  {
    id: 'v3_october',
    name: 'موسم أكتوبر وفرز الحالات',
    hook_ar: 'في موسم أكتوبر: هل تفضل استقبال رسائل عشوائية، أم ملفات مرضى مفروزة ومجهزة قبل الاستشارة؟',
    hook_keyword: 'أكتوبر'
  }
];

// Common body script with fully articulated numbers for flawless Arabic TTS pronunciation
const BODY_SENTENCES = [
  {
    scene: 'right_chaos',
    text: 'على اليمين: عيادة تنفق عشرين ألف ريال إعلانات وتستقبل رسائل عشوائية تضيع في الكول سنتر.',
    keyword: 'عشوائية'
  },
  {
    scene: 'left_sudegy',
    text: 'وعلى اليسار: عيادة تستخدم نظام فرز سوديجي الوردي.. المريضة تفحص أسنانها أو بشرتها في مجسم ثلاثي الأبعاد بخمس عشرة ثانية.',
    keyword: 'مجسم'
  },
  {
    scene: 'result_time',
    text: 'وتصل بياناتها للطبيب قبل أن تدخل العيادة، موفرة عشر دقائق كاملة من وقت الاستشارة.',
    keyword: 'الاستشارة'
  },
  {
    scene: 'october_offer',
    text: 'أي العيادتين تفضل أن تكون في موسم أكتوبر؟ احصل على خصم خمسة وثلاثين بالمئة مع ديمو تجريبي مجاني بهوية عيادتك لمعاينته قبل الدفع.',
    keyword: 'أكتوبر'
  },
  {
    scene: 'cta',
    text: 'اكتب كلمة (وردي) في الرسائل، وسنرسل لك رابط التجربة الحية على هاتفك فوراً.',
    keyword: 'وردي'
  }
];

fs.mkdirSync(`${ROOT}/briefs/splitscreen`, { recursive: true });
fs.writeFileSync(`${ROOT}/briefs/splitscreen/script_variants.json`, JSON.stringify({ VARIANTS, BODY_SENTENCES }, null, 2), 'utf8');

console.log('Script variants prepared.');

