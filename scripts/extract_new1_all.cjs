const { execSync } = require('child_process');
const f = 'C:/Users/Admin/Downloads/new 1.mp4';
const outDir = 'G:/sudegy-video-studio/temp_inspect/new1_frames';
const fs = require('fs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (let i = 1; i <= 14; i += 2) {
  const t = i < 10 ? `00:00:0${i}` : `00:00:${i}`;
  execSync(`ffmpeg -y -ss ${t} -i "${f}" -vframes 1 -q:v 2 "${outDir}/frame_${i}s.jpg"`);
}
console.log('Extracted frames 1 to 14s');
