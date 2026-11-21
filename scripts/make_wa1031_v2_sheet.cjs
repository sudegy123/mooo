const cp = require('child_process');

const args = [
  '-y',
  '-i', 'G:/sudegy-video-studio/out/edit/wa1031/wa1031_9x16_motion_v2_master.mp4',
  '-filter_complex', 'select=eq(n\\,105)+eq(n\\,255)+eq(n\\,315)+eq(n\\,525)+eq(n\\,960),scale=540:960,tile=5x1',
  '-frames:v', '1',
  '-q:v', '2',
  'G:/sudegy-video-studio/out/edit/wa1031/wa1031_motion_v2_sheet.jpg'
];

const res = cp.spawnSync('ffmpeg', args, { stdio: 'inherit' });
if (res.status === 0) {
  console.log('Sheet created successfully at G:/sudegy-video-studio/out/edit/wa1031/wa1031_motion_v2_sheet.jpg');
} else {
  console.error('Failed, exit code:', res.status);
  process.exit(1);
}
