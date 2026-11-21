const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = 'G:\\sudegy-video-studio';
const rawVideo = path.join(projectDir, 'out\\luxury\\sudegy_retail_before_after_15s_raw.mp4');
const music = path.join(projectDir, 'compositions\\flower-store-luxury\\assets\\music.wav');
const chime = path.join(projectDir, 'assets\\sfx\\chime.mp3');
const whoosh = path.join(projectDir, 'assets\\sfx\\whoosh-cinematic.mp3');
const sparkle = path.join(projectDir, 'assets\\sfx\\sparkle.mp3');
const clickSoft = path.join(projectDir, 'assets\\sfx\\click-soft.mp3');
const masterOut = path.join(projectDir, 'out\\luxury\\sudegy_retail_before_after_15s_master.mp4');

// Audio mixing filter with cinematic tech-retail vibe
const filterComplex = [
  `[1:a]volume=0.38,afade=t=in:st=0:d=1.0,afade=t=out:st=13.5:d=1.8[a_music]`,
  `[2:a]adelay=4200|4200,volume=0.75[a_whoosh]`,
  `[3:a]adelay=5000|5000,volume=0.8[a_chime]`,
  `[4:a]adelay=5200|5200,volume=0.7[a_sparkle]`,
  `[5:a]adelay=11200|11200,volume=0.6[a_click]`,
  `[a_music][a_whoosh][a_chime][a_sparkle][a_click]amix=inputs=5:duration=first:dropout_transition=2,loudnorm=I=-14:LRA=7:TP=-1.5[aout]`
].join(';');

const cmd = `ffmpeg -y -i "${rawVideo}" -i "${music}" -i "${whoosh}" -i "${chime}" -i "${sparkle}" -i "${clickSoft}" -filter_complex "${filterComplex}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "${masterOut}"`;

console.log('Running mastering command for Sudegy Retail...');
execSync(cmd, { stdio: 'inherit' });
console.log('Master video created at:', masterOut);

// Create 5-frame contact sheet at key story beats (1.5s Before, 4.8s Laser Wipe, 5.8s Cloud Dashboard reveal, 8.5s Confident smiling executive, 13.0s Sudegy CTA)
const sheetOut = path.join(projectDir, 'out\\luxury\\sudegy_retail_before_after_15s_sheet.jpg');
const sheetCmd = `ffmpeg -y -i "${masterOut}" -vf "select='eq(n\\,45)+eq(n\\,145)+eq(n\\,175)+eq(n\\,255)+eq(n\\,390)',scale=360:640,tile=5x1" -frames:v 1 -q:v 2 "${sheetOut}"`;
console.log('Generating contact sheet...');
execSync(sheetCmd, { stdio: 'inherit' });
console.log('Contact sheet created at:', sheetOut);
