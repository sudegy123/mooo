const formats = require("../factory/formats.json");
const client = require("../factory/clients/sudegy.json");
const { gateSentences } = require("../factory/lib/copy.cjs");

const format = formats["dental-smart-triage"];
const sentences = [
  {
    role: "hook",
    text: "يا دكتور، كم مريض أسنانه بتوجعه بالليل وبيضيع منك؟",
    keyword: "بالليل"
  },
  {
    role: "intro",
    text: "بدال وصف الوجع الملخبط، وفرنا لعيادتك فحص تفاعلي ثلاثي الأبعاد.",
    keyword: "الأبعاد"
  },
  {
    role: "demo",
    text: "يدخل المريض فما افتراضيا، يحدد السن والأعراض، ويستلم إرشاد أولي فوري.",
    keyword: "السن"
  },
  {
    role: "outcome",
    text: "وعيادتك تستلم تقرير منظم على واتساب بالحالة كاملة قبل موعد الزيارة.",
    keyword: "واتساب"
  },
  {
    role: "cta",
    text: "في سوديجي بنطور أنظمة مخصصة لمراكز الأسنان، تواصل معنا عبر موقعنا Sudegy.com.",
    keyword: "سوديجي"
  }
];

const p = gateSentences({ sentences, format, client, lang: "ar", allowDigits: false });
console.log("Problems:", p);
