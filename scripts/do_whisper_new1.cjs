const { execSync } = require('child_process');
const fs = require('fs');

const CLI = 'G:/sudegy-video-studio/tools/whisper/bin/Release/whisper-cli.exe';
const MODEL = 'G:/sudegy-video-studio/tools/whisper/models/ggml-small.bin';
const wav = 'G:/sudegy-video-studio/scripts/new1_audio.wav';
const outBase = 'G:/sudegy-video-studio/scripts/new1_whisper';

const cmd = `"${CLI}" -m "${MODEL}" -l de -f "${wav}" -oj -of "${outBase}" -np`;
console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });

const res = JSON.parse(fs.readFileSync(`${outBase}.json`, 'utf8'));
console.log('TRANSCRIPTION RESULTS:');
for (const s of (res.transcription || [])) {
  console.log(`[${(s.offsets.from/1000).toFixed(2)}s -> ${(s.offsets.to/1000).toFixed(2)}s] ${s.text}`);
}
