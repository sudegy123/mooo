const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = 'G:\\sudegy-video-studio';
const rawVideo = path.join(projectDir, 'out\\luxury\\sudegy_dental_midnight_raw.mp4');
const voice = path.join(projectDir, 'compositions\\f-sudegy-dental-midnight-15s\\assets\\voice.wav');
const music = path.join(projectDir, 'compositions\\flower-store-luxury\\assets\\music.wav');
const whoosh = path.join(projectDir, 'assets\\sfx\\whoosh-cinematic.mp3');
const sparkle = path.join(projectDir, 'assets\\sfx\\sparkle.mp3');
const chime = path.join(projectDir, 'assets\\sfx\\chime.mp3');
const clickSoft = path.join(projectDir, 'assets\\sfx\\click-soft.mp3');
const masterOut = path.join(projectDir, 'out\\luxury\\sudegy_dental_midnight_master.mp4');

// High-Converting Master Audio Mix for Dental Skit:
// [1:a] Voiceover: clear empathetic creator narration (volume 1.25)
// [2:a] Music bed: calm, low (volume 0.17)
// [3:a] Whoosh at 4.3s (volume 0.75) for 3D App entrance
// [4:a] Sparkle at 9.0s (volume 0.7) for Tooth selected & booking
// [5:a] Chime at 13.0s (volume 0.7) for Clinic arrival
// [6:a] Click at 15.5s (volume 0.6) for CTA button
const filterComplex = [
  `[1:a]volume=1.25,adelay=100|100[a_voice]`,
  `[2:a]volume=0.18,afade=t=in:st=0:d=0.5,afade=t=out:st=18.0:d=1.8[a_music]`,
  `[3:a]adelay=4300|4300,volume=0.75[a_whoosh]`,
  `[4:a]adelay=9000|9000,volume=0.7[a_sparkle]`,
  `[5:a]adelay=13000|13000,volume=0.7[a_chime]`,
  `[6:a]adelay=15500|15500,volume=0.6[a_click]`,
  `[a_voice][a_music][a_whoosh][a_sparkle][a_chime][a_click]amix=inputs=6:duration=first:dropout_transition=2,loudnorm=I=-14:LRA=7:TP=-1.5[aout]`
].join(';');

const cmd = `ffmpeg -y -i "${rawVideo}" -i "${voice}" -i "${music}" -i "${whoosh}" -i "${sparkle}" -i "${chime}" -i "${clickSoft}" -filter_complex "${filterComplex}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "${masterOut}"`;

console.log('Running mastering for Sudegy Dental Midnight...');
execSync(cmd, { stdio: 'inherit' });
console.log('Master video created at:', masterOut);

// Create 5-frame contact sheet at key story beats (1.5s Midnight Toothache, 6.5s Real 3D Mouth, 10.5s Tooth Selected, 14.5s Dental Clinic Arrival, 18.0s Bio & Comment CTA)
const sheetOut = path.join(projectDir, 'out\\luxury\\sudegy_dental_midnight_sheet.jpg');
const sheetCmd = `ffmpeg -y -i "${masterOut}" -vf "select='eq(n\\,45)+eq(n\\,195)+eq(n\\,315)+eq(n\\,435)+eq(n\\,540)',scale=360:640,tile=5x1" -frames:v 1 -q:v 2 "${sheetOut}"`;
console.log('Generating contact sheet...');
execSync(sheetCmd, { stdio: 'inherit' });
console.log('Contact sheet created at:', sheetOut);
