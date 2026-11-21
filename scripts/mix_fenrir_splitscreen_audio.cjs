const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = 'G:/sudegy-video-studio';
const workDir = path.join(PROJECT_ROOT, 'factory/work/fenrir_aesthetic');
const normWav = path.join(workDir, 'fenrir_norm.wav');
const musicSrc = path.join(PROJECT_ROOT, 'compositions/f-sudegy-splitscreen-02-v1/assets/audio/luxury_calm.wav');
const mixedWav = path.join(workDir, 'fenrir_mixed.wav');

const duration = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${normWav}"`).toString().trim());
console.log('Norm duration:', duration);

console.log('1. Mixing Fenrir voice with luxury_calm music (ducked)...');
execSync(`ffmpeg -y -i "${normWav}" -stream_loop 2 -i "${musicSrc}" -filter_complex "[1:a]volume=0.16,atrim=0:${duration + 0.6},afade=t=out:st=${duration}:d=0.6[bg];[0:a]adelay=100|100[vox];[bg][vox]amix=inputs=2:duration=first:dropout_transition=2" -ar 48000 -ac 2 "${mixedWav}"`);

const compAudio = path.join(PROJECT_ROOT, 'compositions/f-sudegy-splitscreen-02-v1/assets/audio/narration.wav');
fs.copyFileSync(mixedWav, compAudio);
console.log('Copied mixed Fenrir audio to:', compAudio);

