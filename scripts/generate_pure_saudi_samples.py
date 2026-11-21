import sys
import os
import asyncio

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# 100% Colloquial Saudi Text - No Fus-ha
pure_saudi_v1 = (
    "عاليمين: عيادة تصرف آلاف ع الإعلانات، وتجيها زحمة رسايل تسأل: بكم الإبرة؟ وبالأخير تسحب وماتحجز شي! "
    "وعاليسار: عيادة مشغلة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد متى مناسبتها بالجوال بثواني، "
    "ويوصل للدكتور تقرير كامل ومرتب عالواتس قبل ما تطب العيادة، وبكذا تقلب السؤال لحجز باقة مضمون! "
    "أي العيادتين ودك تكون؟ جرب ديمو مجاني بهوية عيادتك الحين على جوالك. "
    "بس اكتب كلمة: تجميل، بالخاص أو بالردود، ونرسل لك الرابط على طول."
)

pure_saudi_tashkeel = (
    "عَ اليمين: عيادة تِصْرِفْ آلافْ عَ الإعلانات، وتِجِيهَا زَحْمَة رسايل تسأل: بِكَمْ الإبرة؟ وبِالأَخِيرْ تِسْحَبْ ومَاتِحْجِزْ شي! "
    "وعَ اليسار: عيادة مْشَغّلَة نظام سوديجي الذكي.. المراجعة تِفْحَصْ وجهها وتْحَدّدْ متى مناسبتها بالجوال بثواني، "
    "ويُوصَلْ للدكتور تقرير كامل ومرتب عَ الواتس قبل ما تِطِبْ العيادة، وبِكِذَا تِقْلِبْ السؤال لحجز باقة مضمون! "
    "أيّ العيادتين وِدِّكْ تكون؟ جَرّبْ ديمو مجاني بهوية عيادتك الحين على جوالك. "
    "بس اِكْتِبْ كلمة تجميل بالخاص أو بالردود، ونِرْسِلْ لك الرابط على طول."
)

out_dir = r"G:\sudegy-video-studio\factory\work\pure_saudi_test2"
os.makedirs(out_dir, exist_ok=True)

async def test():
    configs = [
        ("saudi_hamed_plain", "ar-SA-HamedNeural", pure_saudi_v1, "+18%"),
        ("saudi_hamed_tashkeel", "ar-SA-HamedNeural", pure_saudi_tashkeel, "+18%"),
        ("gulf_fahed_plain", "ar-KW-FahedNeural", pure_saudi_v1, "+16%"),
        ("gulf_fahed_tashkeel", "ar-KW-FahedNeural", pure_saudi_tashkeel, "+16%"),
    ]
    for tag, voice, txt, rate in configs:
        fpath = os.path.join(out_dir, f"{tag}.mp3")
        comm = edge_tts.Communicate(text=txt, voice=voice, rate=rate)
        await comm.save(fpath)
        print(f"Saved: {fpath}")

if __name__ == "__main__":
    asyncio.run(test())

