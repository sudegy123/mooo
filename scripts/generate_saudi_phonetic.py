import sys
import os
import asyncio

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# Phonetically tuned Saudi Arabic dialect with sukun and colloquial vowels
saudi_phonetic_text = (
    "عَ اليمين: عيادة تِدْفَعْ آلافْ على الإعلانات، وتِجِيهَا رسايل تسأل: بِكَمْ الإبرة؟ وتِنْتِهِي بِدُونْ أي حَجِزْ! "
    "وعَ اليسار: عيادة مْفَعّلَة نظام سوديجي الذكي.. المراجعة تِفْحَصْ وجهها وتْحَدّدْ وقت مناسبتها بِثَوَانِي، "
    "وتُوصَلْ بياناتها بتقرير مرتّب للدكتور عَالواتساب قبل لا تِجِي العيادة، وتحوّل السائلين لباقات مؤكدة! "
    "أيّ العيادتين وِدِّكْ تكون؟ خِذْ ديمو تجريبي مجاني بهوية عيادتك عشان تِجَرّبَه الحين على جوالك. "
    "اِكْتِبْ كلمة تجميل بالخاص أو الكومنتات، ونِرْسِلْ لك الرابط فوراً."
)

work_dir = r"G:\sudegy-video-studio\factory\work\saudi_dialect"

async def test_phonetic():
    # Male
    comm_m = edge_tts.Communicate(text=saudi_phonetic_text, voice="ar-SA-HamedNeural", rate="+24%")
    await comm_m.save(os.path.join(work_dir, "saudi_male_phonetic.mp3"))
    print("Generated Male Phonetic")

    # Female
    comm_f = edge_tts.Communicate(text=saudi_phonetic_text, voice="ar-SA-ZariyahNeural", rate="+24%")
    await comm_f.save(os.path.join(work_dir, "saudi_female_phonetic.mp3"))
    print("Generated Female Phonetic")

if __name__ == "__main__":
    asyncio.run(test_phonetic())

