const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = 'G:/sudegy-video-studio';
const WORK_DIR = path.join(PROJECT_ROOT, 'factory/work/pure_saudi_master');
const MALE_RAW = path.join(WORK_DIR, 'pure_saudi_male.wav');
const FEMALE_RAW = path.join(WORK_DIR, 'pure_saudi_female.wav');

const NORM_MALE = path.join(WORK_DIR, 'voice_male_norm.wav');
const NORM_FEMALE = path.join(WORK_DIR, 'voice_female_norm.wav');

console.log('1. Normalizing Male & Female voices to EBU R128 (-14 LUFS, -1.5 dBTP)...');
execSync(`ffmpeg -y -i "${MALE_RAW}" -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 "${NORM_MALE}"`);
execSync(`ffmpeg -y -i "${FEMALE_RAW}" -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -ac 2 "${NORM_FEMALE}"`);

const durationMale = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${NORM_MALE}"`).toString().trim());
console.log('Male voice duration:', durationMale, 'seconds');

// Background music luxury_calm.wav
const MUSIC_SRC = path.join(PROJECT_ROOT, 'compositions/f-sudegy-splitscreen-02-v1/assets/audio/luxury_calm.wav');
const MIXED_AUDIO = path.join(WORK_DIR, 'narration_pure_saudi_mixed.wav');

console.log('2. Mixing voice with background luxury music...');
// Music level: subtle background (0.16) ducked during narration
execSync(`ffmpeg -y -i "${NORM_MALE}" -stream_loop 2 -i "${MUSIC_SRC}" -filter_complex "[1:a]volume=0.16,atrim=0:${durationMale + 0.6},afade=t=out:st=${durationMale}:d=0.6[bg];[0:a]adelay=100|100[vox];[bg][vox]amix=inputs=2:duration=first:dropout_transition=2" -ar 48000 -ac 2 "${MIXED_AUDIO}"`);

console.log('3. Detecting silence boundaries for precise subtitle sync...');
const silences = execSync(`ffmpeg -i "${NORM_MALE}" -af silencedetect=noise=-28dB:d=0.18 -f null - 2>&1`).toString();
const silenceLines = silences.split('\n').filter(l => l.includes('silence_'));
console.log(silenceLines.join('\n'));

fs.writeFileSync(path.join(WORK_DIR, 'silences.txt'), silenceLines.join('\n'), 'utf8');

// Copy into composition assets
const COMP_AUDIO = path.join(PROJECT_ROOT, 'compositions/f-sudegy-splitscreen-02-v1/assets/audio/narration.wav');
fs.copyFileSync(MIXED_AUDIO, COMP_AUDIO);
console.log('Copied mixed audio to:', COMP_AUDIO);

// Also copy female mixed version for variant
const MIXED_FEMALE = path.join(WORK_DIR, 'narration_pure_saudi_female_mixed.wav');
const durationFemale = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${NORM_FEMALE}"`).toString().trim());
execSync(`ffmpeg -y -i "${NORM_FEMALE}" -stream_loop 2 -i "${MUSIC_SRC}" -filter_complex "[1:a]volume=0.16,atrim=0:${durationFemale + 0.6},afade=t=out:st=${durationFemale}:d=0.6[bg];[0:a]adelay=100|100[vox];[bg][vox]amix=inputs=2:duration=first:dropout_transition=2" -ar 48000 -ac 2 "${MIXED_FEMALE}"`);
const COMP_AUDIO_FEMALE = path.join(PROJECT_ROOT, 'compositions/f-sudegy-splitscreen-02-v1/assets/audio/narration_female.wav');
fs.copyFileSync(MIXED_FEMALE, COMP_AUDIO_FEMALE);
console.log('Copied female mixed audio to:', COMP_AUDIO_FEMALE);

console.log('Audio preparation complete!');

