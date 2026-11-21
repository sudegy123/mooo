const { execSync } = require('child_process');
const fs = require('fs');

const outDir = 'G:/sudegy-video-studio/out/edit/wa1031/frames_sofa_15s';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const v = 'G:/sudegy-video-studio/out/edit/wa1031/wa1031_sofa_15s_master.mp4';
const frames = [
  { t: '00:00:02.0', file: `${outDir}/f1_hook.jpg` },
  { t: '00:00:04.5', file: `${outDir}/f2_nein.jpg` },
  { t: '00:00:08.5', file: `${outDir}/f3_prophylaxe.jpg` },
  { t: '00:00:12.5', file: `${outDir}/f4_youth.jpg` },
  { t: '00:00:14.5', file: `${outDir}/f5_outro.jpg` }
];

for (const f of frames) {
  execSync(`ffmpeg -y -ss ${f.t} -i "${v}" -vframes 1 -q:v 2 "${f.file}"`, { stdio: 'inherit' });
}

const sheetOut = 'G:/sudegy-video-studio/out/edit/wa1031/wa1031_sofa_15s_sheet.jpg';
const filter = '[0:v]scale=360:640[v0];[1:v]scale=360:640[v1];[2:v]scale=360:640[v2];[3:v]scale=360:640[v3];[4:v]scale=360:640[v4];[v0][v1][v2][v3][v4]hstack=inputs=5[out]';
const inputs = frames.map(f => `-i "${f.file}"`).join(' ');

execSync(`ffmpeg -y ${inputs} -filter_complex "${filter}" -map "[out]" -q:v 2 "${sheetOut}"`, { stdio: 'inherit' });

const brainTarget = 'C:/Users/Admin/.gemini/antigravity/brain/11143204-27b0-4b54-8f79-7d9c5c17f03e/wa1031_sofa_15s_sheet.jpg';
fs.copyFileSync(sheetOut, brainTarget);
console.log('SUCCESS! Sheet generated at:', sheetOut, 'and copied to:', brainTarget);
