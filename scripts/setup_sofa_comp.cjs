const fs = require('fs');
const path = require('path');

const compDir = 'G:/sudegy-video-studio/compositions/wa1031-sofa-15s';
const assetsDir = path.join(compDir, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// Copy fonts and audio assets from wa1031-botox
const srcDir = 'G:/sudegy-video-studio/compositions/wa1031-botox/assets';
const copyList = [
  'fonts',
  'sfx',
  'botox_prophylaxis_mechanism.jpg',
  'botox_mimic_muscles_3d.jpg',
  'botox_youthful_radiance.jpg',
  'gsap.min.js'
];

for (const item of copyList) {
  const s = path.join(srcDir, item);
  const d = path.join(assetsDir, item);
  if (fs.existsSync(s)) {
    fs.cpSync(s, d, { recursive: true });
    console.log('Copied:', item);
  }
}

console.log('Asset setup complete.');
