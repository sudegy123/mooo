const formats = require("../factory/formats.json");
const client = require("../factory/clients/sudegy.json");
const { gateSentences } = require("../factory/lib/copy.cjs");

const format = formats["before-after-review"];
const sentences = [
  {
    role: "hook",
    text: "شوف الفرق لما متجرك يتحول من قالب عادي لبراند فخم على أصوله.",
    keyword: "الفرق"
  },
  {
    role: "before",
    text: "الموقع قبل كان معمول بقالب ويكس عادي وبطيء وفيهو لخبطة في القوائم.",
    keyword: "ويكس"
  },
  {
    role: "after",
    text: "سوديجي بنت متجر مخصص كامل بتصميم فاخر وسرعة خيالية مربوط بالواتساب.",
    keyword: "فاخر"
  },
  {
    role: "review",
    text: "ورأي صاحبة المتجر كان: يا سلام ده إنجاز عالمي شكرا بجد.",
    keyword: "عالمي"
  },
  {
    role: "cta",
    text: "عايز تحول متجرك لبراند عالمي؟ تواصل معنا عبر موقعنا Sudegy.com.",
    keyword: "Sudegy.com"
  }
];

const p = gateSentences({ sentences, format, client, lang: "ar", allowDigits: false });
console.log("Problems:", p);

