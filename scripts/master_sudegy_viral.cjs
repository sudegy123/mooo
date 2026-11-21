const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = 'G:\\sudegy-video-studio';
const rawVideo = path.join(projectDir, 'out\\luxury\\sudegy_viral_emotion_15s_raw.mp4');
const voice = path.join(projectDir, 'compositions\\f-sudegy-viral-emotion-15s\\assets\\voice.wav');
const music = path.join(projectDir, 'compositions\\flower-store-luxury\\assets\\music.wav');
const whoosh = path.join(projectDir, 'assets\\sfx\\whoosh-cinematic.mp3');
const sparkle = path.join(projectDir, 'assets\\sfx\\sparkle.mp3');
const clickSoft = path.join(projectDir, 'assets\\sfx\\click-soft.mp3');
const masterOut = path.join(projectDir, 'out\\luxury\\sudegy_viral_emotion_15s_master.mp4');

// Master Audio:
// [1:a] Voiceover: loud, centered, crystal clear (volume 1.25)
// [2:a] Music bed: dynamic, low under speech (volume 0.18), subtle swell at ends
// [3:a] Whoosh at 4.3s (volume 0.75) for the flash transition to Cloud discovery
// [4:a] Sparkle at 4.6s (volume 0.7) for the relief moment
// [5:a] Click at 11.4s (volume 0.6) for CTA button appearance
const filterComplex = [
  `[1:a]volume=1.25,adelay=100|100[a_voice]`,
  `[2:a]volume=0.20,afade=t=in:st=0:d=0.5,afade=t=out:st=13.5:d=1.7[a_music]`,
  `[3:a]adelay=4300|4300,volume=0.75[a_whoosh]`,
  `[4:a]adelay=4600|4600,volume=0.7[a_sparkle]`,
  `[5:a]adelay=11400|11400,volume=0.6[a_click]`,
  `[a_voice][a_music][a_whoosh][a_sparkle][a_click]amix=inputs=5:duration=first:dropout_transition=2,loudnorm=I=-14:LRA=7:TP=-1.5[aout]`
].join(';');

const cmd = `ffmpeg -y -i "${rawVideo}" -i "${voice}" -i "${music}" -i "${whoosh}" -i "${sparkle}" -i "${clickSoft}" -filter_complex "${filterComplex}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest "${masterOut}"`;

console.log('Running viral audio mastering command...');
execSync(cmd, { stdio: 'inherit' });
console.log('Master video created at:', masterOut);

// Create 5-frame contact sheet at key story beats (1.2s The Shock, 3.2s Red Agony, 6.2s Relief & Cloud Discovery, 10.0s Empowered Victory, 13.5s Viral CTA)
const sheetOut = path.join(projectDir, 'out\\luxury\\sudegy_viral_emotion_15s_sheet.jpg');
const sheetCmd = `ffmpeg -y -i "${masterOut}" -vf "select='eq(n\\,36)+eq(n\\,96)+eq(n\\,186)+eq(n\\,300)+eq(n\\,405)',scale=360:640,tile=5x1" -frames:v 1 -q:v 2 "${sheetOut}"`;
console.log('Generating contact sheet...');
execSync(sheetCmd, { stdio: 'inherit' });
console.log('Contact sheet created at:', sheetOut);
