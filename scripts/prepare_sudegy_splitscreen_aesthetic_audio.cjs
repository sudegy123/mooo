// scripts/prepare_sudegy_splitscreen_aesthetic_audio.cjs
// Generate executive Saudi/Gulf voiceover for Sudegy Split-Screen Aesthetic Clinic Video

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const workDir = path.join(PROJECT_ROOT, 'factory', 'work', 'sudegy-splitscreen-aesthetic');
if (!fs.existsSync(workDir)) {
  fs.mkdirSync(workDir, { recursive: true });
}

const rawWav = path.join(workDir, 'voice_raw.wav');
const normWav = path.join(workDir, 'voice_norm.wav');

const scriptText = 'على اليمين: عيادة تجميل تدفع آلاف الريالات إعلانات وتستقبل مئات الرسائل تسأل: بكم الإبرة؟ وتنتهي المحادثة دون حجز! وعلى اليسار: عيادة تستخدم بروتوكول سوديجي التجميلي الذكي.. تفحص المريضة مناطق وجهها ووقت مناسبتها، وتصل بياناتها كتقرير منظم للطبيب على الواتساب قبل الحجز! أي العيادتين تفضل أن تكون؟ احصل على ديمو تجريبي مجاني بهوية عيادتك لمعاينته الآن على جوالك. اكتب كلمة: تجميل، في التعليقات أو الخاص، وسنرسل لك الرابط فوراً.';

console.log('1. Generating authoritative Saudi/Gulf executive voiceover with Fenrir...');
const stylePrompt = 'authoritative executive corporate Saudi Arabic male speaker, confident, clear, engaging, persuasive, professional broadcast pace';
execSync(`node "${path.join(PROJECT_ROOT, 'scripts', 'gemini_tts.mjs')}" "${scriptText}" "${rawWav}" Fenrir "${stylePrompt}"`, { stdio: 'inherit' });

console.log('2. Normalizing audio with ffmpeg loudnorm to -14.0 LUFS...');
execSync(`ffmpeg -y -i "${rawWav}" -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 "${normWav}"`, { stdio: 'inherit' });

const probeDuration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${normWav}"`).toString().trim();
const totalSec = parseFloat(probeDuration);
console.log('Normalized audio duration:', totalSec, 'seconds');

console.log('3. Detecting silence boundaries for sync...');
const silences = execSync(`ffmpeg -i "${normWav}" -af silencedetect=noise=-30dB:d=0.15 -f null - 2>&1`).toString();
const lines = silences.split('\n').filter(l => l.includes('silence_'));
console.log(lines.join('\n'));

const timingData = {
  text: scriptText,
  voiceDuration: totalSec,
  totalWithPadding: Math.ceil((totalSec + 1.2) * 10) / 10
};

fs.writeFileSync(path.join(workDir, 'timing.json'), JSON.stringify(timingData, null, 2));
console.log('Audio preparation complete! Info:', timingData);

