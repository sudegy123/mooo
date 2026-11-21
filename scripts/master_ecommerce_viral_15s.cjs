const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = 'G:\\sudegy-video-studio';
const outDir = path.join(projectDir, 'out\\ecommerce_viral');
const readyDir = path.join(projectDir, 'READY_TO_SEND\\ecommerce_viral');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(readyDir, { recursive: true });

const rawVideo = path.join(outDir, 'f-ecommerce-viral-15s_raw.mp4');
const voice = path.join(projectDir, 'compositions\\f-ecommerce-viral-15s\\assets\\voice.wav');
const music = path.join(projectDir, 'compositions\\f-ecommerce-viral-15s\\assets\\music.wav');
const riser = path.join(projectDir, 'assets\\sfx\\riser.mp3');
const whoosh = path.join(projectDir, 'assets\\sfx\\whoosh-cinematic.mp3');
const chime = path.join(projectDir, 'assets\\sfx\\chime.mp3');
const sparkle = path.join(projectDir, 'assets\\sfx\\sparkle.mp3');
const clickSoft = path.join(projectDir, 'assets\\sfx\\click-soft.mp3');

const masterOut = path.join(outDir, 'ecommerce_viral_15s_master.mp4');
const readyOut = path.join(readyDir, 'ecommerce_viral_15s_tiktok.mp4');

// High-Energy Master Audio Mix
const filterComplex = [
  `[1:a]volume=1.35,adelay=50|50[a_voice]`,
  `[2:a]volume=0.20,afade=t=in:st=0:d=0.5,afade=t=out:st=14.2:d=1.5[a_music]`,
  `[3:a]adelay=3000|3000,volume=0.45[a_riser]`,
  `[4:a]adelay=4600|4600,volume=0.7[a_whoosh1]`,
  `[5:a]adelay=8200|8200,volume=0.7[a_whoosh2]`,
  `[6:a]adelay=9200|9200,volume=0.65[a_chime]`,
  `[7:a]adelay=12800|12800,volume=0.6[a_sparkle]`,
  `[8:a]adelay=13500|13500,volume=0.55[a_click]`,
  `[a_voice][a_music][a_riser][a_whoosh1][a_whoosh2][a_chime][a_sparkle][a_click]amix=inputs=8:duration=first:dropout_transition=2,loudnorm=I=-14:LRA=7:TP=-1.5[aout]`
].join(';');

const mixCmd = `ffmpeg -y -i "${rawVideo}" -i "${voice}" -i "${music}" -i "${riser}" -i "${whoosh}" -i "${whoosh}" -i "${chime}" -i "${sparkle}" -i "${clickSoft}" -filter_complex "${filterComplex}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "${masterOut}"`;

console.log('Mastering audio with sound design...');
execSync(mixCmd, { stdio: 'inherit' });
console.log('Master video created at:', masterOut);

// Copy to READY_TO_SEND
fs.copyFileSync(masterOut, readyOut);
console.log('Copied to READY_TO_SEND:', readyOut);

// Create 5-beat contact sheet (0.8s The Reality Hook, 3.2s Live Deficit Bleed, 6.5s The 3 Fatal Traps, 10.5s Smart Funnel & WhatsApp, 14.2s Sudegy Final CTA)
const sheetOut = path.join(outDir, 'ecommerce_viral_15s_sheet.jpg');
const sheetCmd = `ffmpeg -y -i "${masterOut}" -vf "select='eq(n\\,24)+eq(n\\,96)+eq(n\\,195)+eq(n\\,315)+eq(n\\,425)',scale=360:640,tile=5x1" -frames:v 1 -q:v 2 "${sheetOut}"`;
console.log('Generating contact sheet...');
execSync(sheetCmd, { stdio: 'inherit' });
console.log('Contact sheet created at:', sheetOut);
