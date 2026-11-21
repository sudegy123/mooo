const fs = require('fs');
const path = require('path');

const targetDir = "G:\\sudegy-video-studio\\compositions\\f-factory-erp-2d-v1";
const assetsDir = path.join(targetDir, "assets");
const sourceCrm = "G:\\sudegy-video-studio\\compositions\\f-sudegy-crm-01-v3\\assets";

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(path.join(assetsDir, "fonts"), { recursive: true });
fs.mkdirSync(path.join(assetsDir, "sfx"), { recursive: true });

// Copy fonts
const fontFiles = fs.readdirSync(path.join(sourceCrm, "fonts"));
for (const f of fontFiles) {
  fs.copyFileSync(path.join(sourceCrm, "fonts", f), path.join(assetsDir, "fonts", f));
}

// Copy sfx
const sfxFiles = fs.readdirSync(path.join(sourceCrm, "sfx"));
for (const f of sfxFiles) {
  fs.copyFileSync(path.join(sourceCrm, "sfx", f), path.join(assetsDir, "sfx", f));
}

// Copy gsap
fs.copyFileSync(path.join(sourceCrm, "gsap.min.js"), path.join(assetsDir, "gsap.min.js"));

// Copy audio
fs.copyFileSync("G:\\sudegy-video-studio\\factory\\work\\factory_erp\\fenrir_norm.wav", path.join(assetsDir, "voice.wav"));
fs.copyFileSync(path.join(sourceCrm, "music.wav"), path.join(assetsDir, "music.wav"));
fs.copyFileSync("G:\\sudegy-video-studio\\factory\\work\\factory_erp\\final_mix.wav", path.join(assetsDir, "narration.wav"));

// Package.json
fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify({
  name: "f-factory-erp-2d-v1",
  version: "1.0.0",
  private: true
}, null, 2));

console.log("Composition assets initialized at:", targetDir);
