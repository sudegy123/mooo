import sys
import os
import asyncio

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# Saudi dialect text - written phonetically and colloquial
saudi_script = (
    "على اليمين: عيادة تجميل تدفع آلاف على الإعلانات، وتجيها مئات الرسايل تسأل: بكم الإبرة؟ وتنتهي المحادثة بدون أي حجز! "
    "وعلى اليسار: عيادة شغالة بنظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد وقت مناسبتها بثواني، "
    "وتوصل بياناتها بتقرير مرتب للدكتور على الواتساب، محولة السائلين لباقات علاجية مؤكدة! "
    "أي العيادتين ودك تكون؟ خذ ديمو تجريبي مجاني بهوية عيادتك عشان تعاينه الحين على جوالك. "
    "اكتب كلمة: تجميل، في الكومنتات أو الخاص، ونرسل لك الرابط فوراً."
)

voices = [
    ("ar-SA-HamedNeural", "saudi_male_hamed.mp3", "+12%"),
    ("ar-SA-ZariyahNeural", "saudi_female_zariyah.mp3", "+12%"),
    ("ar-KW-FahedNeural", "gulf_male_fahed.mp3", "+12%"),
    ("ar-AE-HamdanNeural", "gulf_male_hamdan.mp3", "+12%")
]

out_dir = r"G:\sudegy-video-studio\factory\work\saudi_tests"
os.makedirs(out_dir, exist_ok=True)

async def test_all():
    for voice, fname, rate in voices:
        dest = os.path.join(out_dir, fname)
        comm = edge_tts.Communicate(text=saudi_script, voice=voice, rate=rate)
        await comm.save(dest)
        print(f"Saved: {dest} ({voice})")

if __name__ == "__main__":
    asyncio.run(test_all())

