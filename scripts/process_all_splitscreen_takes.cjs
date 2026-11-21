const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';

function run(cmd, args, opt = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opt });
  if (r.status !== 0 && !opt.soft) {
    console.error(cmd, args.join(' '), r.stderr || '');
    throw new Error(`Command failed: ${cmd}`);
  }
  return r;
}

function dur(f) {
  return +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
}

const VARIANTS = [
  {
    id: 'v1_visual',
    name: 'التباين البصري المباشر',
    sentences: [
      { id: 's1', scene: 'right_chaos', text: 'على اليمين: عيادة تنفق عشرين ألف ريال إعلانات وتستقبل رسائل عشوائية تضيع في الكول سنتر.', keyword: 'عشوائية' },
      { id: 's2', scene: 'left_sudegy', text: 'وعلى اليسار: عيادة تستخدم نظام فرز سوديجي الوردي.. المريضة تفحص أسنانها أو بشرتها في مجسم ثلاثي الأبعاد بخمس عشرة ثانية.', keyword: 'مجسم' },
      { id: 's3', scene: 'result_time', text: 'وتصل بياناتها للطبيب قبل أن تدخل العيادة، موفرة عشر دقائق من وقت الاستشارة.', keyword: 'الاستشارة' },
      { id: 's4', scene: 'october_offer', text: 'أي العيادتين تفضل أن تكون في موسم أكتوبر؟ احصل على خصم خمسة وثلاثين بالمئة مع ديمو تجريبي مجاني بهوية عيادتك قبل الدفع.', keyword: 'أكتوبر' },
      { id: 's5', scene: 'cta', text: 'اكتب كلمة وردي في الرسائل، وسنرسل لك رابط التجربة الحية على هاتفك فوراً.', keyword: 'وردي' }
    ]
  },
  {
    id: 'v2_cost',
    name: 'ألم الهدر المالي والإعلاني',
    sentences: [
      { id: 's1', scene: 'right_chaos', text: 'لماذا تخسر العيادات ميزانية الإعلانات في رسائل عشوائية؟ على اليمين: إعلانات تضيع في الكول سنتر وأوراق متراكمة.', keyword: 'عشوائية' },
      { id: 's2', scene: 'left_sudegy', text: 'وعلى اليسار: عيادة تستخدم نظام فرز سوديجي الوردي.. المريضة تفحص حالتها بمجسم ثلاثي الأبعاد بخمس عشرة ثانية،', keyword: 'مجسم' },
      { id: 's3', scene: 'result_time', text: 'وتصل بياناتها للطبيب قبل أن تدخل العيادة، موفرة عشر دقائق من وقت الاستشارة.', keyword: 'الاستشارة' },
      { id: 's4', scene: 'october_offer', text: 'أي العيادتين تفضل في موسم أكتوبر؟ احصل على خصم خمسة وثلاثين بالمئة مع ديمو تجريبي مجاني بهوية عيادتك قبل الدفع.', keyword: 'أكتوبر' },
      { id: 's5', scene: 'cta', text: 'اكتب كلمة وردي في الرسائل، وسنرسل لك رابط التجربة الحية فوراً.', keyword: 'وردي' }
    ]
  },
  {
    id: 'v3_october',
    name: 'موسم أكتوبر وفرز الحالات',
    sentences: [
      { id: 's1', scene: 'right_chaos', text: 'في موسم أكتوبر: هل تفضل استقبال رسائل عشوائية، أم ملفات مرضى مفروزة ومجهزة قبل الاستشارة؟ على اليمين: فوضى استقبال وأوراق متراكمة.', keyword: 'فوضى' },
      { id: 's2', scene: 'left_sudegy', text: 'وعلى اليسار: عيادة تستخدم نظام فرز سوديجي الوردي.. تفحص المريضة أسنانها أو بشرتها في مجسم ثلاثي الأبعاد،', keyword: 'مجسم' },
      { id: 's3', scene: 'result_time', text: 'وتصل بياناتها للطبيب قبل دخول العيادة، موفرة عشر دقائق من وقت الاستشارة.', keyword: 'الاستشارة' },
      { id: 's4', scene: 'october_offer', text: 'أي العيادتين تفضل أن تكون؟ احصل على خصم خمسة وثلاثين بالمئة مع ديمو تجريبي مجاني بهوية عيادتك قبل الدفع.', keyword: 'أكتوبر' },
      { id: 's5', scene: 'cta', text: 'اكتب كلمة وردي في الرسائل، وسنرسل لك رابط التجربة الحية فوراً.', keyword: 'وردي' }
    ]
  }
];

