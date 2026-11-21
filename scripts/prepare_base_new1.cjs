const { execSync } = require('child_process');
const path = require('path');

const src = 'C:/Users/Admin/Downloads/new 1.mp4';
const dst = 'G:/sudegy-video-studio/compositions/wa1031-sofa-15s/assets/base.mp4';

console.log('Re-encoding new 1.mp4 to 1080x1920 30fps with 1s keyframes...');
const cmd = `ffmpeg -y -i "${src}" -vf "scale=1080:1920:flags=lanczos" -r 30 -g 30 -keyint_min 30 -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -af "loudnorm=I=-14:TP=-1.5:LRA=7" -c:a aac -b:a 192k "${dst}"`;

execSync(cmd, { stdio: 'inherit' });
console.log('Finished preparing base.mp4');
