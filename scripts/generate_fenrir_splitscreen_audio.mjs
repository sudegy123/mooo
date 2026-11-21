import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_ROOT = 'G:/sudegy-video-studio';
const outDir = path.join(PROJECT_ROOT, 'factory/work/fenrir_aesthetic');
fs.mkdirSync(outDir, { recursive: true });

const scriptText = `على اليمين: عيادة تنفق آلاف الريالات في الإعلانات، وتستقبل مئات الرسائل تسأل: بكم الإبرة؟ وتنتهي المحادثة دون حجز! وعلى اليسار: عيادة تستخدم بروتوكول سوديجي التجميلي الذكي.. تفحص المراجعة مناطق وجهها وتحدد وقت مناسبتها بثواني، وتصل بياناتها كتقرير كامل للطبيب على الواتساب قبل أن تدخل العيادة، محولة السؤال السطحي لباقة علاجية مؤكدة! أي العيادتين تفضل أن تكون؟ احصل على ديمو تجريبي مجاني بهوية عيادتك لمعاينته الآن على جوالك. اكتب كلمة: (تجميل) في الخاص أو التعليقات، وسنرسل لك الرابط فوراً.`;

const rawWav = path.join(outDir, 'fenrir_raw.wav');
const normWav = path.join(outDir, 'fenrir_norm.wav');

console.log('1. Calling Gemini TTS with voice Fenrir...');
execSync(`node scripts/gemini_tts.mjs "${scriptText}" "${rawWav}" Fenrir "fast, energetic, punchy marketing ad, quick pace, Saudi professional tone"`, { stdio: 'inherit' });

console.log('2. Normalizing to EBU R128 (-14 LUFS, -1.5 dBTP)...');
execSync(`ffmpeg -y -i "${rawWav}" -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 "${normWav}"`, { stdio: 'inherit' });

const duration = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${normWav}"`).toString().trim());
console.log('Fenrir normalized audio duration:', duration, 'seconds');

console.log('3. Detecting silence boundaries for sync...');
const silences = execSync(`ffmpeg -i "${normWav}" -af silencedetect=noise=-30dB:d=0.15 -f null - 2>&1`).toString();
const lines = silences.split('\n').filter(l => l.includes('silence_'));
console.log(lines.join('\n'));

fs.writeFileSync(path.join(outDir, 'duration.json'), JSON.stringify({ duration, script: scriptText }, null, 2));

