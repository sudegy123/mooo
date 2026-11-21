const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = 'compositions/f-mazin-sd-01-v1/assets/video';
const videos = ['face_scan.mp4', 'microscope.mp4', 'product.mp4'];

for (const f of videos) {
  const p = path.join(dir, f);
  const tmp = path.join(dir, 'tmp_' + f);
  console.log('Re-encoding', f, '...');
  execSync(`ffmpeg -y -i "${p}" -c:v libx264 -r 30 -g 1 -keyint_min 1 -preset ultrafast -movflags +faststart -an "${tmp}"`);
  fs.copyFileSync(tmp, p);
  fs.unlinkSync(tmp);
  console.log('Finished', f);
}
console.log('All videos re-encoded with intra-keyframes!');

