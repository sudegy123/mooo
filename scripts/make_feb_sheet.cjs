const cp = require('child_process');

const args = [
  '-y',
  '-i', 'G:/sudegy-video-studio/out/enterprise/sudegy_february_2d_master.mp4',
  '-filter_complex', 'select=eq(n\\,90)+eq(n\\,270)+eq(n\\,480)+eq(n\\,705)+eq(n\\,1140),scale=540:960,tile=5x1',
  '-frames:v', '1',
  '-q:v', '2',
  'G:/sudegy-video-studio/out/enterprise/sudegy_february_2d_sheet.jpg'
];

const res = cp.spawnSync('ffmpeg', args, { stdio: 'inherit' });
if (res.status === 0) {
  console.log('Contact sheet successfully created: G:/sudegy-video-studio/out/enterprise/sudegy_february_2d_sheet.jpg');
} else {
  console.error('Failed to create sheet, code:', res.status);
  process.exit(1);
}
