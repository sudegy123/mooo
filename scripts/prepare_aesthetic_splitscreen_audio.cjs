// scripts/prepare_aesthetic_splitscreen_audio.cjs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const workDir = path.join(PROJECT_ROOT, 'factory', 'work', 'sudegy-splitscreen-aesthetic');
if (!fs.existsSync(workDir)) {
  fs.mkdirSync(workDir, { recursive: true });
}

const rawMp3 = path.join(workDir, 'voice_raw.mp3');
const normWav = path.join(workDir, 'voice_norm.wav');

// Complete Arabic script
const scriptText = 'على اليمين: عيادة تجميل تدفع آلاف الريالات إعلانات، وتستقبل مئات الرسائل تسأل: بكم الإبرة؟ وتنتهي المحادثة دون حجز! وعلى اليسار: عيادة تستخدم بروتوكول سوديجي التجميلي الذكي.. تفحص المريضة مناطق وجهها ووقت مناسبتها، وتصل بياناتها كتقرير منظم للطبيب على الواتساب، محولة السائلين إلى باقات علاجية مؤكدة! أي العيادتين تفضل أن تكون؟ احصل على ديمو تجريبي مجاني بهوية عيادتك لمعاينته الآن على جوالك. اكتب كلمة: تجميل، في التعليقات أو الخاص، وسنرسل لك الرابط فوراً.';

console.log('1. Generating Saudi executive voiceover with edge-tts (ar-SA-HamedNeural)...');
const pythonCmd = `python "${path.join(PROJECT_ROOT, 'scripts', 'generate_edge_tts.py')}" "${scriptText}" "${rawMp3}" "ar-SA-HamedNeural" "+2%"`;
execSync(pythonCmd, { stdio: 'inherit' });

console.log('2. Normalizing audio with ffmpeg loudnorm to -14.0 LUFS / -1.5 dBTP...');
execSync(`ffmpeg -y -i "${rawMp3}" -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 "${normWav}"`, { stdio: 'inherit' });

const probeDuration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${normWav}"`).toString().trim();
const totalSec = parseFloat(probeDuration);
console.log('Normalized audio duration:', totalSec, 'seconds');

console.log('3. Detecting silence boundaries for timeline sync...');
const silences = execSync(`ffmpeg -i "${normWav}" -af silencedetect=noise=-30dB:d=0.15 -f null - 2>&1`).toString();
const lines = silences.split('\n').filter(l => l.includes('silence_'));
console.log(lines.join('\n'));

// Copy to composition audio folder
const compAudioDir = path.join(PROJECT_ROOT, 'compositions', 'f-sudegy-splitscreen-02-v1', 'assets', 'audio');
if (!fs.existsSync(compAudioDir)) {
  fs.mkdirSync(compAudioDir, { recursive: true });
}
fs.copyFileSync(normWav, path.join(compAudioDir, 'narration.wav'));

// Background luxury music
const musicSrc = path.join(PROJECT_ROOT, 'assets', 'audio', 'luxury_calm.wav');
if (fs.existsSync(musicSrc)) {
  fs.copyFileSync(musicSrc, path.join(compAudioDir, 'luxury_calm.wav'));
}

const timingData = {
  text: scriptText,
  voiceDuration: totalSec,
  totalWithPadding: Math.ceil((totalSec + 1.0) * 10) / 10,
  silenceLines: lines
};

fs.writeFileSync(path.join(workDir, 'timing.json'), JSON.stringify(timingData, null, 2));
console.log('Audio setup complete:', timingData);

