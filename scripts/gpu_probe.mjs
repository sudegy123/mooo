import puppeteer from 'puppeteer-core';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const configs = {
  d3d11: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'],
  default: ['--ignore-gpu-blocklist', '--enable-webgl'],
  swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};
for (const [name, args] of Object.entries(configs)) {
  const t = Date.now();
  try {
    const b = await puppeteer.launch({ executablePath: EDGE, headless: true, args });
    const p = await b.newPage();
    await p.setContent('<canvas id=c></canvas>');
    const info = await p.evaluate(() => { const gl = document.getElementById('c').getContext('webgl2') || document.getElementById('c').getContext('webgl'); if (!gl) return 'no webgl'; const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
    console.log(name.padEnd(12), '|', info, '|', Date.now() - t, 'ms');
    await b.close();
  } catch (e) { console.log(name.padEnd(12), '| ERROR', String(e).slice(0, 150)); }
}
