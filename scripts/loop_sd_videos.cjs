const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'compositions/f-mazin-sd-01-v1/assets/video';
const videos = ['face_scan.mp4', 'microscope.mp4', 'product.mp4'];

for (const f of videos) {
  const p = path.join(dir, f);
  const tmp = path.join(dir, 'loop_' + f);
  console.log('Looping', f, 'to 10s with intra-keyframes...');
  execSync(`ffmpeg -y -stream_loop 3 -i "${p}" -t 10.0 -c:v libx264 -r 30 -g 1 -keyint_min 1 -preset ultrafast -movflags +faststart -an "${tmp}"`);
  fs.copyFileSync(tmp, p);
  fs.unlinkSync(tmp);
  const dur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim();
  console.log('Done', f, 'new duration:', dur);
}
console.log('All videos extended to 10s!');

