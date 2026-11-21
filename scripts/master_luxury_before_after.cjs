const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = 'G:\\sudegy-video-studio';
const rawVideo = path.join(projectDir, 'out\\luxury\\before_after_15s_raw.mp4');
const music = path.join(projectDir, 'compositions\\f-luxury-before-after-15s\\assets\\music.wav');
const chime = path.join(projectDir, 'assets\\sfx\\chime.mp3');
const whoosh = path.join(projectDir, 'assets\\sfx\\whoosh-cinematic.mp3');
const sparkle = path.join(projectDir, 'assets\\sfx\\sparkle.mp3');
const clickSoft = path.join(projectDir, 'assets\\sfx\\click-soft.mp3');
const masterOut = path.join(projectDir, 'out\\luxury\\before_after_15s_master.mp4');

// Complex filter to mix music bed + synchronized luxury SFX:
// 1. Music bed: looped/trimmed to 15.4s, soft fade in (0-1s), fade out (13.5-15.4s), volume 0.38
// 2. Whoosh cinematic at 4.2s (volume 0.75) for the golden sweep
// 3. Chime & sparkle at 5.0s (volume 0.8) for the radiant skin reveal
// 4. Click soft at 11.3s (volume 0.6) for the luxury CTA button arrival
const filterComplex = [
  `[1:a]volume=0.38,afade=t=in:st=0:d=1.0,afade=t=out:st=13.5:d=1.9[a_music]`,
  `[2:a]adelay=4200|4200,volume=0.75[a_whoosh]`,
  `[3:a]adelay=5000|5000,volume=0.8[a_chime]`,
  `[4:a]adelay=5200|5200,volume=0.7[a_sparkle]`,
  `[5:a]adelay=11300|11300,volume=0.6[a_click]`,
  `[a_music][a_whoosh][a_chime][a_sparkle][a_click]amix=inputs=5:duration=first:dropout_transition=2,loudnorm=I=-14:LRA=7:TP=-1.5[aout]`
].join(';');

const cmd = `ffmpeg -y -i "${rawVideo}" -i "${music}" -i "${whoosh}" -i "${chime}" -i "${sparkle}" -i "${clickSoft}" -filter_complex "${filterComplex}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "${masterOut}"`;

console.log('Running mastering command...');
execSync(cmd, { stdio: 'inherit' });
console.log('Master video created successfully at:', masterOut);

// Create 5-frame contact sheet at key story beats (1.5s Before, 4.8s Wipe start, 5.8s Glow reveal, 8.5s Radiant confident gaze, 13.0s Luxury CTA)
const sheetOut = path.join(projectDir, 'out\\luxury\\before_after_15s_sheet.jpg');
const sheetCmd = `ffmpeg -y -i "${masterOut}" -vf "select='eq(n\\,45)+eq(n\\,145)+eq(n\\,175)+eq(n\\,255)+eq(n\\,390)',scale=360:640,tile=5x1" -frames:v 1 -q:v 2 "${sheetOut}"`;
console.log('Generating contact sheet...');
execSync(sheetCmd, { stdio: 'inherit' });
console.log('Contact sheet created at:', sheetOut);
