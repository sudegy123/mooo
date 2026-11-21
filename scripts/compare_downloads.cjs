const { execSync } = require('child_process');

const files = [
  'C:/Users/Admin/Downloads/new 1.mp4',
  'C:/Users/Admin/Downloads/WhatsApp Video 2026-11-10 at 4.31.27 PM.mp4',
  'C:/Users/Admin/Downloads/WhatsApp_Video_2026-11-10_at_4.31.27_e362200f_1080p.mp4'
];

for (const f of files) {
  try {
    const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate,nb_frames -of json "${f}"`).toString();
    console.log(f, ':', probe.trim());
  } catch (e) {
    console.error(f, 'ERROR:', e.message);
  }
}
