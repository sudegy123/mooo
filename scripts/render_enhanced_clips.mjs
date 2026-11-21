import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'G:/sudegy-video-studio';
const MAZIN_SRC = `${ROOT}/assets/mazin_src`;

const run = (cmd, args) => {
  console.log(`[run] ${cmd} ${args.slice(0, 8).join(' ')}...`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (r.status !== 0) throw new Error(`${cmd} failed with status ${r.status}`);
};

// 1. Generate Ultra Microscopic Dive (microscope_dive_ultra.mp4 - 5.0 seconds, 1080x1920 @ 30fps)
console.log('--- Generating microscope_dive_ultra.mp4 ---');
const outMicro = `${MAZIN_SRC}/microscope_dive_ultra.mp4`;
const faceImg = `${MAZIN_SRC}/face_still.png`;
const microImg = `${MAZIN_SRC}/microscope_skin.jpg`;

const microFilter = [
  `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.04,4.2)':x='iw/2+(710-iw/2)*(zoom-1)/3.2':y='ih/2+(880-ih/2)*(zoom-1)/3.2':d=60:s=1080x1920:fps=30[zface];`,
  `[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.05+on*0.002,1.35)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30[zmicro];`,
  `[zface][zmicro]xfade=transition=fade:duration=0.5:offset=1.5[vbase];`,
  `[vbase]eq=contrast=1.06:brightness=0.01:saturation=1.1,format=yuv420p[vfinal]`
].join('');

run('ffmpeg', [
  '-y',
  '-loglevel', 'error',
  '-loop', '1', '-t', '2.1', '-i', faceImg,
  '-loop', '1', '-t', '5.0', '-i', microImg,
  '-filter_complex', microFilter,
  '-map', '[vfinal]',
  '-t', '5.0',
  '-c:v', 'libx264',
  '-crf', '16',
  '-preset', 'fast',
  outMicro
]);
console.log('Saved:', outMicro);

// 2. Generate Ultra Biometric Face Scan (face_scan_ultra.mp4 - 5.0 seconds, 1080x1920 @ 30fps)
console.log('--- Generating face_scan_ultra.mp4 ---');
const outScan = `${MAZIN_SRC}/face_scan_ultra.mp4`;
const scanImg = `${MAZIN_SRC}/face_scan.jpg`;

const scanFilter = [
  `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.0+on*0.0006,1.06)':d=150:s=1080x1920:fps=30[fbase];`,
  `[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.0+on*0.0006,1.06)':d=150:s=1080x1920:fps=30[sbase];`,
  `[fbase][sbase]xfade=transition=wipedown:duration=1.2:offset=0.8[swiped];`,
  `[swiped]format=yuv420p[scanfinal]`
].join('');

run('ffmpeg', [
  '-y',
  '-loglevel', 'error',
  '-loop', '1', '-t', '2.0', '-i', faceImg,
  '-loop', '1', '-t', '5.0', '-i', scanImg,
  '-filter_complex', scanFilter,
  '-map', '[scanfinal]',
  '-t', '5.0',
  '-c:v', 'libx264',
  '-crf', '16',
  '-preset', 'fast',
  outScan
]);
console.log('Saved:', outScan);
console.log('--- All enhanced clips generated successfully! ---');

