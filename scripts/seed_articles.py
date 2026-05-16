"""Generate initial batch of SEO article JSON files.

Run from repo root:
  python scripts/seed_articles.py

This creates the article content files referenced in metadata.json.
"""
from __future__ import annotations

import json
from pathlib import Path

ARTICLES_DIR = Path(__file__).resolve().parent.parent / "backend" / "app" / "data" / "articles"
ARTICLES_DIR.mkdir(parents=True, exist_ok=True)

ARTICLES: list[dict] = [
    {
        "id": "wood-fire-compatibility-bazi",
        "slug": "wood-fire-compatibility-bazi",
        "title": "Wood and Fire Element Compatibility in BaZi",
        "description": "Discover how the Wood-Fire elemental dynamic creates passion, growth, and creative tension in relationships. A complete BaZi compatibility guide.",
        "category": "element-compatibility",
        "tags": ["wood", "fire", "bazi", "five-elements", "compatibility"],
        "published": "2026-05-01",
        "updated": "2026-05-16",
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": 7,
        "meta": {
            "title": "Wood-Fire BaZi Compatibility | Elemental Bond",
            "description": "Complete guide to Wood and Fire element compatibility in BaZi astrology. Learn how these two elements interact in relationships, their strengths, challenges, and growth edge.",
            "keywords": "wood fire bazi compatibility, wood meets fire relationship, five element love compatibility"
        },
        "content": {
            "hook": "Wood feeds Fire — that much is obvious. But in a BaZi birth chart, the relationship between Wood and Fire goes far beyond the physical. It is the dynamic of vision becoming expression, of growth igniting passion.",
            "body_sections": [
                {
                    "heading": "The Generative Cycle: Wood Creates Fire",
                    "body": "In the Five Element (Wu Xing) cycle, Wood generates Fire. This means Wood-type energy naturally fuels and amplifies Fire-type energy. When a Wood Day Master meets a Fire Day Master, there is an instinctive recognition — one person's ideas spark the other's enthusiasm. Wood brings the blueprint; Fire brings the execution. This generative relationship makes Wood-Fire one of the most naturally creative pairings in BaZi.\n\nWood represents growth, planning, and expansion. Fire represents passion, expression, and radiance. Together, they form a dynamic where expansion finds an outlet. The Wood partner feels seen and understood; the Fire partner feels energized and inspired."
                },
                {
                    "heading": "Strengths of the Wood-Fire Bond",
                    "body": "**Creative Synergy:** This is a power couple in the making. Wood dreams up the vision, and Fire brings it to life. Whether starting a business, raising a family, or pursuing artistic projects, this pair achieves more together than apart.\n\n**Emotional Warmth:** Fire provides the warmth that Wood needs to thrive. Wood personalities can sometimes be overly analytical or future-focused; Fire reminds them to enjoy the present moment.\n\n**Mutual Growth:** Wood inspires Fire to think long-term. Fire inspires Wood to take action. This creates a relationship that is constantly evolving, never stagnant.\n\n**Passionate Connection:** The attraction between Wood and Fire is palpable. Their chemistry is visible to everyone around them. This is not a lukewarm pairing."
                },
                {
                    "heading": "Challenges to Navigate",
                    "body": "**Over-Consumption:** In the controlling cycle, Wood weakens Earth (which Fire produces). An imbalanced Wood-Fire pair can burn through their resources too quickly — spending impulsively, taking excessive risks, or pushing each other past healthy limits.\n\n**Burnout Risk:** Fire can consume Wood if the Fire element is too strong. The Wood partner may feel drained, overstimulated, or like their needs are secondary to the Fire partner's intensity.\n\n**Impatience:** Wood plans and Fire acts. When these are out of sync, Wood accuses Fire of being reckless, and Fire accuses Wood of being indecisive. Finding the middle pace is essential.\n\n**Conflict Style:** Both Wood and Fire are Yang elements — they are direct, confrontational, and not afraid of conflict. Arguments can escalate quickly if neither partner knows when to pause."
                },
                {
                    "heading": "Elemental Compatibility Score",
                    "body": "Wood-Fire is rated as a **high compatibility** pairing in BaZi. On the Elemental Bond scale:\n- **Generative Cycle:** +30 points (Wood creates Fire)\n- **Shared Yang Nature:** +15 points (both are outward-facing)\n- **Emotional Resonance:** +20 points (natural chemistry)\n- **Challenge Factor:** -10 points (burnout / over-consumption risk)\n- **Growth Potential:** +25 points (constant evolution)\n\n**Typical Score Range: 70-85 / 100**\n\nThis score varies based on the specific Heavenly Stems and Earthly Branches involved. For example, Jia Wood (甲) with Bing Fire (丙) tends to score highest."
                },
                {
                    "heading": "Famous Wood-Fire Pairs",
                    "body": "History and mythology are filled with Wood-Fire dynamics. The visionary who inspires a movement (Wood) and the charismatic leader who brings it to life (Fire). Think of creative duos where one partner is the architect and the other is the performer. This pairing works best when each partner respects the other's domain and doesn't try to compete in the same arena."
                },
                {
                    "heading": "Advice for Wood-Fire Couples",
                    "body": "1. **Bring in Earth energy:** Spend time in nature, cook together, create a stable home environment. Earth moderates both Wood and Fire.\n2. **Schedule downtime:** Fire partners need to learn that rest is productive. Wood partners need to learn that spontaneity is valuable.\n3. **Divide roles by strength:** Let Wood handle long-term planning. Let Fire handle immediate action and social energy.\n4. **Watch for burnout signs:** When both partners are exhausted, the relationship suffers. Learn each other's limit signals."
                }
            ],
            "key_insight": "Wood-Fire is a high-energy, high-reward pairing. The key to longevity is balance — bringing enough Earth and Water energy into the relationship to prevent burnout while preserving the spark that makes this pair so dynamic.",
            "cta": "Ready to decode YOUR elemental pattern? Enter your birth details for a free BaZi compatibility reading."
        },
        "related_articles": ["bazi-five-elements-guide", "fire-element-personality-bazi", "wood-element-personality-bazi"]
    },
    {
        "id": "bazi-five-elements-guide",
        "slug": "bazi-five-elements-guide",
        "title": "The Complete Guide to the Five Elements in BaZi Astrology",
        "description": "Everything you need to know about Wood, Fire, Earth, Metal, and Water in your birth chart. Understand the generative and controlling cycles.",
        "category": "bazi-guide",
        "tags": ["bazi", "five-elements", "wu-xing", "beginners-guide", "elemental-theory"],
        "published": "2026-05-04",
        "updated": "2026-05-16",
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": 10,
        "meta": {
            "title": "Complete Guide to the Five Elements (Wu Xing) in BaZi | Elemental Bond",
            "description": "Master the Five Elements of BaZi astrology: Wood, Fire, Earth, Metal, and Water. Learn the generative and controlling cycles and how they shape your destiny.",
            "keywords": "five elements bazi, wu xing guide, chinese astrology elements, wood fire earth metal water"
        },
        "content": {
            "hook": "The Five Elements — Wood, Fire, Earth, Metal, and Water — are the building blocks of BaZi analysis. Everything in your birth chart, from your Day Master to your luck cycles, is expressed through these elemental energies.",
            "body_sections": [
                {
                    "heading": "What Are the Five Elements?",
                    "body": "The Five Elements (Wu Xing, 五行) are not static substances but dynamic phases of energy. They describe how energy transforms and moves through all phenomena — including your personality, relationships, and life path. In BaZi, each of your Four Pillars contains a Heavenly Stem and an Earthly Branch, and each of these is associated with one of the Five Elements.\n\nYour Day Master (日主) — the Heavenly Stem of your Day Pillar — is your core elemental type. Everything else in your chart is analyzed in relation to this central element."
                },
                {
                    "heading": "The Generative (Sheng) Cycle",
                    "body": "The generative cycle describes how each element creates and nourishes the next:\n\n**Wood feeds Fire** — Trees provide fuel for flame. Wood-type energy gives rise to passion and expression.\n\n**Fire creates Earth** — Ash returns to the soil. Fire's intensity settles into stability and grounding.\n\n**Earth produces Metal** — Minerals form within the earth. Structure and precision emerge from patience.\n\n**Metal collects Water** — Metal surfaces condense moisture. Clarity gives way to depth and flow.\n\n**Water nourishes Wood** — Rain feeds the forest. Intuition and emotion enable growth.\n\nThis cycle represents natural support and harmonious relationships. When two elements are connected by the generative cycle, they tend to understand and benefit each other."
                },
                {
                    "heading": "The Controlling (Ke) Cycle",
                    "body": "The controlling cycle describes how each element regulates and balances another:\n\n**Wood parts Earth** — Roots break through soil. Growth prevents stagnation.\n\n**Earth dams Water** — Riverbanks channel the flood. Stability contains emotion.\n\n**Water extinguishes Fire** — Rain puts out the flame. Depth cools intensity.\n\n**Fire melts Metal** — Heat transforms rigid structures. Passion softens rigidity.\n\n**Metal cuts Wood** — An axe shapes the tree. Precision prunes excess growth.\n\nThis cycle represents healthy tension and mutual regulation. It is not inherently negative — it is the mechanism that prevents any one element from becoming excessive. A chart with too much harmony and no controlling relationships may lack dynamism."
                },
                {
                    "heading": "The Five Element Types in Relationships",
                    "body": "**Wood Types** are visionary and growth-oriented. They seek partners who can match their ambition and give them space to expand. Best matches: Water (nourishes Wood) and Fire (gives Wood purpose).\n\n**Fire Types** are passionate and charismatic. They need partners who can handle their intensity and appreciate their warmth. Best matches: Wood (feeds Fire) and Earth (gives Fire stability).\n\n**Earth Types** are grounded and nurturing. They value reliability and long-term security. Best matches: Fire (creates Earth) and Metal (gives Earth structure).\n\n**Metal Types** are precise and principled. They respect integrity and need partners who share their values. Best matches: Earth (produces Metal) and Water (gives Metal depth).\n\n**Water Types** are intuitive and deep. They need emotional authenticity and intellectual stimulation. Best matches: Metal (generates Water) and Wood (gives Water purpose)."
                },
                {
                    "heading": "How to Find Your Elemental Type",
                    "body": "Your core elemental type is determined by your Day Master — the Heavenly Stem of your Day Pillar. To find it, you need your complete birth date (year, month, day, and hour). The BaZi calculation converts this into four pairs of Heavenly Stems and Earthly Branches.\n\nYour Day Master will be one of the 10 Heavenly Stems:\n- **Yang Wood (甲 Jia):** Strong, upright, like a tall tree\n- **Yin Wood (乙 Yi):** Flexible, resilient, like a vine\n- **Yang Fire (丙 Bing):** Bright, radiant, like the sun\n- **Yin Fire (丁 Ding):** Warm, focused, like a candle flame\n- **Yang Earth (戊 Wu):** Mountain-like, stable, protective\n- **Yin Earth (己 Ji):** Fertile soil, nurturing, adaptable\n- **Yang Metal (庚 Geng):** Uncut ore, strong, persistent\n- **Yin Metal (辛 Xin):** Refined metal, precise, elegant\n- **Yang Water (壬 Ren):** Ocean, vast, powerful\n- **Yin Water (癸 Gui):** Rain, subtle, intuitive"
                },
                {
                    "heading": "Element Balance and Missing Elements",
                    "body": "A well-balanced chart has all Five Elements present. When an element is missing or weak, its corresponding life areas may present challenges. For example:\n\n- **Missing Wood:** Difficulty with planning, growth, and vision\n- **Missing Fire:** Lack of passion, visibility, or joy\n- **Missing Earth:** Instability, lack of grounding\n- **Missing Metal:** Weak boundaries, indecision\n- **Missing Water:** Poor emotional intelligence, rigidity\n\nElement remedies — using colors, directions, crystals, and lifestyle adjustments — can help restore balance. See our dedicated guide on BaZi Element Remedies for practical solutions."
                }
            ],
            "key_insight": "The Five Elements are a lens for understanding all relationship dynamics. Every connection can be mapped onto the generative or controlling cycle, revealing why some relationships feel effortless and others require conscious work.",
            "cta": "Discover your elemental type and see how it matches with your partner. Get your free BaZi reading now."
        },
        "related_articles": ["understanding-day-master-bazi", "element-remedy-guide-bazi", "four-pillars-bazi-explained"]
    },
    {
        "id": "four-pillars-bazi-explained",
        "slug": "four-pillars-bazi-explained",
        "title": "The Four Pillars of Destiny Explained — Your Complete BaZi Birth Chart",
        "description": "The Four Pillars (Year, Month, Day, Hour) form your BaZi destiny code. Understand each pillar's role in shaping your personality, career, relationships, and life path.",
        "category": "bazi-guide",
        "tags": ["four-pillars", "bazi", "birth-chart", "destiny", "heavenly-stems", "earthly-branches"],
        "published": "2026-05-13",
        "updated": "2026-05-16",
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": 11,
        "meta": {
            "title": "The Four Pillars of Destiny Explained | BaZi Birth Chart Guide",
            "description": "Complete guide to the Four Pillars of BaZi: Year, Month, Day, and Hour. Each pillar reveals different aspects of your personality, family, career, and relationship destiny.",
            "keywords": "four pillars of destiny, bazi pillars, year pillar, month pillar, day pillar, hour pillar"
        },
        "content": {
            "hook": "Your BaZi chart is composed of Four Pillars — each one a window into a different dimension of your life. Together, they form a complete destiny Code that reveals who you are, where you come from, and where you are going.",
            "body_sections": [
                {
                    "heading": "What Are the Four Pillars?",
                    "body": "The Four Pillars (四柱, Sì Zhù) represent the cosmic energies present at the moment of your birth. Each Pillar consists of a Heavenly Stem (天干) paired with an Earthly Branch (地支). This creates a four-layer structure that maps your entire life journey:\n\n- **Year Pillar (年柱):** Ancestry, early environment, social context\n- **Month Pillar (月柱):** Career, social circle, young adulthood\n- **Day Pillar (日柱):** Your core self, spouse, intimate relationships\n- **Hour Pillar (时柱):** Later life, legacy, inner world\n\nThe Day Pillar is the most important — its Heavenly Stem is your Day Master (日主), the center of your entire chart."
                },
                {
                    "heading": "The Year Pillar — Your Foundation",
                    "body": "The Year Pillar represents your ancestral roots and early environment. It reveals the circumstances you were born into and the cultural/social context that shaped your early years. In relationship analysis, the Year Pillar can indicate the kind of family background you seek in a partner.\n\n**What the Year Pillar reveals:**\n- Grandparents and ancestry\n- Childhood environment and upbringing\n- Social status and community context\n- Early life influences (ages 0-16)\n- Your connection to tradition and family expectations\n\nA strong Year Pillar suggests a supportive foundation. A weak or conflicted Year Pillar may indicate early-life challenges that shaped your adult relationship patterns."
                },
                {
                    "heading": "The Month Pillar — Career and Social Expression",
                    "body": "The Month Pillar governs your career path, social standing, and young adult development (roughly ages 17-32). It represents your professional destiny and how you express yourself in the world.\n\n**What the Month Pillar reveals:**\n- Career direction and professional potential\n- Siblings and close peers\n- Your social persona and public image\n- Young adult development phase\n- Leadership style and work preferences\n\nIn relationship compatibility, the Month Pillar is compared between partners to see if their social styles and career energies align. Two Fire Month Pillars create a dynamic power couple; a Water and Earth pairing suggests one partner supports the other's career growth."
                },
                {
                    "heading": "The Day Pillar — Your Core Identity and Spouse",
                    "body": "The Day Pillar is the most important pillar in your BaZi chart. Its Heavenly Stem is your Day Master (日主) — the core of your being. Its Earthly Branch is your Spouse Palace (夫妻宫), revealing the nature of your intimate relationships.\n\n**What the Day Pillar reveals:**\n- Your fundamental personality type (Day Master)\n- The kind of partner you're attracted to\n- Your relationship patterns and needs\n- Your physical constitution and health tendencies\n- Your middle-life development (ages 33-50)\n\nYour Day Master element tells you how you operate in the world: Wood types grow toward their goals, Fire types radiate and inspire, Earth types stabilize and nurture, Metal types refine and perfect, Water types flow and adapt."
                },
                {
                    "heading": "The Hour Pillar — Legacy and Inner World",
                    "body": "The Hour Pillar represents your later life, legacy, and private inner world. It reveals what you will be remembered for and how you relate to your own mortality. It also governs your relationship with children and subordinates.\n\n**What the Hour Pillar reveals:**\n- Later life fulfillment (ages 50+)\n- Legacy and life's work\n- Private thoughts and hidden depths\n- Relationship with children\n- Spiritual development and wisdom\n\nThe Hour Pillar often becomes more relevant in middle age. Its energies may not fully manifest until later in life, but they are always present as an undercurrent."
                },
                {
                    "heading": "How the Four Pillars Interact",
                    "body": "The Four Pillars do not exist in isolation. They interact through the Five Elements, creating a dynamic system of support and tension:\n\n**Combinations (He):** Certain Stems and Branches combine to create new energies. For example, Jia Wood (甲) and Ji Earth (己) combine into Earth energy, which can change the elemental balance of the chart.\n\n**Clashes (Chong):** Opposite Branches create conflict that energizes or destabilizes. Understanding clashes is crucial for timing relationships — a clash year can bring sudden changes in love.\n\n**Punishments (Xing):** Three-way configurations that create legal or interpersonal complications. These reveal recurring patterns of conflict.\n\n**Harms (Hai):** Subtle frictions that erode relationships over time. Harm configurations in the Spouse Palace indicate areas where partners need conscious effort.\n\nIn relationship compatibility analysis, all Four Pillars are compared between two people to create a comprehensive compatibility profile."
                }
            ],
            "key_insight": "Each Pillar tells a different part of your story. The Year reveals where you came from, the Month shows where you're going, the Day defines who you are, and the Hour reveals who you become. True compatibility requires alignment across all four dimensions.",
            "cta": "Ready to see your complete Four Pillars chart? Get a free BaZi reading with full pillar analysis and relationship insights."
        },
        "related_articles": ["understanding-day-master-bazi", "bazi-five-elements-guide", "relationship-luck-phases-bazi"]
    },
    {
        "id": "understanding-day-master-bazi",
        "slug": "understanding-day-master-bazi",
        "title": "Understanding Your Day Master in BaZi — The Core of Your Chart",
        "description": "Your Day Master (日主) represents your core self in BaZi. Learn what each of the 10 Day Master types reveals about your personality, strengths, and relationship patterns.",
        "category": "bazi-guide",
        "tags": ["day-master", "bazi", "four-pillars", "personality", "self-discovery"],
        "published": "2026-05-05",
        "updated": "2026-05-16",
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": 9,
        "meta": {
            "title": "Understanding Your BaZi Day Master | Elemental Bond Guide",
            "description": "Your Day Master (日主) defines your core personality in BaZi. Learn the 10 Day Master types — Jia Wood, Yi Wood, Bing Fire, Ding Fire, and more — and what they reveal about you.",
            "keywords": "day master bazi, ri zhu, jia wood, yi wood, bing fire, ding fire, heavenly stems personality"
        },
        "content": {
            "hook": "Your Day Master (日主, Rì Zhǔ) is the single most important element in your BaZi chart. It is the \"I\" around which everything else revolves — your core identity, your innate nature, the lens through which you experience the world.",
            "body_sections": [
                {
                    "heading": "What Is a Day Master?",
                    "body": "The Day Master is the Heavenly Stem of your Day Pillar — the third pillar in your Four Pillars chart. It represents YOU: your fundamental personality, your strengths, your blind spots, and your natural way of moving through the world.\n\nIn relationship compatibility, comparing Day Masters is the first and most critical step. Some Day Master pairings naturally harmonize (like Water nourishing Wood), while others require conscious effort (like Fire melting Metal). Your Day Master determines approximately 40% of your relationship compatibility profile."
                },
                {
                    "heading": "The Five Yang Day Masters",
                    "body": "**Jia Wood (甲) — The Tall Tree:** Strong, upright, and growth-oriented. Jia Wood people are natural leaders with a vision. They expand in every direction and can't be contained. In relationships, they need space to grow and a partner who respects their independence. Best match: Gui Water (癸) or Ding Fire (丁).\n\n**Bing Fire (丙) — The Sun:** Bright, generous, and radiant. Bing Fire people light up every room they enter. They are charismatic, warm, and naturally draw others to them. In relationships, they need admiration and appreciation. Best match: Ji Earth (己) or Xin Metal (辛).\n\n**Wu Earth (戊) — The Mountain:** Stable, reliable, and protective. Wu Earth people are the bedrock of any relationship. They are patient, loyal, and slow to anger. Once committed, they never waver. Best match: Gui Water (癸) or Yi Wood (乙).\n\n**Geng Metal (庚) — The Uncut Ore:** Strong-willed, persistent, and values-driven. Geng Metal people operate with integrity and clarity. They are decisive and expect the same from their partners. Best match: Ding Fire (丁) or Ren Water (壬).\n\n**Ren Water (壬) — The Ocean:** Powerful, strategic, and deep. Ren Water people have hidden depths and enormous emotional capacity. They are strategic thinkers and natural protectors. Best match: Yi Wood (乙) or Wu Earth (戊)."
                },
                {
                    "heading": "The Five Yin Day Masters",
                    "body": "**Yi Wood (乙) — The Vine:** Flexible, resilient, and graceful. Yi Wood people adapt to their environment while staying rooted in their values. They are creative problem-solvers and deeply empathetic partners. Best match: Jia Wood (甲) or Bing Fire (丙).\n\n**Ding Fire (丁) — The Candle Flame:** Warm, focused, and refined. Ding Fire is more subtle than Bing Fire — steady warmth rather than blazing heat. These people are loyal, detail-oriented, and deeply romantic. Best match: Geng Metal (庚) or Ren Water (壬).\n\n**Ji Earth (己) — The Fertile Soil:** Nurturing, receptive, and adaptable. Ji Earth people are the ultimate supporters. They help others grow and thrive. In relationships, they give endlessly but need to guard against being taken for granted. Best match: Bing Fire (丙) or Jia Wood (甲).\n\n**Xin Metal (辛) — The Refined Jewel:** Elegant, precise, and discerning. Xin Metal people have high standards and exquisite taste. They value quality over quantity in all things, including relationships. Best match: Wu Earth (戊) or Gui Water (癸).\n\n**Gui Water (癸) — The Rain:** Subtle, intuitive, and profound. Gui Water people feel everything deeply. They have extraordinary emotional intelligence and perceive what others miss. Best match: Ji Earth (己) or Jia Wood (甲)."
                },
                {
                    "heading": "Day Master Compatibility Principles",
                    "body": "In BaZi relationship analysis, Day Master compatibility is evaluated through the Five Element cycles:\n\n**Strongest Compatibility (Generative Cycle):** Your Day Master is nourished by or nourishes your partner's Day Master. Example: Water (generates) Wood = Water partner naturally supports Wood partner's growth.\n\n**Strong Compatibility (Same Element):** Same-element pairings understand each other intuitively. Two Wood types share the same drive. Two Metal types share the same values. The risk is reinforcing each other's blind spots.\n\n**Moderate Compatibility (Controlling Cycle):** One element controls the other. Example: Metal (controls) Wood = Metal partner naturally structures Wood partner's expansion. This can create productive tension or conflict depending on balance.\n\n**Growth Edge (Clashing Elements):** Fire and Water clash, Wood and Metal clash. These pairings face the most challenges but also offer the greatest growth potential."
                },
                {
                    "heading": "Beyond the Day Master",
                    "body": "Your Day Master is the center of your chart, but it is not the whole story. A complete BaZi compatibility reading considers:\n\n1. **The Four Pillars** — All eight characters work together\n2. **Element Balance** — Is your Day Master strong or weak?\n3. **Useful God (Yong Shen)** — What element helps you thrive?\n4. **Luck Cycles** — Your compatibility changes with time\n5. **Spouse Palace** — The Earthly Branch of your Day Pillar\n\nA strong Day Master (supported by the Month Branch and other elements) indicates confidence and resilience. A weak Day Master suggests a more flexible, adaptive personality who thrives with the right partner's support."
                }
            ],
            "key_insight": "Your Day Master reveals your native relationship language. When you understand your own element and your partner's element, you move from 'Why do they act that way?' to 'That's how their element expresses love.' This shift in perspective transforms how you relate.",
            "cta": "Discover YOUR Day Master type with a free personalized BaZi reading."
        },
        "related_articles": ["bazi-five-elements-guide", "four-pillars-bazi-explained", "element-remedy-guide-bazi"]
    },
    {
        "id": "element-remedy-guide-bazi",
        "slug": "element-remedy-guide-bazi",
        "title": "BaZi Element Remedy — How to Balance Your Five Elements",
        "description": "Is your chart missing an element? Learn how to use element remedies — colors, crystals, directions, and lifestyle adjustments — to restore harmony in your life.",
        "category": "bazi-guide",
        "tags": ["element-remedy", "bazi", "five-elements", "balance", "feng-shui"],
        "published": "2026-05-06",
        "updated": "2026-05-16",
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": 8,
        "meta": {
            "title": "BaZi Element Remedy Guide | Balance Your Five Elements",
            "description": "Complete guide to BaZi element remedies. Learn how to use colors, crystals, directions, and lifestyle changes to balance missing or weak elements in your birth chart.",
            "keywords": "bazi element remedy, five element balance, missing element remedy, wu xing balance"
        },
        "content": {
            "hook": "Every BaZi chart has a unique Five Element profile. When an element is missing, weak, or excessive, it creates imbalances that affect your relationships, health, career, and overall well-being. Element remedies are practical tools to restore that balance.",
            "body_sections": [
                {
                    "heading": "Why Element Balance Matters",
                    "body": "In BaZi, balance is the key to a harmonious life. Each of the Five Elements governs specific aspects of your experience:\n\n- **Wood:** Growth, planning, vision, liver health\n- **Fire:** Passion, visibility, joy, heart health\n- **Earth:** Stability, nourishment, digestion\n- **Metal:** Structure, boundaries, lung health\n- **Water:** Wisdom, flow, kidney health\n\nWhen an element is missing or weak, the corresponding life areas may present challenges. Element remedies provide a practical way to invite the missing energy into your life."
                },
                {
                    "heading": "Wood Element Remedies",
                    "body": "**If you need more Wood energy:**\n- **Colors:** Green, teal, forest tones\n- **Direction:** East, Southeast\n- **Crystals:** Jade, aventurine, malachite\n- **Activities:** Gardening, hiking, planning, learning\n- **Food:** Leafy greens, wheatgrass, green tea\n- **Environment:** Add houseplants, wooden furniture, nature imagery\n- **Career:** Entrepreneurial roles, creative planning, education\n- **Relationship:** Spend time with Wood-type people\n\n**Signs of Wood deficiency:** Difficulty making decisions, lack of direction, procrastination, rigid thinking"
                },
                {
                    "heading": "Fire Element Remedies",
                    "body": "**If you need more Fire energy:**\n- **Colors:** Red, orange, purple, pink\n- **Direction:** South\n- **Crystals:** Carnelian, citrine, sunstone\n- **Activities:** Social events, performing arts, exercise\n- **Food:** Spicy foods, goji berries, red fruits\n- **Environment:** Candles, warm lighting, bright artwork\n- **Career:** Public-facing roles, sales, entertainment\n- **Relationship:** Express appreciation publicly, create warmth\n\n**Signs of Fire deficiency:** Social withdrawal, lack of enthusiasm, feeling invisible, cold extremities"
                },
                {
                    "heading": "Earth Element Remedies",
                    "body": "**If you need more Earth energy:**\n- **Colors:** Yellow, brown, beige, terracotta\n- **Direction:** Center, Southwest, Northeast\n- **Crystals:** Tigers eye, jasper, citrine\n- **Activities:** Cooking, gardening, pottery, meditation\n- **Food:** Root vegetables, grains, sweet potatoes\n- **Environment:** Clay pots, stone elements, solid furniture\n- **Career:** Real estate, farming, hospitality, counseling\n- **Relationship:** Create routine, cook together, build a home\n\n**Signs of Earth deficiency:** Anxiety, instability, digestive issues, difficulty grounding"
                },
                {
                    "heading": "Metal Element Remedies",
                    "body": "**If you need more Metal energy:**\n- **Colors:** White, gold, silver, gray\n- **Direction:** West, Northwest\n- **Crystals:** Clear quartz, selenite, pyrite\n- **Activities:** Organization, decluttering, martial arts\n- **Food:** Rice, radish, daikon, white vegetables\n- **Environment:** Metal decor, minimalism, geometric patterns\n- **Career:** Law, finance, technology, editing\n- **Relationship:** Set clear boundaries, honor commitments\n\n**Signs of Metal deficiency:** Weak boundaries, indecision, clutter, respiratory issues"
                },
                {
                    "heading": "Water Element Remedies",
                    "body": "**If you need more Water energy:**\n- **Colors:** Black, dark blue, deep purple\n- **Direction:** North\n- **Crystals:** Black obsidian, lapis lazuli, moonstone\n- **Activities:** Swimming, journaling, meditation, music\n- **Food:** Seaweed, black beans, salt, fish\n- **Environment:** Water features, mirrors, black decor\n- **Career:** Research, psychology, spirituality, writing\n- **Relationship:** Create emotional safety, deep conversations\n\n**Signs of Water deficiency:** Emotional rigidity, fear of intimacy, poor memory, urinary issues"
                },
                {
                    "heading": "Using Remedies for Relationship Harmony",
                    "body": "Element remedies can also be used to harmonize a relationship. If your partner is missing a particular element, you can support them by incorporating that element's remedies into your shared life. For example:\n\n- **Wood-deficient partner:** Take them to nature, plan future adventures together\n- **Fire-deficient partner:** Create romantic atmospheres, express admiration freely\n- **Earth-deficient partner:** Cook meals together, establish home routines\n- **Metal-deficient partner:** Help them organize, respect their need for structure\n- **Water-deficient partner:** Create space for deep conversation, validate their feelings"
                }
            ],
            "key_insight": "Element remedies are not about changing who you are — they are about creating the conditions for your natural energy to flow freely. The most powerful remedy is conscious awareness of what you need and what your partner needs.",
            "cta": "Find out which elements are strong or missing in YOUR chart. Get a free BaZi reading with personalized element balance analysis."
        },
        "related_articles": ["bazi-five-elements-guide", "understanding-day-master-bazi", "relationship-luck-phases-bazi"]
    }
]

