const { execSync } = require('child_process');
const fs = require('fs');

const f1 = 'C:/Users/Admin/Downloads/new 1.mp4';
const f1080 = 'C:/Users/Admin/Downloads/WhatsApp_Video_2026-11-10_at_4.31.27_e362200f_1080p.mp4';

// Extract audio from new 1.mp4
const wav = 'G:/sudegy-video-studio/scripts/new1_audio.wav';
execSync(`ffmpeg -y -i "${f1}" -vn -ac 1 -ar 16000 "${wav}"`);

// Transcribe with whisper-cli
execSync(`G:/sudegy-video-studio/factory/bin/whisper-cli.exe -m G:/sudegy-video-studio/factory/models/ggml-base.bin -f "${wav}" --language de -oj -of G:/sudegy-video-studio/scripts/new1_trans`);

const transJson = JSON.parse(fs.readFileSync('G:/sudegy-video-studio/scripts/new1_trans.json', 'utf8'));
console.log('TRANSCRIPTION OF new 1:');
console.log(JSON.stringify(transJson.transcription, null, 2));

// Also extract 3 frames from f1 and f1080 to compare quality
execSync(`ffmpeg -y -ss 00:00:03 -i "${f1}" -vframes 1 -q:v 2 G:/sudegy-video-studio/scripts/f1_sample.jpg`);
execSync(`ffmpeg -y -ss 00:00:03 -i "${f1080}" -vframes 1 -q:v 2 G:/sudegy-video-studio/scripts/f1080_sample.jpg`);
console.log('Frames extracted');
