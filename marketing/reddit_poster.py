"""
Elemental Bond — Reddit 自动发帖脚本
目标版块: r/astrology, r/spirituality, r/relationships, r/dating_advice, r/AskWomen

使用前：
1. 去 https://www.reddit.com/prefs/apps 创建 script 类型 App
2. 把凭证填入 .env 文件（见 .env.example）
3. pip install praw python-dotenv
"""

import praw
import random
import time
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# ── Reddit 凭证（从 .env 读取） ──────────────────────────────────
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    username=os.getenv("REDDIT_USERNAME"),
    password=os.getenv("REDDIT_PASSWORD"),
    user_agent=os.getenv("REDDIT_USER_AGENT", "ElementalBond/1.0 by u/YourUsername"),
)

# ── 目标版块配置 ─────────────────────────────────────────────────
SUBREDDITS = {
    "astrology": {
        "name": "astrology",
        "allow_links": False,   # 只允许讨论帖，不直接贴链接
        "post_type": "text",
    },
    "spirituality": {
        "name": "spirituality",
        "allow_links": False,
        "post_type": "text",
    },
    "relationships": {
        "name": "relationships",
        "allow_links": False,
        "post_type": "text",
    },
    "dating_advice": {
        "name": "dating_advice",
        "allow_links": False,
        "post_type": "text",
    },
    "AskWomen": {
        "name": "AskWomen",
        "allow_links": False,
        "post_type": "text",
    },
}

# ── 内容模板库（英文，面向美国用户） ────────────────────────────
POST_TEMPLATES = [
    {
        "title": "Has anyone tried BaZi (Chinese astrology) for relationship compatibility? Genuinely surprised by the results",
        "body": """I've been into Western astrology for years but recently stumbled onto BaZi — the ancient Chinese system that maps your personality and destiny based on your birth date and time.

I was skeptical at first, but when I compared my BaZi chart with my partner's, the analysis was uncannily accurate. It flagged the exact tension points we've been dealing with (communication styles, financial values) and explained *why* they happen — not just "you're both Scorpios lol."

The system looks at Five Elements (Wood, Fire, Earth, Metal, Water) and how your charts interact — harmony vs. clash. It's actually more nuanced than Sun signs because it factors in birth hour, not just date.

Anyone else explored this? Would love to hear experiences.

*I've been using [elemental.bond](https://elemental.bond) which combines BaZi + AI — it's free to try if you're curious.*""",
    },
    {
        "title": "Why do I keep attracting the same type of person? A BaZi chart reading gave me an uncomfortable answer",
        "body": """I kept asking myself why every relationship I had followed the same pattern — intense connection, then slow withdrawal from the other person. Therapist helped a lot, but something felt missing.

A friend suggested I try BaZi — the traditional Chinese astrological system. I was NOT a believer.

The reading basically said my chart has a strong "Eating God" star which makes me deeply creative and emotionally giving, but it clashes with a "7 Killings" influence that attracts people who are drawn to my energy but can't match it.

It was uncomfortable to read. But also... accurate.

It's not fatalistic — the whole point is to understand your patterns so you can *consciously* choose differently.

Has anyone else used Eastern astrology for self-understanding rather than just compatibility? What was your experience?""",
    },
    {
        "title": "The loneliness epidemic is real — and I think we're missing a piece of the puzzle",
        "body": """Surgeon General declared loneliness a national epidemic. 58% of Americans say no one truly knows them. Dating apps are everywhere but genuine connection feels harder than ever.

I've been thinking about *why* this is. My theory: we've lost frameworks for understanding ourselves and others. We used to have religion, community rituals, extended family — systems that gave people a shared language for human nature.

I've been exploring ancient Chinese personality systems (BaZi, ZiWei) as a kind of alternative framework. Not because I think the stars control us, but because these systems force you to articulate *what kind of person you are* and *what you need from relationships* — which most people have never actually done.

It's made me a better communicator. Understanding that I'm a "Water Day Master" (adaptable, intuitive, needs freedom) helped me explain myself to partners in ways I never could before.

Anyone else found unexpected tools for self-understanding? Would love to hear what's worked for you.""",
    },
    {
        "title": "Tried an AI-powered BaZi compatibility reading with my partner — here's what happened",
        "body": """My partner and I have been together 3 years and hit a rough patch. We tried couples therapy (helpful), communication exercises (somewhat helpful), and then on a whim I suggested we try a BaZi compatibility reading.

BaZi is traditional Chinese astrology — much more complex than Sun signs because it creates an 8-character chart from your birth date and time, capturing your personality across multiple dimensions.

The AI analysis flagged that we have a "Fire-Water clash" in our charts — which in BaZi terms means our natural energy cycles are opposite. I'm high-energy in the morning, need external stimulation. She's reflective, needs quiet to recharge.

We had already *lived* this conflict for 3 years without being able to name it. Having a framework for it actually helped us stop personalizing the friction.

Not saying it's magic. But sometimes naming a pattern is the first step to changing it.

Anyone else use unconventional methods to understand their relationship dynamics?""",
    },
    {
        "title": "Gemini season is making everyone chaotic — here's what Chinese astrology says about why",
        "body": """Western astrology is going nuts about Gemini season and the communication chaos that comes with it.

Interesting parallel: in Chinese BaZi astrology, we're in the *Wu (Horse) month* which carries Fire energy — quick, passionate, impulsive, scattered. Horse months historically correlate with fast decisions, sudden changes in relationships, and breakthroughs in creative communication.

The two systems converge on the same energy for this period: expect intensity, rapid shifts, and important conversations happening whether you're ready or not.

If you've been avoiding a difficult conversation with a partner, family member, or friend — this is apparently the cosmic moment both East and West are flagging for it.

Anyone else notice relationship energy feeling particularly charged right now? What's coming up for you?

*(I've been exploring BaZi through [elemental.bond](https://elemental.bond) if anyone wants to check their own chart for this month)*""",
    },
    {
        "title": "What's your 'relationship blueprint' according to your birth chart? (BaZi edition)",
        "body": """In BaZi (Chinese Four Pillars astrology), your chart reveals what's called your "relationship palace" — a specific set of elements that describe the kind of partner you naturally attract AND the dynamics you unconsciously recreate.

Mine shows I attract "Resource stars" — nurturing, supportive types. Which sounds great until you realize it also means I tend to become dependent on partners for emotional regulation. Not so great.

The system also shows *why* certain relationships feel fated — when someone's chart elements directly "produce" yours, there's a magnetic pull that can feel like destiny even when the relationship isn't actually healthy.

I find this framework more useful than Western compatibility (sun signs etc.) because it's specific to your actual birth date + time and goes much deeper than personality type.

Curious — what does your chart say about your relationship patterns? Has anyone explored this?""",
    },
]