# Other articles with shorter, template-based content
SHORT_ARTICLES: list[dict] = [
    {
        "id": "water-metal-compatibility-bazi",
        "slug": "water-metal-compatibility-bazi",
        "title": "Water and Metal Element Compatibility — Deep Wisdom of BaZi",
        "description": "Water and Metal create a naturally supportive BaZi pairing. Learn how Metal generates Water energy and what this means for your relationship.",
        "category": "element-compatibility",
        "tags": ["water", "metal", "bazi", "five-elements", "compatibility"],
        "published": "2026-05-02",
        "updated": "2026-05-16",
        "meta_override": "Water-Metal BaZi Compatibility | Elemental Bond",
        "hook": "In the Five Element cycle, Metal generates Water. This means Metal-type energy naturally flows into and supports Water-type energy — making this one of the most naturally harmonious pairings in BaZi.",
        "headings": [
            ("The Generative Bond: Metal Creates Water",
             "When a Metal Day Master meets a Water Day Master, there is an instinctive flow of understanding. The Metal partner brings structure, clarity, and precision. The Water partner brings depth, intuition, and emotional wisdom. Together, they form a relationship where logic and feeling coexist.\n\nMetal refines and purifies the Water it contacts. Water softens and deepens the Metal it flows through. This mutual enhancement creates a pairing that grows stronger over time, as each partner learns from the other's strengths."),
            ("Natural Strengths",
             "**Deep Trust:** Metal keeps its word, and Water feels that commitment. Trust is built naturally, not fought for.\n\n**Emotional Intelligence:** Water brings emotional depth that Metal learns to access. Metal provides the structure Water needs to feel safe.\n\n**Mutual Respect:** Neither partner tries to dominate. Metal respects Water's depth; Water admires Metal's integrity.\n\n**Complementary Strengths:** Metal handles structure and boundaries; Water handles flow and connection."),
            ("Potential Challenges",
             "**Over-Control:** Metal can become too rigid, stifling Water's natural flow. Water needs space to explore emotions.\n\n**Passivity Risk:** If both partners are too Yin in nature, the relationship can lack passion and forward momentum.\n\n**Different Pacing:** Metal moves deliberately; Water responds intuitively. Timing disagreements can arise.\n\n**Communication Style:** Metal prefers direct, logical communication. Water communicates through feeling and implication."),
            ("Compatibility Score",
             "Water-Metal is rated as a **high compatibility** pairing. Expect scores in the **75-88 / 100** range. The generative cycle provides a strong foundation, but active effort is needed to maintain passion and avoid falling into comfortable routines."),
        ],
        "conclusion": "Water-Metal is a quietly powerful pairing. It may not be the flashiest combination, but it is one of the most sustainable. When both partners understand and honor each other's nature, this relationship only gets better with time.",
        "cta": "Discover your element pairing with a free BaZi compatibility reading."
    },
    {
        "id": "earth-fire-bazi-relationship",
        "slug": "earth-fire-bazi-relationship",
        "title": "Earth and Fire — The Nurturing Flame in BaZi Relationships",
        "description": "Earth and Fire form a generative cycle in BaZi. Fire creates Earth, and together they build stability, warmth, and lasting connection.",
        "category": "element-compatibility",
        "tags": ["earth", "fire", "bazi", "five-elements", "compatibility"],
        "published": "2026-05-03",
        "updated": "2026-05-16",
        "meta_override": "Earth-Fire BaZi Relationship Compatibility | Elemental Bond",
        "hook": "Fire creates Earth — warmth settles into stability, passion becomes permanence. The Earth-Fire pairing in BaZi represents one of the most naturally transitioning relationships, where initial attraction matures into deep, lasting commitment.",
        "headings": [
            ("The Generative Cycle",
             "In the Wu Xing cycle, Fire produces Earth through ash — the remains of flame that enrich the soil. This means Fire-type energy naturally transforms into Earth-type energy over time. In relationships, this creates a beautiful trajectory: the passionate beginning (Fire) matures into a stable, nurturing partnership (Earth).\n\nThe Fire partner brings warmth, excitement, and visibility. The Earth partner brings stability, patience, and grounded love. Together, they create something that neither could build alone: a relationship that is both passionate and dependable."),
            ("Strengths of Earth-Fire",
             "**Passion That Lasts:** Unlike pairings where passion fades, Earth-Fire relationships evolve. The Fire energy keeps things exciting while Earth energy ensures longevity.\n\n**Natural Nurturing:** Earth personalities are natural caregivers. They know how to receive Fire's warmth and turn it into lasting comfort.\n\n**Social Harmony:** Fire shines in social settings; Earth creates a welcoming home. Together, they are the perfect hosts.\n\n**Complementary Energies:** Fire brings the spark; Earth brings the container. Every flame needs a hearth."),
            ("Areas for Growth",
             "**Direction Imbalance:** Fire leads and Earth follows. If Fire becomes too dominant, Earth may feel taken for granted.\n\n**Different Social Needs:** Fire needs external validation and social stimulation. Earth is more home-oriented. This difference needs conscious negotiation.\n\n**Risk of Complacency:** When Fire dims, Earth can become too comfortable. The relationship needs occasional sparks to stay alive.\n\n**Conflict Resolution:** Fire wants to address conflict immediately; Earth prefers to process slowly. Timing disagreements are common."),
            ("Compatibility Assessment",
             "Earth-Fire scores **72-82 / 100** on average. The generative cycle creates strong natural harmony. The key variable is the specific expression of each element — Bing Fire (Yang) with Wu Earth (Yang) creates a different dynamic than Ding Fire (Yin) with Ji Earth (Yin)."),
        ],
        "conclusion": "Earth-Fire is a relationship that ages like fine wine. It may not have the explosive chemistry of Wood-Fire, but it has something arguably more valuable: the capacity to turn passion into permanence.",
        "cta": "Is your relationship built on Fire and Earth? Get a free BaZi reading to find out."
    },
]


