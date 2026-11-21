const { execSync } = require('child_process');
const f = 'C:/Users/Admin/.gemini/antigravity/brain/11143204-27b0-4b54-8f79-7d9c5c17f03e/.user_uploaded/media_1794513989697_2c563931.mp4';
const out1 = 'C:/Users/Admin/.gemini/antigravity/brain/11143204-27b0-4b54-8f79-7d9c5c17f03e/uploaded_check_1.jpg';
const out2 = 'C:/Users/Admin/.gemini/antigravity/brain/11143204-27b0-4b54-8f79-7d9c5c17f03e/uploaded_check_2.jpg';
const out3 = 'C:/Users/Admin/.gemini/antigravity/brain/11143204-27b0-4b54-8f79-7d9c5c17f03e/uploaded_check_3.jpg';

execSync(`ffmpeg -y -ss 00:00:02 -i "${f}" -vframes 1 -q:v 2 "${out1}"`);
execSync(`ffmpeg -y -ss 00:00:07 -i "${f}" -vframes 1 -q:v 2 "${out2}"`);
execSync(`ffmpeg -y -ss 00:00:12 -i "${f}" -vframes 1 -q:v 2 "${out3}"`);

const info = execSync(`ffprobe -v error -show_entries format=duration,bit_rate -of json "${f}"`).toString();
console.log('INFO:', info);
