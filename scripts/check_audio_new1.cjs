const { spawnSync } = require('child_process');
const f = 'C:/Users/Admin/Downloads/new 1.mp4';
const p = spawnSync('ffmpeg', ['-i', f, '-af', 'volumedetect', '-vn', '-sn', '-dn', '-f', 'null', 'NUL'], { encoding: 'utf8' });
console.log(p.stderr.split('\n').filter(l => l.includes('mean_volume') || l.includes('max_volume')).join('\n'));