def _build_full_article(template: dict) -> dict:
    """Convert a short template into a full article dict."""
    sections = []
    for heading, body in template["headings"]:
        sections.append({"heading": heading, "body": body})

    return {
        "id": template["id"],
        "slug": template["slug"],
        "title": template["title"],
        "description": template["description"],
        "category": template["category"],
        "tags": template["tags"],
        "published": template["published"],
        "updated": template["updated"],
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": len(sections) * 2 + 1,
        "meta": {
            "title": template.get("meta_override", f"{template['title']} | Elemental Bond"),
            "description": template["description"],
            "keywords": ", ".join(template["tags"]),
        },
        "content": {
            "hook": template["hook"],
            "body_sections": sections,
            "key_insight": template["conclusion"],
            "cta": template["cta"],
        },
        "related_articles": []
    }


def _generate_element_article(element: str, stem_yang: str, stem_yin: str, traits: str, best_matches: str) -> dict:
    """Generate a single element personality article."""
    slug = f"{element}-element-personality-bazi"
    title = f"The {element.title()} Element in BaZi — Personality, Relationships, and Life Path"
    desc = f"{element.title()}-type personalities are {traits.lower()}. Discover what makes a {element.title()} Day Master tick and who they match best with."
    sections = [
        {
            "heading": f"What Is a {element.title()} Day Master?",
            "body": f"In BaZi, the {element.lower()} element represents a specific quality of energy. Those born under a {element.lower()} Day Master — {stem_yang} ({stem_yang} Yang) or {stem_yin} ({stem_yin} Yin) — embody the core characteristics of this element in their personality, relationships, and life approach.\n\nThe {element.lower()} Day Master is approximately 20% of the population. Understanding your {element.lower()} nature is the first step to understanding your relationship patterns."
        },
        {
            "heading": f"Core Strengths of {element.title()} Types",
            "body": f"{element.title()} personalities bring unique gifts to every relationship. Their natural strengths include a deep sense of purpose and an ability to create lasting value. In relationships, they are loyal, consistent, and deeply invested in the growth of the partnership. They thrive when their partner appreciates their core nature and gives them space to express it fully."
        },
        {
            "heading": f"Relationship Patterns for {element.title()}",
            "body": f"In relationships, {element.lower()} types seek partners who complement their natural energy. They are drawn to people who either strengthen their element (generative cycle) or bring balance through healthy challenge (controlling cycle).\n\n**Best matches:** {best_matches}\n\n**Growth edge:** {element.title()} personalities benefit from partners who help them develop their less dominant qualities. The right partner doesn't just match their energy — they expand it."
        },
        {
            "heading": f"Career and Life Path",
            "body": f"{element.title()} Day Masters excel in careers that align with their element's natural qualities. They bring their signature energy to everything they do, from professional pursuits to creative hobbies. The key to fulfillment is choosing environments that honor their element nature rather than suppressing it.\n\nA supportive partner recognizes that career alignment is not just about income — it's about elemental expression."
        }
    ]
    return {
        "id": slug,
        "slug": slug,
        "title": title,
        "description": desc,
        "category": "element-guide",
        "tags": [element.lower(), "bazi", "personality", "day-master", f"{stem_yang.lower()}-{stem_yin.lower()}"],
        "published": "2026-05-10",
        "updated": "2026-05-16",
        "author": "Elemental Bond Oracle",
        "reading_time_minutes": 7,
        "meta": {
            "title": f"The {element.title()} Element in BaZi | Personality Guide | Elemental Bond",
            "description": desc,
            "keywords": f"{element.lower()} bazi, {stem_yang.lower()} wood, {stem_yin.lower()} wood, day master {element.lower()}"
        },
        "content": {
            "hook": f"If your Day Master is one of the {element.lower()} Heavenly Stems — {stem_yang} ({stem_yang}) or {stem_yin} ({stem_yin}) — then your core nature is {element.lower()} energy. This shapes everything: how you love, how you work, how you grow.",
            "body_sections": sections,
            "key_insight": f"Your {element.lower()} Day Master is not a label — it is a lens. When you understand your elemental nature, you stop fighting your instincts and start working with them. The same applies to your partner.",
            "cta": f"Find out if you're a {element.title()} Day Master. Get your free BaZi reading now."
        },
        "related_articles": ["bazi-five-elements-guide", "understanding-day-master-bazi", "four-pillars-bazi-explained"]
    }


