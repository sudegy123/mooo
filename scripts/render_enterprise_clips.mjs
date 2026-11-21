import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const ROOT = 'G:/sudegy-video-studio';
const BRAND = `${ROOT}/assets/brand`;

const run = (cmd, args) => {
  console.log(`[run] ${cmd} ${args.slice(0, 8).join(' ')}...`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false });
  if (r.status !== 0) throw new Error(`${cmd} failed with status ${r.status}`);
};

// 1. Clip Consulting: Subtle executive zoompan + glowing contrast
console.log('--- Rendering clip_consulting.mp4 ---');
const out1 = `${BRAND}/clip_consulting.mp4`;
run('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-loop', '1', '-t', '5.0', '-i', `${BRAND}/consulting.jpg`,
  '-filter_complex', `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.0+on*0.0008,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30,eq=contrast=1.05:brightness=0.01:saturation=1.08,format=yuv420p[v]`,
  '-map', '[v]', '-t', '5.0', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', out1
]);
console.log('Saved:', out1);

// 2. Clip ERP/CRM Dashboard: Dynamic cinematic camera pan across telemetry
console.log('--- Rendering clip_erpcrm.mp4 ---');
const out2 = `${BRAND}/clip_erpcrm.mp4`;
run('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-loop', '1', '-t', '5.0', '-i', `${BRAND}/erpcrm.jpg`,
  '-filter_complex', `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.02+on*0.0006,1.09)':x='iw/2-(iw/zoom/2)+sin(on*0.02)*18':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30,eq=contrast=1.06:brightness=0.02:saturation=1.1,format=yuv420p[v]`,
  '-map', '[v]', '-t', '5.0', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', out2
]);
console.log('Saved:', out2);

// 3. Clip Control Tablet: Subtle push-in on the revenue dashboard
console.log('--- Rendering clip_control.mp4 ---');
const out3 = `${BRAND}/clip_control.mp4`;
run('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-loop', '1', '-t', '5.0', '-i', `${BRAND}/control.jpg`,
  '-filter_complex', `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.0+on*0.001,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30,eq=contrast=1.05:brightness=0.01:saturation=1.06,format=yuv420p[v]`,
  '-map', '[v]', '-t', '5.0', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', out3
]);
console.log('Saved:', out3);
console.log('--- All 3 Enterprise Clips Rendered! ---');