function processAllTakes() {
  for (const v of VARIANTS) {
    const rawWav = `${ROOT}/factory/work/splitscreen/${v.id}_raw.wav`;
    const cleanWav = `${ROOT}/factory/work/splitscreen/${v.id}_clean.wav`;
    const finalWav = `${ROOT}/factory/work/splitscreen/${v.id}_final.wav`;
    const timingFile = `${ROOT}/factory/work/splitscreen/${v.id}_timing.json`;

    console.log(`\n=================== Processing ${v.id} ===================`);
    // 1) Clean silences and apply tempo=1.08 + loudnorm
    run('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-i', rawWav,
      '-af', 'silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-35dB,atempo=1.08,loudnorm=I=-14:TP=-1.5:LRA=11',
      '-ar', '48000', '-ac', '1',
      cleanWav
    ]);

    const D = dur(cleanWav);
    console.log(`Clean duration: ${D.toFixed(2)}s`);

    // 2) Find sentence boundaries
    const sil = run('ffmpeg', ['-hide_banner', '-i', cleanWav, '-af', 'silencedetect=noise=-34dB:d=0.08', '-f', 'null', '-'], { soft: true }).stderr;
    let pauses = [];
    let st = null;
    for (const m of sil.matchAll(/silence_(start|end): ([0-9.]+)/g)) {
      if (m[1] === 'start') st = +m[2];
      else if (st != null) {
        pauses.push([st, +m[2]]);
        st = null;
      }
    }

    const merged = [];
    for (const p of pauses) {
      const l = merged[merged.length - 1];
      if (l && p[0] - l[1] < 0.08) l[1] = p[1];
      else merged.push([...p]);
    }

    const chars = v.sentences.map((s) => s.text.replace(/\s+/g, '').length);
    const total = chars.reduce((a, b) => a + b, 0);
    let acc = 0;
    const expected = chars.slice(0, -1).map((c) => (acc += c) / total * D);
    const chosen = [];
    let lastIdx = -1;

    expected.forEach((e) => {
      const cand = [];
      merged.forEach((p, i) => {
        if (i <= lastIdx) return;
        const mid = (p[0] + p[1]) / 2;
        if (Math.abs(mid - e) <= 2.5) {
          cand.push({ i, p, dur: p[1] - p[0], d: Math.abs(mid - e) });
        }
      });
      if (!cand.length) {
        chosen.push([Math.max(0, e - 0.05), e + 0.05]);
      } else {
        cand.sort((x, y) => (y.dur - x.dur) || (x.d - y.d));
        chosen.push(cand[0].p);
        lastIdx = cand[0].i;
      }
    });

    const O = 0.15;
    const sentTimings = v.sentences.map((s, i) => {
      const start = +(O + (i === 0 ? 0 : chosen[i - 1][1])).toFixed(2);
      const end = +(O + (i === v.sentences.length - 1 ? D : chosen[i][0])).toFixed(2);
      return {
        id: s.id,
        scene: s.scene,
        text: s.text,
        keyword: s.keyword,
        start,
        end,
        duration: +(end - start).toFixed(2)
      };
    });

    const timingData = {
      variant: v.id,
      name: v.name,
      totalDuration: +(D + O + 0.5).toFixed(2),
      voiceDuration: +D.toFixed(2),
      sentences: sentTimings
    };

    fs.writeFileSync(timingFile, JSON.stringify(timingData, null, 2), 'utf8');
    fs.copyFileSync(cleanWav, finalWav);
    console.log(`Saved ${v.id} timing (${timingData.totalDuration}s total):`);
    sentTimings.forEach((s) => console.log(`  [${s.start}s - ${s.end}s] (${s.duration}s) ${s.scene}: ${s.text.slice(0, 30)}...`));
  }
}

processAllTakes();