def main():
    # Full articles
    for article in ARTICLES:
        path = ARTICLES_DIR / f"{article['id']}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(article, f, ensure_ascii=False, indent=2)
        print(f"  [OK] {path.name}")

    # Short template-based articles
    for template in SHORT_ARTICLES:
        article = _build_full_article(template)
        path = ARTICLES_DIR / f"{article['id']}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(article, f, ensure_ascii=False, indent=2)
        print(f"  [OK] {path.name} (from template)")

    # Element personality articles
    elements = [
        ("wood", "Jia", "Yi", "Visionary, growth-oriented, and expansive",
         "Water types (nourish Wood) and Fire types (give Wood purpose)"),
        ("fire", "Bing", "Ding", "Passionate, charismatic, and radiant",
         "Wood types (feed Fire) and Earth types (give Fire stability)"),
        ("earth", "Wu", "Ji", "Grounded, nurturing, and reliable",
         "Fire types (create Earth) and Metal types (give Earth structure)"),
        ("metal", "Geng", "Xin", "Precise, principled, and strong-willed",
         "Earth types (produce Metal) and Water types (give Metal depth)"),
        ("water", "Ren", "Gui", "Deep, intuitive, and emotionally intelligent",
         "Metal types (generate Water) and Wood types (give Water purpose)"),
    ]
    for element, stem_yang, stem_yin, traits, best_matches in elements:
        article = _generate_element_article(element, stem_yang, stem_yin, traits, best_matches)
        path = ARTICLES_DIR / f"{article['id']}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(article, f, ensure_ascii=False, indent=2)
        print(f"  [OK] {path.name} (element article)")

    print(f"\n[Done] Generated {len(ARTICLES) + len(SHORT_ARTICLES) + len(elements)} articles to {ARTICLES_DIR}")


if __name__ == "__main__":
    main()
