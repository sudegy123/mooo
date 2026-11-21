const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = 'G:/sudegy-video-studio/out/edit/wa1031/frames_v3';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const v = 'G:/sudegy-video-studio/out/edit/wa1031/wa1031_9x16_motion_v3_master.mp4';
const frames = [
  { t: '00:00:02.5', file: `${outDir}/f1_hook.jpg` },
  { t: '00:00:09.5', file: `${outDir}/f2_prophylaxe.jpg` },
  { t: '00:00:15.0', file: `${outDir}/f3_mimic.jpg` },
  { t: '00:00:24.0', file: `${outDir}/f4_youth.jpg` },
  { t: '00:00:31.5', file: `${outDir}/f5_outro.jpg` }
];

for (const f of frames) {
  execSync(`ffmpeg -y -ss ${f.t} -i "${v}" -vframes 1 -q:v 2 "${f.file}"`, { stdio: 'inherit' });
}

const sheetOut = 'G:/sudegy-video-studio/out/edit/wa1031/wa1031_motion_v3_sheet.jpg';
const filter = '[0:v]scale=360:640[v0];[1:v]scale=360:640[v1];[2:v]scale=360:640[v2];[3:v]scale=360:640[v3];[4:v]scale=360:640[v4];[v0][v1][v2][v3][v4]hstack=inputs=5[out]';
const inputs = frames.map(f => `-i "${f.file}"`).join(' ');

execSync(`ffmpeg -y ${inputs} -filter_complex "${filter}" -map "[out]" -q:v 2 "${sheetOut}"`, { stdio: 'inherit' });

const brainTarget = 'C:/Users/Admin/.gemini/antigravity/brain/11143204-27b0-4b54-8f79-7d9c5c17f03e/wa1031_motion_v3_sheet.jpg';
fs.copyFileSync(sheetOut, brainTarget);
console.log('SUCCESS! Sheet generated at:', sheetOut, 'and copied to:', brainTarget);
