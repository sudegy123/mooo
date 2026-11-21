import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const text = "أكبر مشكلة تواجه أصحاب ومدراء المصانع: خط الإنتاج يتعطل فجأة لأن المواد الخام خلصت بدون ما يدري أحد! طلبيات الزبائن تتأخر، وتكاليف التصنيع ترتفع بسبب الفواتير الورقية وجداول الإكسل! الحل هو نظام الـ ERP الذكي للمصانع.. نظام رقمي يربط خط الإنتاج، والمستودع، وحركة الشحن، وتكلفة كل قطعة في شاشة واحدة لحظة بلحظة! ينبهك قبل نفاد المواد، ويمنع توقف الآلات، ويخليك تدير مصنعك بالكامل من جوالك! جاهز تشوف كيف يشتغل بنظام مصنعك الفعلي؟ اكتب كلمة: (مصنع) في التعليقات أو الخاص، وبنرسل لك ديمو تجريبي فوري!";

const workDir = "G:\\sudegy-video-studio\\factory\\work\\factory_erp";
fs.mkdirSync(workDir, { recursive: true });

const rawWav = path.join(workDir, "fenrir_raw.wav");
const normWav = path.join(workDir, "fenrir_norm.wav");

console.log("Calling gemini_tts with Fenrir for Factory ERP...");
const ttsCmd = `node scripts/gemini_tts.mjs "${text}" "${rawWav}" "Fenrir" "fast, energetic, punchy marketing ad, quick pace, Saudi professional tone"`;
execSync(ttsCmd, { stdio: 'inherit' });

console.log("Normalizing and measuring audio with ffmpeg...");
// EBU R128 voice normalization
execSync(`ffmpeg -y -i "${rawWav}" -af "loudnorm=I=-16:TP=-1.5:LRA=11,silenceremove=start_periods=1:start_threshold=-50dB" "${normWav}"`, { stdio: 'inherit' });

const probeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${normWav}"`).toString().trim();
const duration = parseFloat(probeOut);
console.log(`Audio normalized: ${normWav}, duration: ${duration.toFixed(2)}s`);
