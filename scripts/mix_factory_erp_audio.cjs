const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workDir = "G:\\sudegy-video-studio\\factory\\work\\factory_erp";
const voiceWav = path.join(workDir, "fenrir_norm.wav");
const musicWav = "G:\\sudegy-video-studio\\compositions\\f-sudegy-crm-01-v3\\assets\\music.wav";
const outMix = path.join(workDir, "final_mix.wav");

console.log("Mixing voice and background music...");
// Duck music by -20dB and mix with voice
const mixCmd = `ffmpeg -y -i "${voiceWav}" -stream_loop -1 -i "${musicWav}" -filter_complex "[1:a]volume=0.18,afade=t=in:st=0:d=1,afade=t=out:st=35.5:d=2[bg];[0:a]volume=1.0[vo];[vo][bg]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-14:TP=-1.5:LRA=11[out]" -map "[out]" "${outMix}"`;

execSync(mixCmd, { stdio: 'inherit' });

const duration = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outMix}"`).toString().trim());
console.log(`Final mixed audio ready: ${outMix}, duration: ${duration.toFixed(2)}s`);
