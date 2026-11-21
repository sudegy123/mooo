// Prints which GPU the render browser (pinned chrome-headless-shell) really uses for WebGL. Usage: node factory/tools/gpu_probe.mjs
import puppeteer from 'puppeteer-core';
const exe = process.env.HF_CHROME || 'C:/Users/Admin/.cache/hyperframes/chrome/chrome-headless-shell/win64-152.0.7977.30/chrome-headless-shell-win64/chrome-headless-shell.exe';
const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'] });
const p = await b.newPage();
const info = await p.evaluate(() => { const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl'); if (!gl) return 'no webgl'; const d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
console.log('WebGL renderer:', info);
await b.close();
