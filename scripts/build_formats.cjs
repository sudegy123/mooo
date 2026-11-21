const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = 'G:/sudegy-video-studio';
const OUT_DIR = `${ROOT}/READY_TO_SEND/sudegy/split-screen-october`;

fs.mkdirSync(OUT_DIR, { recursive: true });

function run(cmd, args) {
  console.log(`Running: ${cmd} ${args.slice(0, 4).join(' ')}...`);
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error(`Command failed: ${cmd}`);
  }
  return r;
}

const srcV1 = `${ROOT}/out/split-screen-pink-october/v1_visual.mp4`;
const master9x16 = `${OUT_DIR}/v1_visual_9x16.mp4`;
const master1x1 = `${OUT_DIR}/v1_visual_1x1.mp4`;
const master16x9 = `${OUT_DIR}/v1_visual_16x9.mp4`;
const thumb = `${OUT_DIR}/thumbnail.jpg`;

console.log('1) Audio polish (-14 LUFS / -1.5 dBTP) for Master 9:16...');
run('ffmpeg', [
  '-y', '-i', srcV1,
  '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
  '-c:a', 'aac', '-b:a', '192k',
  master9x16
]);

console.log('2) Generating 1:1 Square Format (1080x1080) with luxury blurred wings...');
run('ffmpeg', [
  '-y', '-i', master9x16,
  '-filter_complex', '[0:v]scale=1080:1920,boxblur=20:5,crop=1080:1080:0:420[bg];[0:v]scale=608:1080[fg];[bg][fg]overlay=(W-w)/2:0',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
  '-c:a', 'copy',
  master1x1
]);

console.log('3) Generating 16:9 Landscape Format (1920x1080) for Decks & YouTube...');
run('ffmpeg', [
  '-y', '-i', master9x16,
  '-filter_complex', '[0:v]scale=1920:3413,boxblur=30:5,crop=1920:1080:0:1166[bg];[0:v]scale=608:1080[fg];[bg][fg]overlay=(W-w)/2:0',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
  '-c:a', 'copy',
  master16x9
]);

console.log('4) Extracting high-converting thumbnail at 4.0s...');
run('ffmpeg', [
  '-y', '-ss', '00:00:04',
  '-i', master9x16,
  '-vframes', '1',
  '-q:v', '2',
  thumb
]);

console.log('Finished generating formats!');

