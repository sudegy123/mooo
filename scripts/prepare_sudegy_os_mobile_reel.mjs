import { spawnSync } from 'child_process';
import fs from 'fs';

const src = 'G:/sudegy-video-studio/assets/screens/sudegy_os_raw.mp4';
const outDir = 'G:/sudegy-video-studio/assets/screens/sudegy_os_parts';
fs.mkdirSync(outDir, { recursive: true });

function run(args) {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'ffmpeg failed');
}

// Extract 4 key operational sections cropped to vertical 720:1280 (9:16) with ZERO watermark:
// Part 1: Dashboard & Performance (10s to 18s in raw)
console.log('Extracting Part 1 (Dashboard)...');
run([
  '-ss', '10', '-t', '8', '-i', src,
  '-vf', 'crop=608:1080:360:0,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
  `${outDir}/part1_dashboard.mp4`
]);

// Part 2: Sales & Kanban Pipeline (26s to 34s in raw)
console.log('Extracting Part 2 (Pipeline)...');
run([
  '-ss', '26', '-t', '8', '-i', src,
  '-vf', 'crop=608:1080:380:0,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
  `${outDir}/part2_pipeline.mp4`
]);

// Part 3: WhatsApp CRM & Direct Messaging (48s to 56s in raw)
console.log('Extracting Part 3 (WhatsApp CRM)...');
run([
  '-ss', '48', '-t', '8', '-i', src,
  '-vf', 'crop=608:1080:540:0,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
  `${outDir}/part3_whatsapp.mp4`
]);

// Part 4: Excel Import & Cloud System (66s to 74s in raw)
console.log('Extracting Part 4 (Excel Import)...');
run([
  '-ss', '66', '-t', '8', '-i', src,
  '-vf', 'crop=608:1080:380:0,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30',
  '-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast',
  `${outDir}/part4_excel.mp4`
]);

console.log('Done extracting parts!');