# ── 发帖函数 ─────────────────────────────────────────────────────
def post_to_reddit(subreddit_key: str, template: dict) -> dict:
    """发一条帖子到指定版块，返回结果"""
    config = SUBREDDITS[subreddit_key]
    sub = reddit.subreddit(config["name"])

    try:
        submission = sub.submit(
            title=template["title"],
            selftext=template["body"],
        )
        result = {
            "status": "success",
            "subreddit": config["name"],
            "url": f"https://reddit.com{submission.permalink}",
            "title": template["title"][:60],
            "timestamp": datetime.now().isoformat(),
        }
        print(f"✅ Posted to r/{config['name']}: {submission.shortlink}")
        return result
    except Exception as e:
        result = {
            "status": "error",
            "subreddit": config["name"],
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }
        print(f"❌ Failed r/{config['name']}: {e}")
        return result


def daily_post(subreddits: list = None, delay_minutes: int = 30):
    """
    每日发帖主函数
    - subreddits: 目标版块列表，默认发2个
    - delay_minutes: 两帖之间的间隔（避免被检测为spam）
    """
    if subreddits is None:
        subreddits = random.sample(list(SUBREDDITS.keys()), 2)

    results = []
    used_templates = []

    for i, sub_key in enumerate(subreddits):
        # 不重复使用模板
        available = [t for t in POST_TEMPLATES if t not in used_templates]
        template = random.choice(available)
        used_templates.append(template)

        print(f"\n[{i+1}/{len(subreddits)}] Posting to r/{SUBREDDITS[sub_key]['name']}...")
        result = post_to_reddit(sub_key, template)
        results.append(result)

        # 版块之间等待，避免spam检测
        if i < len(subreddits) - 1:
            wait = delay_minutes * 60
            print(f"⏳ Waiting {delay_minutes} min before next post...")
            time.sleep(wait)

    # 打印汇总
    print("\n" + "="*50)
    print(f"📊 Daily Post Summary — {datetime.now().strftime('%Y-%m-%d')}")
    for r in results:
        status_icon = "✅" if r["status"] == "success" else "❌"
        print(f"{status_icon} r/{r['subreddit']}: {r.get('url', r.get('error', ''))}")

    return results


# ── 测试模式（不真实发帖） ────────────────────────────────────────
def dry_run():
    """预览将要发送的内容，不实际发帖"""
    print("🔍 DRY RUN — 预览模式（不实际发帖）\n")
    template = random.choice(POST_TEMPLATES)
    print(f"目标版块: r/astrology")
    print(f"标题: {template['title']}")
    print(f"\n正文预览:\n{template['body'][:300]}...")
    print("\n✅ 凭证测试...")
    try:
        me = reddit.user.me()
        print(f"✅ Reddit 登录成功: u/{me.name} (karma: {me.link_karma})")
    except Exception as e:
        print(f"❌ 登录失败: {e}")
        print("请检查 .env 文件中的凭证是否正确")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
        dry_run()
    else:
        # 正式发帖：每天随机选2个版块
        daily_post(
            subreddits=["astrology", "spirituality"],
            delay_minutes=1,  # 测试时设1分钟，正式用30分钟
        )
