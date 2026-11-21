import sys
import os
import asyncio

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# Pure Saudi Dialect Script - Zero Fus-ha
script_v1 = (
    "عاليمين: عيادة تصرف آلاف ع الإعلانات، وتجيها زحمة رسايل: بكم الإبرة؟ وبالأخير تسحب وماتحجز شي! "
    "وعاليسار: عيادة مشغلة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد مناسبتها بالجوال بثواني، "
    "ويوصل تقريرها كامل ومرتب للدكتور عالواتس قبل ماتجي العيادة، وبكذا تقلب السؤال لحجز مؤكد! "
    "أي العيادتين ودك تكون؟ خذ لك ديمو مجاني بهوية عيادتك عشان تجربه الحين على جوالك. "
    "اكتب كلمة: تجميل، بالخاص أو الكومنتات، ونرسل لك الرابط على طول."
)

script_v2_phonetic = (
    "عاليمين: عيادة تصرف آلاف ع الإعلانات، وتجيها زحمة رسايل تسأل: بكم الإبرة؟ وبالأخير تسحب وما تحجز شي! "
    "وعاليسار: عيادة مشغلة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد مناسبتها بالجوال بثواني، "
    "ويوصل تقريرها كامل ومرتب للدكتور عالواتس قبل ما تطب العيادة، وبكذا تقلب السائلين لحجوزات مؤكدة! "
    "أي العيادتين ودك تكون؟ خذ لك ديمو مجاني بهوية عيادتك عشان تجربه الحين على جوالك. "
    "اكتب كلمة تجميل بالخاص أو بالكومنتات، ونرسل لك الرابط على طول."
)

out_dir = r"G:\sudegy-video-studio\factory\work\pure_saudi"
os.makedirs(out_dir, exist_ok=True)

async def generate():
    for name, voice in [("hamed_saudi", "ar-SA-HamedNeural"), ("fahed_gulf", "ar-KW-FahedNeural")]:
        for idx, text in enumerate([script_v1, script_v2_phonetic], 1):
            out_file = os.path.join(out_dir, f"{name}_v{idx}.mp3")
            comm = edge_tts.Communicate(text=text, voice=voice, rate="+15%")
            await comm.save(out_file)
            print(f"Generated {out_file}")

if __name__ == "__main__":
    asyncio.run(generate())

