import { spawnSync } from 'child_process';
import fs from 'fs';

const raw = 'G:/sudegy-video-studio/assets/screens/sudegy_os_raw.mp4';
const outDir = 'G:/sudegy-video-studio/assets/screens/sudegy_os_parts';
const finalReel = 'G:/sudegy-video-studio/assets/screens/sudegy_os_mobile_reel.mp4';

fs.mkdirSync(outDir, { recursive: true });

function run(args) {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'ffmpeg failed');
}

console.log('Rendering 3 vertical clips from Sudegy OS...');

// 1. Dashboard (3.0s)
run([
  '-ss', '8.5', '-t', '3.0', '-i', raw,
  '-vf', 'crop=608:1080:420:0,scale=780:1688:force_original_aspect_ratio=increase,crop=780:1688,fps=30,format=yuv420p',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-an',
  `${outDir}/c1_dash.mp4`
]);

// 2. Pipeline (3.0s)
run([
  '-ss', '25.0', '-t', '3.0', '-i', raw,
  '-vf', 'crop=608:1080:380:0,scale=780:1688:force_original_aspect_ratio=increase,crop=780:1688,fps=30,format=yuv420p',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-an',
  `${outDir}/c2_pipe.mp4`
]);

// 3. WhatsApp CRM (3.0s)
run([
  '-ss', '48.5', '-t', '3.0', '-i', raw,
  '-vf', 'crop=608:1080:540:0,scale=780:1688:force_original_aspect_ratio=increase,crop=780:1688,fps=30,format=yuv420p',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-an',
  `${outDir}/c3_wa.mp4`
]);

// Concat them
const listPath = `${outDir}/list.txt`;
fs.writeFileSync(listPath, `file 'c1_dash.mp4'\nfile 'c2_pipe.mp4'\nfile 'c3_wa.mp4'\n`);

console.log('Concatenating into final mobile reel...');
run([
  '-f', 'concat', '-safe', '0', '-i', listPath,
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30',
  finalReel
]);

console.log('Successfully created:', finalReel);

