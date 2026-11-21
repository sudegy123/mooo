import sys
import os
import asyncio

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# Authentic Colloquial Saudi Dialect (Zero Fus-ha)
script_saudi_pure = (
    "شوف معاي الفرق.. "
    "عاليمين: عيادة تصرف آلاف ع الإعلانات، وتجيها زحمة رسايل بالواتس: بكم الإبرة؟ وبالأخير تسحب وما تحجز شي! "
    "وعاليسار: عيادة مشغلة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد متى مناسبتها بالجوال بثواني، "
    "ويوصل للدكتور تقرير كامل ومرتب عالواتس قبل ما تطب العيادة، وبكذا تقلب السؤال الفاضي لحجز باقة مضمون! "
    "أي العيادتين ودك تكون؟ "
    "جرب ديمو مجاني الحين بهوية عيادتك وشوف الفرق بنفسك على جوالك. "
    "اكتب بس كلمة تجميل بالخاص أو بالكومنتات، ونرسل لك الرابط على طول."
)

script_saudi_phonetic = (
    "شُوفْ مَعَاي الفَرْقْ.. "
    "عَ اليَمِينْ: عِيَادَة تِصْرِفْ آلافْ عَ الإعلانات، وتِجِيهَا زَحْمَة رَسَايِلْ بِالوَاتْسْ: بِكَمْ الإِبْرَة؟ وبِالأَخِيرْ تِسْحَبْ ومَاتِحْجِزْ شَيْ! "
    "وعَ اليَسَارْ: عِيَادَة مْشَغّلَة نِظَامْ سُودِيجِي الذَّكِي.. المُرَاجَعَة تِفْحَصْ وَجْهِهَا وتْحَدّدْ مَتَى مُنَاسَبَتْهَا بِالجَوَّالْ بِثَوَانِي، "
    "ويُوصَلْ لِلدَّكْتُورْ تَقْرِيرْ كَامِلْ ومُرَتَّبْ عَ الوَاتْسْ قَبْلْ مَا تِطِبْ العِيَادَة، وبِكِذَا تِقْلِبْ السُّؤَالْ الفَاضِي لِحَجْزْ بَاقَة مَضْمُونْ! "
    "أَيّ العِيَادْتَيْن وِدِّكْ تِكُونْ؟ "
    "جَرّبْ دِيمُو مَجَّانِي الحِينْ بْهُوِيّة عِيَادْتِكْ وشُوفْ الفَرْقْ بِنَفْسِكْ عَلَى جَوَّالِكْ. "
    "اِكْتِبْ بَسْ كِلْمَة تَجْمِيلْ بِالخَاصْ أَوْ بِالكُومِنْتَاتْ، ونِرْسِلْ لِكْ الرَّابِطْ عَلَى طُولْ."
)

out_dir = r"G:\sudegy-video-studio\factory\work\saudi_pure_candidates"
os.makedirs(out_dir, exist_ok=True)

async def run():
    tests = [
        ("saudi_male_hamed_natural", "ar-SA-HamedNeural", script_saudi_pure, "+20%"),
        ("saudi_male_hamed_phonetic", "ar-SA-HamedNeural", script_saudi_phonetic, "+20%"),
        ("saudi_female_zariyah_natural", "ar-SA-ZariyahNeural", script_saudi_pure, "+20%"),
        ("saudi_female_zariyah_phonetic", "ar-SA-ZariyahNeural", script_saudi_phonetic, "+20%"),
        ("gulf_male_fahed_natural", "ar-KW-FahedNeural", script_saudi_pure, "+20%"),
        ("gulf_male_fahed_phonetic", "ar-KW-FahedNeural", script_saudi_phonetic, "+20%"),
    ]
    for tag, voice, txt, rate in tests:
        dest = os.path.join(out_dir, f"{tag}.mp3")
        c = edge_tts.Communicate(text=txt, voice=voice, rate=rate)
        await c.save(dest)
        print(f"Saved: {dest}")

if __name__ == "__main__":
    asyncio.run(run())

