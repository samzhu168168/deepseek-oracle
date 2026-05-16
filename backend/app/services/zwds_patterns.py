"""紫微斗数格局识别 (ZWDS Pattern Detection)

Ported from renhuai123/ziwei-doushu patterns.ts v2 (MIT License).
Detects classical ZWDS patterns from astrolabe data.

Main entry: detect_patterns(astrolabe_data) -> list[dict]

Each pattern dict:
  name, level (excellent/good/neutral/caution), description,
  palaces, conditions, source
"""

from __future__ import annotations
from typing import Any

# ── Constants ──
BRANCH_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
BRANCH_INDEX = {name: i for i, name in enumerate(BRANCH_NAMES)}

SHA_NAMES = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"]
SHA_HARD = ["擎羊", "陀罗", "火星", "铃星"]
SHA_KONG = ["地空", "地劫"]
ZUO_YOU = ["左辅", "右弼"]
CHANG_QU = ["文昌", "文曲"]
KUI_YUE = ["天魁", "天钺"]

# ── Helpers ──

def _get_branch(palace: dict) -> int:
    """Return numeric branch (0-11) for a palace dict."""
    eb = palace.get("earthlyBranch", "")
    if isinstance(eb, int):
        return eb % 12
    return BRANCH_INDEX.get(str(eb), 0)

def _major_names(palace: dict) -> list[str]:
    return [s["name"] for s in palace.get("majorStars", []) if s.get("name")]

def _has_star(palace: dict | None, name: str) -> bool:
    if not palace:
        return False
    for key in ("majorStars", "minorStars", "adjectiveStars"):
        for s in palace.get(key, []):
            if s.get("name") == name:
                return True
    return False

def _find_star(palace: dict | None, name: str) -> dict | None:
    if not palace:
        return None
    for key in ("majorStars", "minorStars", "adjectiveStars"):
        for s in palace.get(key, []):
            if s.get("name") == name:
                return s
    return None

def _find_palace_by_star(palaces: list[dict], name: str) -> dict | None:
    for p in palaces:
        if _has_star(p, name):
            return p
    return None

def _get_palace_by_branch(palaces: list[dict], branch: int) -> dict | None:
    for p in palaces:
        if _get_branch(p) == branch:
            return p
    return None

def _sha_count(palace: dict | None, sha_list: list[str] | None = None) -> int:
    if not palace or sha_list is None:
        return 0
    names = {s.get("name") for s in palace.get("majorStars", [])}
    names.update(s.get("name") for s in palace.get("minorStars", []))
    return sum(1 for n in sha_list if n in names)

def _has_sha(palace: dict | None, sha_list: list[str] | None = None) -> bool:
    if not palace:
        return False
    return _sha_count(palace, sha_list) > 0

def _san_fang_branches(ming_branch: int) -> list[int]:
    """命宫的三方四正 branches: 命宫, 财帛, 官禄, 迁移."""
    return [ming_branch, (ming_branch + 4) % 12, (ming_branch + 8) % 12, (ming_branch + 6) % 12]

def _san_fang_palaces(palaces: list[dict], ming_branch: int) -> list[dict]:
    branches = set(_san_fang_branches(ming_branch))
    return [p for p in palaces if _get_branch(p) in branches]

def _is_in_san_fang(palaces: list[dict], ming_branch: int, branch: int) -> bool:
    return branch in _san_fang_branches(ming_branch)

def _san_fang_all_stars(palaces: list[dict], ming_branch: int) -> set[str]:
    result: set[str] = set()
    for p in _san_fang_palaces(palaces, ming_branch):
        for key in ("majorStars", "minorStars", "adjectiveStars"):
            for s in p.get(key, []):
                if s.get("name"):
                    result.add(s["name"])
    return result

def _san_fang_sha_count(palaces: list[dict], ming_branch: int, sha_list: list[str] | None = None) -> int:
    return sum(
        _sha_count(p, sha_list)
        for p in _san_fang_palaces(palaces, ming_branch)
    )

def _dui_gong(palaces: list[dict], branch: int) -> dict | None:
    return _get_palace_by_branch(palaces, (branch + 6) % 12)

def _jia_palaces(palaces: list[dict], branch: int) -> dict:
    return {
        "prev": _get_palace_by_branch(palaces, (branch + 11) % 12),
        "next": _get_palace_by_branch(palaces, (branch + 1) % 12),
    }

def _is_bright(palace: dict | None, star_name: str) -> bool:
    s = _find_star(palace, star_name)
    return bool(s and s.get("brightness") == "bright")

def _is_dim(palace: dict | None, star_name: str) -> bool:
    s = _find_star(palace, star_name)
    return bool(s and s.get("brightness") == "dim")

def _get_si_hua(palace: dict | None, star_name: str) -> str | None:
    s = _find_star(palace, star_name)
    return s.get("mutagen") if s else None

def _san_fang_si_hua_any(palaces: list[dict], ming_branch: int, si_hua: str) -> bool:
    """Check if any star in sanfang has the given si_hua (禄/权/科/忌)."""
    for p in _san_fang_palaces(palaces, ming_branch):
        for key in ("majorStars",):
            for s in p.get(key, []):
                if s.get("mutagen") == si_hua:
                    return True
    return False


# ── Pattern Detectors ──

def _detect_jun_chen_qing_hui(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    if not _has_star(ming, "紫微"):
        return
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "左辅" not in sf_set or "右弼" not in sf_set:
        return
    required = ["紫微入命", "左辅右弼同会三方四正"]
    bonus: list[str] = []
    breaking: list[str] = []
    if "文昌" in sf_set or "文曲" in sf_set:
        bonus.append("再会文昌或文曲")
    if "天魁" in sf_set or "天钺" in sf_set:
        bonus.append("魁钺贵人加照")
    if _get_si_hua(ming, "紫微") == "权":
        bonus.append("紫微化权")
    if _san_fang_sha_count(palaces, ming_branch, SHA_KONG) >= 2:
        breaking.append("地空地劫双夹会照（紫微忌空劫）")
    patterns.append({
        "name": "君臣庆会",
        "level": "good" if breaking else "excellent",
        "description": "紫微入命，左辅右弼同会，帝王得贤臣辅佐，主大富大贵、统御之命。一生贵人不绝，宜走政商高位、跨界领袖之途。",
        "palaces": ["命宫"],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·君臣庆会格》",
    })

def _detect_zi_fu(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    ziwei = _find_palace_by_star(palaces, "紫微")
    tianfu = _find_palace_by_star(palaces, "天府")
    if not ziwei or not tianfu or _get_branch(ziwei) != _get_branch(tianfu):
        return
    in_ming = _get_branch(ziwei) == ming_branch
    required = ["紫微天府同入命宫"] if in_ming else ["紫微天府同宫（不在命宫，会照减力）"]
    bonus: list[str] = []
    breaking: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "左辅" in sf_set and "右弼" in sf_set:
        bonus.append("左辅右弼同会")
    if "文昌" in sf_set or "文曲" in sf_set:
        bonus.append("再会昌曲")
    if _has_sha(ziwei, SHA_KONG):
        breaking.append("紫府宫坐空劫（破紫府之贵气）")
    if _sha_count(ziwei, SHA_HARD) >= 2:
        breaking.append("紫府宫见双煞同坐")
    patterns.append({
        "name": "紫府同宫",
        "level": "excellent" if in_ming and not breaking else "good",
        "description": (
            "紫微天府同入命宫，帝相并临，尊贵之命。主品行端正、衣食无忧、有领导才能，宜担任要职。需要左右辅弼来配合方为完整大格。"
            if in_ming else
            "紫微天府同宫但未坐命，主一生有贵人贵气依托，但本身不一定大富贵，需看会照吉煞而定。"
        ),
        "palaces": [ziwei.get("name", "未知")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·紫府同宫格》",
    })

def _detect_fu_xiang_chao_yuan(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    tianfu = _find_palace_by_star(palaces, "天府")
    tianxiang = _find_palace_by_star(palaces, "天相")
    if not tianfu or not tianxiang:
        return
    fu_branch = _get_branch(tianfu)
    xiang_branch = _get_branch(tianxiang)
    if not _is_in_san_fang(palaces, ming_branch, fu_branch) or not _is_in_san_fang(palaces, ming_branch, xiang_branch):
        return
    if fu_branch == ming_branch and xiang_branch == ming_branch:
        return
    if fu_branch == xiang_branch:
        return
    required = ["天府坐命三方", "天相坐命三方", "两星不同宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _has_star(ming, "禄存") or _get_si_hua(ming, "禄存") == "禄":
        bonus.append("命宫见禄")
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "左辅" in sf_set:
        bonus.append("再会左辅")
    if _has_sha(ming, SHA_HARD):
        breaking.append("命宫坐煞星")
    if _san_fang_sha_count(palaces, ming_branch, SHA_HARD) >= 3:
        breaking.append("三方四正煞星过多")
    patterns.append({
        "name": "府相朝垣",
        "level": "good" if breaking else "excellent",
        "description": "天府天相分守命宫三方四正，文武并济、权印双辉，主一生衣食丰足、地位崇高。古书云"府相朝垣千钟食禄"，常见于政界、企业管理者。",
        "palaces": [tianfu.get("name", ""), tianxiang.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·府相朝垣格》",
    })

def _detect_yang_liang_chang_lu(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if not all(s in sf_set for s in ("太阳", "天梁", "文昌", "禄存")):
        return
    sun = _find_palace_by_star(palaces, "太阳")
    liang = _find_palace_by_star(palaces, "天梁")
    if not sun or not liang:
        return
    required = ["太阳会命宫三方", "天梁会命宫三方", "文昌会命宫三方", "禄存会命宫三方"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _is_bright(sun, "太阳"):
        bonus.append("太阳庙旺")
    if _is_bright(liang, "天梁"):
        bonus.append("天梁庙旺")
    if _san_fang_si_hua_any(palaces, ming_branch, "科"):
        bonus.append("再会化科")
    if _is_dim(sun, "太阳"):
        breaking.append("太阳落陷（阳梁失辉）")
    if _san_fang_sha_count(palaces, ming_branch, SHA_HARD) >= 2:
        breaking.append("三方煞重")
    patterns.append({
        "name": "阳梁昌禄",
        "level": "good" if breaking else "excellent",
        "description": "太阳、天梁、文昌、禄存四星齐会命宫三方，号称"科举之星"，主清贵显达、考运极佳，宜走学术、文教、研究、专业认证之路，一生功名易就。",
        "palaces": [sun.get("name", ""), liang.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·阳梁昌禄格》",
    })

def _detect_huo_tan_ling_tan(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    tan = _find_palace_by_star(palaces, "贪狼")
    if not tan:
        return
    huo = _find_palace_by_star(palaces, "火星")
    ling = _find_palace_by_star(palaces, "铃星")
    tan_branch = _get_branch(tan)
    for sha_name, sha_palace in [("火星", huo), ("铃星", ling)]:
        if not sha_palace:
            continue
        sha_branch = _get_branch(sha_palace)
        same_or_trine = (
            tan_branch == sha_branch
            or (tan_branch + 4) % 12 == sha_branch
            or (tan_branch + 8) % 12 == sha_branch
            or (tan_branch + 6) % 12 == sha_branch
        )
        if not same_or_trine:
            continue
        if not _is_in_san_fang(palaces, ming_branch, tan_branch):
            continue
        required = [
            f"贪狼{'同宫' if tan_branch == sha_branch else '会照'}{sha_name}",
            "贪狼会照命宫三方",
        ]
        bonus: list[str] = []
        breaking: list[str] = []
        if _is_bright(tan, "贪狼"):
            bonus.append("贪狼庙旺")
        hua = _get_si_hua(tan, "贪狼")
        if hua in ("禄", "权"):
            bonus.append("贪狼化禄/化权")
        if _has_sha(tan, ["擎羊", "陀罗"]):
            breaking.append("贪狼宫又见羊陀（破横发之力）")
        if _has_sha(tan, SHA_KONG):
            breaking.append("贪狼遇空劫（财来财去）")
        patterns.append({
            "name": "火贪格" if sha_name == "火星" else "铃贪格",
            "level": "good" if breaking else "excellent",
            "description": (
                f"贪狼遇{sha_name}{'同宫' if tan_branch == sha_branch else '三方会照'}，"
                f"主突发横财、突如其来的机遇。古书云"贪狼遇火铃，必发横财"，但来得快去得也快，宜见好就收。"
                f"{'本盘破格条件已触发，发力打折。' if breaking else ''}"
            ),
            "palaces": [tan.get("name", ""), sha_palace.get("name", "")],
            "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
            "source": "《紫微斗数骨髓赋》",
        })

def _detect_wu_tan(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    wu = _find_palace_by_star(palaces, "武曲")
    tan = _find_palace_by_star(palaces, "贪狼")
    if not wu or not tan:
        return
    wu_branch = _get_branch(wu)
    tan_branch = _get_branch(tan)
    if wu_branch != tan_branch and (wu_branch + 6) % 12 != tan_branch:
        return
    if not _is_in_san_fang(palaces, ming_branch, wu_branch) and not _is_in_san_fang(palaces, ming_branch, tan_branch):
        return
    required = [
        "武曲贪狼同宫（丑/未）" if wu_branch == tan_branch else "武曲贪狼对宫拱照",
        "会照命宫三方",
    ]
    bonus: list[str] = []
    breaking: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "火星" in sf_set or "铃星" in sf_set:
        bonus.append("再遇火星/铃星（火贪/铃贪叠加）")
    if _get_si_hua(wu, "武曲") == "禄":
        bonus.append("武曲化禄")
    if _has_sha(wu, ["擎羊", "陀罗"]):
        breaking.append("武贪宫见羊陀")
    if _has_sha(wu, SHA_KONG):
        breaking.append("武贪宫遇空劫")
    patterns.append({
        "name": "武贪格",
        "level": "good" if breaking else "excellent",
        "description": "武曲贪狼会命，财星与桃花欲望星交辉，古书云"武贪不发少年人"——三十岁后方能厚积薄发。主中年以后大富大贵，财源由人脉、应酬、欲望管理而来，适合金融、投机、销售、娱乐业。",
        "palaces": [wu.get("name", ""), tan.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数骨髓赋》",
    })

def _detect_sha_po_lang(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    has = [s for s in ["七杀", "破军", "贪狼"] if s in sf_set]
    if len(has) < 3:
        return
    required = ["七杀、破军、贪狼三星齐入命宫三方四正"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _san_fang_si_hua_any(palaces, ming_branch, "禄") or _san_fang_si_hua_any(palaces, ming_branch, "权"):
        bonus.append("三方有化禄或化权（动得有力）")
    if "左辅" in sf_set and "右弼" in sf_set:
        bonus.append("辅弼同会（变动中得贵人）")
    if _san_fang_sha_count(palaces, ming_branch, SHA_HARD) >= 3:
        breaking.append("煞星过重（动而无成）")
    sf_palaces = _san_fang_palaces(palaces, ming_branch)
    patterns.append({
        "name": "杀破狼",
        "level": "caution" if breaking else "good",
        "description": "七杀、破军、贪狼三星会命，开创闯荡之命格。一生变动多、不甘平凡，宜创业、军警、业务、销售。中年后才能稳定守成，年轻时易因冲动失利。",
        "palaces": list({p.get("name", "") for p in sf_palaces if any(s in _major_names(p) for s in has)}),
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·杀破狼》",
    })

def _detect_ji_yue_tong_liang(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    has = [s for s in ["天机", "太阴", "天同", "天梁"] if s in sf_set]
    if len(has) < 4:
        return
    required = ["天机、太阴、天同、天梁四星齐入命宫三方四正"]
    bonus: list[str] = []
    breaking: list[str] = []
    if "文昌" in sf_set or "文曲" in sf_set:
        bonus.append("再会昌曲")
    if _san_fang_si_hua_any(palaces, ming_branch, "科"):
        bonus.append("再会化科")
    if _san_fang_sha_count(palaces, ming_branch, SHA_HARD) >= 3:
        breaking.append("煞星过多（机月同梁忌煞）")
    sf_palaces = _san_fang_palaces(palaces, ming_branch)
    patterns.append({
        "name": "机月同梁",
        "level": "good" if breaking else "excellent",
        "description": "天机太阴天同天梁四星齐入命迁财官，文质彬彬、聪慧善谋。最适合公职、学术、文艺、医疗、服务等需稳定累积的行业，不宜大冒险大投机。",
        "palaces": list({p.get("name", "") for p in sf_palaces if any(s in _major_names(p) for s in has)}),
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·机月同梁格》",
    })

def _detect_lian_xiang(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    lian = _find_palace_by_star(palaces, "廉贞")
    xiang = _find_palace_by_star(palaces, "天相")
    if not lian or not xiang or _get_branch(lian) != _get_branch(xiang):
        return
    in_ming = _get_branch(lian) == ming_branch
    required = ["廉贞天相同宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _has_star(lian, "禄存") or _get_si_hua(lian, "廉贞") == "禄":
        bonus.append("见禄存或廉贞化禄")
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "左辅" in sf_set:
        bonus.append("左辅会照")
    if _has_sha(lian, ["擎羊"]):
        breaking.append("廉相宫坐擎羊（廉杀羊倾向）")
    if _get_si_hua(lian, "廉贞") == "忌":
        breaking.append("廉贞化忌")
    level_: str
    if breaking:
        level_ = "caution"
    elif in_ming:
        level_ = "good"
    else:
        level_ = "neutral"
    patterns.append({
        "name": "廉贞天相格",
        "level": level_,
        "description": "廉贞天相同宫，印绶格局，主秉公处事、清廉之名，宜任公职、行政管理、法务、企划。怕见擎羊化忌，则反主官非。",
        "palaces": [lian.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书》",
    })

def _detect_wu_qi_sha(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    wu = _find_palace_by_star(palaces, "武曲")
    qi = _find_palace_by_star(palaces, "七杀")
    if not wu or not qi or _get_branch(wu) != _get_branch(qi):
        return
    in_ming = _get_branch(wu) == ming_branch
    required = ["武曲七杀同宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _get_si_hua(wu, "武曲") == "权":
        bonus.append("武曲化权")
    if _get_si_hua(wu, "武曲") == "禄":
        bonus.append("武曲化禄")
    if _get_si_hua(wu, "武曲") == "忌":
        breaking.append("武曲化忌（武曲化忌为财劫之兆）")
    if _has_sha(wu, ["擎羊", "陀罗", "火星", "铃星"]):
        breaking.append("武杀宫煞星过多")
    patterns.append({
        "name": "武曲七杀",
        "level": "caution" if breaking else ("excellent" if in_ming else "good"),
        "description": "武曲七杀同宫，将星配财星，主果决刚毅、理财能力强，适合金融、军警、创业。但忌见化忌煞星，否则凶险。一生奋斗、积财但操心。",
        "palaces": [wu.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书》",
    })

def _detect_tong_liang(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    tong = _find_palace_by_star(palaces, "天同")
    liang = _find_palace_by_star(palaces, "天梁")
    if not tong or not liang or _get_branch(tong) != _get_branch(liang):
        return
    required = ["天同天梁同宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "文昌" in sf_set:
        bonus.append("文昌会照")
    if _get_si_hua(tong, "天同") == "禄":
        bonus.append("天同化禄")
    if _has_sha(tong, SHA_HARD):
        breaking.append("煞星同坐")
    patterns.append({
        "name": "天同天梁格",
        "level": "neutral" if breaking else "good",
        "description": "天同天梁同宫，福星与荫星共会，主宽厚和善、乐于助人，宜医疗、教育、宗教、社会公益。但偏温和保守，难成大富大贵之局。",
        "palaces": [tong.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书》",
    })

def _detect_ri_yue_tong_gong(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sun = _find_palace_by_star(palaces, "太阳")
    moon = _find_palace_by_star(palaces, "太阴")
    if not sun or not moon or _get_branch(sun) != _get_branch(moon):
        return
    branch = _get_branch(sun)
    if branch not in (1, 7):
        return
    in_ming = branch == ming_branch
    required = [f"太阳太阴同入{BRANCH_NAMES[branch]}宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if branch == 7:
        bonus.append("未宫日月同辉（古书云未宫日月双美）")
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "文昌" in sf_set and "文曲" in sf_set:
        bonus.append("昌曲会照")
    if _has_sha(sun, SHA_HARD):
        breaking.append("日月宫煞星同坐")
    patterns.append({
        "name": "日月同宫",
        "level": "good" if breaking else ("excellent" if in_ming else "good"),
        "description": (
            f"太阳太阴于{BRANCH_NAMES[branch]}宫同宫，阴阳平衡，文武兼备。"
            f"主异性缘佳、事业顺遂、名声远播。"
            f"{'未宫日月双美尤佳。' if branch == 7 else '丑宫日月同宫力量较平。'}"
        ),
        "palaces": [sun.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书》",
    })

def _detect_ri_yue_jia_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    jia = _jia_palaces(palaces, ming_branch)
    prev, next_ = jia.get("prev"), jia.get("next")
    if not prev or not next_:
        return
    p_sun = _has_star(prev, "太阳")
    p_moon = _has_star(prev, "太阴")
    n_sun = _has_star(next_, "太阳")
    n_moon = _has_star(next_, "太阴")
    if not ((p_sun and n_moon) or (p_moon and n_sun)):
        return
    sun_p = prev if p_sun else next_
    moon_p = prev if p_moon else next_
    required = ["太阳太阴分居命宫前后两宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _is_bright(sun_p, "太阳"):
        bonus.append("太阳庙旺")
    if _is_bright(moon_p, "太阴"):
        bonus.append("太阴庙旺")
    if _is_dim(sun_p, "太阳") or _is_dim(moon_p, "太阴"):
        breaking.append("日月落陷（夹命无光）")
    patterns.append({
        "name": "日月夹命",
        "level": "good" if breaking else "excellent",
        "description": "太阳太阴分居命宫两侧夹照，光明磊落，一生贵人相助，事业蓬勃。男主官贵，女主旺夫兴家。日月须不落陷方为真夹。",
        "palaces": [sun_p.get("name", ""), moon_p.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·日月夹命》",
    })

def _detect_ju_ri_tong_gong(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    ju = _find_palace_by_star(palaces, "巨门")
    sun = _find_palace_by_star(palaces, "太阳")
    if not ju or not sun or _get_branch(ju) != _get_branch(sun):
        return
    branch = _get_branch(ju)
    if branch not in (2, 8):
        return
    in_ming = branch == ming_branch
    required = [f"巨门太阳同入{BRANCH_NAMES[branch]}宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if branch == 2:
        bonus.append("寅宫太阳庙旺，巨门得日光化解是非")
    if _get_si_hua(ju, "巨门") in ("禄", "权"):
        bonus.append("巨门化禄/化权（口才生财）")
    if _get_si_hua(ju, "巨门") == "忌":
        breaking.append("巨门化忌（口舌官非）")
    if branch == 8:
        breaking.append("申宫太阳偏西，巨门暗曜更显")
    level_: str
    if breaking:
        level_ = "caution"
    elif in_ming and branch == 2:
        level_ = "excellent"
    else:
        level_ = "good"
    patterns.append({
        "name": "巨日同宫",
        "level": level_,
        "description": f"巨门太阳同{BRANCH_NAMES[branch]}宫，太阳化解巨门暗曜，主以口才、传媒、外语、专业立业。寅宫为佳，申宫力减。怕巨门化忌则官非。",
        "palaces": [ju.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书·巨日同宫》",
    })

def _detect_shi_zhong_yin_yu(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    if not _has_star(ming, "巨门"):
        return
    if ming_branch not in (0, 6):
        return
    required = [f"巨门入命于{BRANCH_NAMES[ming_branch]}宫"]
    bonus: list[str] = []
    breaking: list[str] = []
    if _get_si_hua(ming, "巨门") in ("禄", "权"):
        bonus.append("巨门化禄/化权")
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "文昌" in sf_set:
        bonus.append("文昌会照（石中隐玉得明）")
    if _get_si_hua(ming, "巨门") == "忌":
        breaking.append("巨门化忌（玉藏深泥）")
    if _has_sha(ming, SHA_HARD):
        breaking.append("命坐煞星")
    patterns.append({
        "name": "石中隐玉",
        "level": "caution" if breaking else "excellent",
        "description": "巨门坐命子午，外表平凡而内蕴才学。早年默默无闻、中年方显贵气，宜走专业、研究、口才、传媒。需有禄权或文昌相助方能"凿石见玉"。",
        "palaces": ["命宫"],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数骨髓赋·石中隐玉》",
    })

def _detect_ming_zhu_chu_hai(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    if ming_branch != 7:
        return
    if len(_major_names(ming)) > 0:
        return
    dui = _dui_gong(palaces, ming_branch)
    if not dui or not _has_star(dui, "太阳") or not _has_star(dui, "太阴"):
        return
    required = ["命宫在未为空宫", "对宫丑宫为太阳太阴同度"]
    bonus: list[str] = []
    breaking: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "文昌" in sf_set or "文曲" in sf_set:
        bonus.append("再会昌曲")
    if "左辅" in sf_set or "右弼" in sf_set:
        bonus.append("辅弼相助")
    if _san_fang_sha_count(palaces, ming_branch, SHA_HARD) >= 2:
        breaking.append("煞星会照（珠光黯淡）")
    patterns.append({
        "name": "明珠出海",
        "level": "good" if breaking else "excellent",
        "description": "命未空宫，对宫丑宫日月同辉拱照，号"明珠出海"。主出生平凡、后天努力出头，宜远赴他乡、学术研究或大公司高位，主大富大贵。",
        "palaces": ["命宫", dui.get("name", "")],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全集·明珠出海》",
    })

def _detect_zi_wei_in_ming(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    if not _has_star(ming, "紫微") or _has_star(ming, "天府"):
        return
    required = ["紫微独坐命宫（无天府同坐）"]
    bonus: list[str] = []
    breaking: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "左辅" in sf_set and "右弼" in sf_set:
        bonus.append("左辅右弼同会")
    if "文昌" in sf_set and "文曲" in sf_set:
        bonus.append("文昌文曲同会")
    if "左辅" not in sf_set and "右弼" not in sf_set:
        breaking.append("无辅弼（孤君无臣）")
    if _has_sha(ming, SHA_KONG):
        breaking.append("紫微遇空劫（古书最忌）")
    level_: str
    if breaking:
        level_ = "caution"
    elif bonus:
        level_ = "excellent"
    else:
        level_ = "good"
    patterns.append({
        "name": "紫微入命",
        "level": level_,
        "description": "紫微独坐命宫，帝王之星，自尊心强、有领导魅力。但紫微最忌"在野孤君"——若无左右辅弼相会，反成孤高自傲、易招毁谤。",
        "palaces": ["命宫"],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数全书》",
    })

def _detect_fu_bi_jia_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    jia = _jia_palaces(palaces, ming_branch)
    prev, next_ = jia.get("prev"), jia.get("next")
    if not prev or not next_:
        return
    if not ((_has_star(prev, "左辅") and _has_star(next_, "右弼"))
            or (_has_star(prev, "右弼") and _has_star(next_, "左辅"))):
        return
    required = ["左辅右弼分居命宫前后两宫"]
    bonus: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "天魁" in sf_set or "天钺" in sf_set:
        bonus.append("再会魁钺")
    patterns.append({
        "name": "辅弼夹命",
        "level": "excellent",
        "description": "左辅右弼夹命，一生贵人不断、逢凶化吉。适合走仕途、大企业管理，有贵人提携之命。古书云"左辅右弼，终身福厚"。",
        "palaces": ["命宫", prev.get("name", ""), next_.get("name", "")],
        "conditions": {"required": required, "bonus": bonus},
        "source": "《紫微斗数全书·辅弼夹命》",
    })

def _detect_chang_qu_jia_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    jia = _jia_palaces(palaces, ming_branch)
    prev, next_ = jia.get("prev"), jia.get("next")
    if not prev or not next_:
        return
    if not ((_has_star(prev, "文昌") and _has_star(next_, "文曲"))
            or (_has_star(prev, "文曲") and _has_star(next_, "文昌"))):
        return
    patterns.append({
        "name": "昌曲夹命",
        "level": "excellent",
        "description": "文昌文曲夹命宫，主聪明俊秀、文采斐然，宜走文教、学术、艺术、写作。古书云"昌曲夹命主科甲"，最利考运。",
        "palaces": ["命宫", prev.get("name", ""), next_.get("name", "")],
        "conditions": {"required": ["文昌文曲分居命宫前后两宫"]},
        "source": "《紫微斗数全书》",
    })

def _detect_kui_yue_jia_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    jia = _jia_palaces(palaces, ming_branch)
    prev, next_ = jia.get("prev"), jia.get("next")
    if not prev or not next_:
        return
    if not ((_has_star(prev, "天魁") and _has_star(next_, "天钺"))
            or (_has_star(prev, "天钺") and _has_star(next_, "天魁"))):
        return
    patterns.append({
        "name": "魁钺夹命",
        "level": "good",
        "description": "天魁天钺夹命，男称天乙、女称玉堂，一生贵人提携。考试、求职、关键时刻常有意外贵人相助。",
        "palaces": ["命宫", prev.get("name", ""), next_.get("name", "")],
        "conditions": {"required": ["天魁天钺分居命宫前后两宫"]},
        "source": "《紫微斗数全书》",
    })

def _detect_shuang_lu_chao_yuan(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    sf = _san_fang_palaces(palaces, ming_branch)
    hua_lu = any(_san_fang_si_hua_any(palaces, ming_branch, "禄"))
    lu_cun = any(_has_star(p, "禄存") for p in sf)
    if not hua_lu or not lu_cun:
        return
    breaking: list[str] = []
    if _has_sha(ming, SHA_KONG):
        breaking.append("命坐空劫（双禄遇空，财来财去）")
    patterns.append({
        "name": "双禄朝垣",
        "level": "excellent",
        "description": "化禄、禄存同会命宫三方四正，财源涌动、衣食丰足。古书云"双禄朝垣，富比陶朱"，主一生不愁财，多有正财横财兼得。",
        "palaces": [p.get("name", "") for p in sf],
        "conditions": {
            "required": ["化禄会照三方四正", "禄存会照三方四正"],
            "breaking": breaking or None,
        },
        "source": "《紫微斗数全书·双禄朝垣》",
    })

def _detect_san_qi_jia_hui(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf = _san_fang_palaces(palaces, ming_branch)
    lu = quan = ke = False
    for p in sf:
        for s in p.get("majorStars", []):
            mut = s.get("mutagen")
            if mut == "禄":
                lu = True
            elif mut == "权":
                quan = True
            elif mut == "科":
                ke = True
    if not (lu and quan and ke):
        return
    patterns.append({
        "name": "三奇加会",
        "level": "excellent",
        "description": "化禄、化权、化科三吉化齐会命宫三方四正，号称"三奇加会"。主一生功名、财富、贵人三全，是紫微斗数最高吉格之一。",
        "palaces": [p.get("name", "") for p in sf],
        "conditions": {"required": ["化禄、化权、化科三吉化齐会命宫三方四正"]},
        "source": "《紫微斗数全书·三奇加会》",
    })

def _detect_hua_lu_ru_ming(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    for s in ming.get("majorStars", []):
        if s.get("mutagen") == "禄" and s.get("type") == "major":
            name = s.get("name", "")
            extra = ""
            if name == "武曲":
                extra = "武曲化禄属正财，宜实业、金融。"
            elif name == "太阴":
                extra = "太阴化禄属阴财、不动产。"
            elif name == "贪狼":
                extra = "贪狼化禄属人脉财、桃花财。"
            patterns.append({
                "name": f"{name}化禄入命",
                "level": "good",
                "description": f"{name}化禄坐命，主生财顺利、人缘佳、机缘多。{extra}",
                "palaces": ["命宫"],
                "conditions": {"required": [f"{name}化禄坐命宫"]},
                "source": "《紫微斗数全书》",
            })
            return


def _detect_hua_ji_ru_ming_qian(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    qian_branch = (ming_branch + 6) % 12
    for p in palaces:
        branch = _get_branch(p)
        if branch not in (ming_branch, qian_branch):
            continue
        for s in p.get("majorStars", []):
            if s.get("mutagen") == "忌" and s.get("type") == "major":
                in_ming = branch == ming_branch
                patterns.append({
                    "name": f"{s['name']}化忌入{'命' if in_ming else '迁'}",
                    "level": "caution",
                    "description": (
                        f"{s['name']}化忌坐命宫，需留意自身固执、心理障碍或健康隐患，凡事退一步思考。化忌不一定坏，代表此星能量需要特别关注。"
                        if in_ming else
                        f"{s['name']}化忌坐迁移宫，外出、远行、人际关系易有波折，宜守不宜动。"
                    ),
                    "palaces": [p.get("name", "")],
                    "conditions": {"required": [f"{s['name']}化忌坐{'命' if in_ming else '迁'}宫"]},
                    "source": "《紫微斗数全书》",
                })

def _detect_yang_tuo_jia_ji(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    for p in palaces:
        if _get_branch(p) != ming_branch:
            continue
        if not any(s.get("mutagen") == "忌" for s in p.get("majorStars", [])):
            continue
        jia = _jia_palaces(palaces, ming_branch)
        prev, next_ = jia.get("prev"), jia.get("next")
        if not prev or not next_:
            continue
        if not ((_has_star(prev, "擎羊") and _has_star(next_, "陀罗"))
                or (_has_star(prev, "陀罗") and _has_star(next_, "擎羊"))):
            continue
        patterns.append({
            "name": "羊陀夹忌",
            "level": "caution",
            "description": "化忌坐命，左右擎羊陀罗夹命，古书云"羊陀夹忌为败局"，主一生劳碌奔波、坎坷不顺、身心俱疲。需以德行修养与积极做事化解，凡事谨慎为上。",
            "palaces": ["命宫", prev.get("name", ""), next_.get("name", "")],
            "conditions": {"required": ["化忌坐命", "擎羊陀罗分居命宫前后两宫"]},
            "source": "《紫微斗数骨髓赋·羊陀夹忌》",
        })
        return

def _detect_huo_ling_jia_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    jia = _jia_palaces(palaces, ming_branch)
    prev, next_ = jia.get("prev"), jia.get("next")
    if not prev or not next_:
        return
    if not ((_has_star(prev, "火星") and _has_star(next_, "铃星"))
            or (_has_star(prev, "铃星") and _has_star(next_, "火星"))):
        return
    patterns.append({
        "name": "火铃夹命",
        "level": "caution",
        "description": "火星铃星分居命宫前后两宫夹命，主性急、易冲动、突发意外或纠纷。需培养耐性、避免冲动决策。",
        "palaces": ["命宫", prev.get("name", ""), next_.get("name", "")],
        "conditions": {"required": ["火星铃星分居命宫前后两宫"]},
        "source": "《紫微斗数全书》",
    })

def _detect_kong_jie_jia_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    jia = _jia_palaces(palaces, ming_branch)
    prev, next_ = jia.get("prev"), jia.get("next")
    if not prev or not next_:
        return
    if not ((_has_star(prev, "地空") and _has_star(next_, "地劫"))
            or (_has_star(prev, "地劫") and _has_star(next_, "地空"))):
        return
    patterns.append({
        "name": "空劫夹命",
        "level": "caution",
        "description": "地空地劫夹命，主财来财去、思想脱俗、易遁入宗教哲学。古书云"空劫夹命，财不聚"。宜技艺、宗教、研究等不重物质之业。",
        "palaces": ["命宫", prev.get("name", ""), next_.get("name", "")],
        "conditions": {"required": ["地空地劫分居命宫前后两宫"]},
        "source": "《紫微斗数全书》",
    })

def _detect_lian_sha_yang(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if not all(s in sf_set for s in ("廉贞", "七杀", "擎羊")):
        return
    patterns.append({
        "name": "廉杀羊",
        "level": "caution",
        "description": "廉贞、七杀、擎羊三星会照命宫三方，古书警示之凶格。主血光、官非、意外。本命有此格不必惊慌，但流年大限再触发时需特别谨慎驾驶、避免冲突、注意手术风险。",
        "palaces": ["命宫"],
        "conditions": {"required": ["廉贞、七杀、擎羊三星会照三方四正"]},
        "source": "《紫微斗数全书·廉杀羊》",
    })

def _detect_ju_huo_yang(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if not all(s in sf_set for s in ("巨门", "火星", "擎羊")):
        return
    patterns.append({
        "name": "巨火羊",
        "level": "caution",
        "description": "巨门、火星、擎羊三星会照，古书云"巨火羊，终身缢死"——古时凶格。现代理解为：易因口舌、激烈冲突而招大祸。需修身养性、慎言慎行，避免极端情绪。",
        "palaces": ["命宫"],
        "conditions": {"required": ["巨门、火星、擎羊三星会照三方四正"]},
        "source": "《紫微斗数骨髓赋·巨火羊》",
    })

def _detect_ling_chang_tuo_wu(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if not all(s in sf_set for s in ("铃星", "文昌", "陀罗", "武曲")):
        return
    patterns.append({
        "name": "铃昌陀武",
        "level": "caution",
        "description": "铃星、文昌、陀罗、武曲四星齐会，古书云"铃昌陀武，限至投河"——古时大凶格。本命有此组合本身不必恐慌，但流年大限触发时需高度警觉重大决策、情绪起伏、水边活动。",
        "palaces": ["命宫"],
        "conditions": {"required": ["铃星、文昌、陀罗、武曲四星会照三方四正"]},
        "source": "《紫微斗数骨髓赋·铃昌陀武》",
    })

def _detect_ma_tou_dai_jian(palaces: list[dict], ming: dict, ming_branch: int, patterns: list[dict]) -> None:
    if ming_branch != 6 or not _has_star(ming, "擎羊"):
        return
    required = ["擎羊于午宫坐命"]
    bonus: list[str] = []
    breaking: list[str] = []
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "七杀" in sf_set or "破军" in sf_set:
        bonus.append("再会七杀或破军（武职大贵）")
    if "天魁" in sf_set or "天钺" in sf_set:
        bonus.append("魁钺加照")
    patterns.append({
        "name": "马头带箭",
        "level": "good" if bonus else "caution",
        "description": "擎羊于午宫坐命，号"马头带箭"。古书云"威镇边疆"——主刚毅果决、有冲杀之力，宜军警武职、运动员、外科医师。但同时主危险与意外，需配合杀破狼或贵人方为大格，否则反主血光。",
        "palaces": ["命宫"],
        "conditions": {"required": required, "bonus": bonus, "breaking": breaking},
        "source": "《紫微斗数骨髓赋·马头带箭》",
    })

def _detect_lu_cun_shou_shen(palaces: list[dict], ming_branch: int, shen_branch: int, patterns: list[dict]) -> None:
    lu_cun_p = _find_palace_by_star(palaces, "禄存")
    if not lu_cun_p:
        return
    lb = _get_branch(lu_cun_p)
    in_ming = lb == ming_branch
    in_shen = lb == shen_branch
    if not in_ming and not in_shen:
        return
    patterns.append({
        "name": "禄存守命" if in_ming else "禄存守身",
        "level": "good",
        "description": (
            "禄存坐命，主一生衣食无忧、财禄稳定。性格保守，善积累，但羊陀夹禄须防小人。最宜配化禄、左辅右弼方为大格。"
            if in_ming else
            "禄存入身宫，主中年后财源稳定、得禄自享。倪师说「禄存入身，财气近身」——配偶或事业方向能带来稳定财禄。"
        ),
        "palaces": ["命宫" if in_ming else "身宫"],
        "conditions": {"required": ["禄存入命宫" if in_ming else "禄存入身宫"]},
        "source": "《紫微斗数全书·禄存星》",
    })

def _detect_tian_ma_ru_ming(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    tian_ma_p = _find_palace_by_star(palaces, "天马")
    if not tian_ma_p:
        return
    tb = _get_branch(tian_ma_p)
    in_ming = tb == ming_branch
    in_qian = tb == (ming_branch + 6) % 12
    if not in_ming and not in_qian:
        return
    patterns.append({
        "name": "天马入命" if in_ming else "天马在迁",
        "level": "neutral",
        "description": (
            "天马坐命，主一生奔波、动中得财，宜走商旅、外勤、跨界发展。倪师说「天马入命，无禄不发」——若再会禄存或化禄即「禄马交驰」之富格。"
            if in_ming else
            "天马在迁移宫，主外出有利、远行得财，宜异乡发展。配化禄主异地生财，配煞星则旅途多波折。"
        ),
        "palaces": [tian_ma_p.get("name", "")],
        "conditions": {"required": ["天马入命宫" if in_ming else "天马入迁移宫"]},
        "source": "《紫微斗数全书·天马星》",
    })

def _detect_hua_lu_ru_cai(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    cai = next((p for p in palaces if p.get("name") in ("财帛", "财帛宫")), None)
    if not cai:
        return
    for s in cai.get("majorStars", []):
        if s.get("type") == "major" and s.get("mutagen") == "禄":
            patterns.append({
                "name": "化禄入财",
                "level": "good",
                "description": f"{s['name']}化禄入财帛宫，主财源畅通、收入稳定。倪师讲化禄是「正财」象征——这个化禄星所代表的能力（{s['name']}的核心特质）是你赚钱的主轴。配禄存或天马则财源更广。",
                "palaces": ["财帛"],
                "conditions": {"required": [f"{s['name']}化禄入财帛宫"]},
                "source": "《紫微斗数全书·四化论》",
            })
            return

def _detect_hua_quan_ru_guan(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    guan = next((p for p in palaces if p.get("name") in ("官禄", "官禄宫")), None)
    if not guan:
        return
    for s in guan.get("majorStars", []):
        if s.get("type") == "major" and s.get("mutagen") == "权":
            patterns.append({
                "name": "化权入官",
                "level": "good",
                "description": f"{s['name']}化权入官禄宫，主事业有掌控力、能担当独当一面的职位。化权代表权力与执行力——{s['name']}化权说明你在事业上能成为决策者或核心执行者，宜走管理或技术权威路线。",
                "palaces": ["官禄"],
                "conditions": {"required": [f"{s['name']}化权入官禄宫"]},
                "source": "《紫微斗数全书·四化论》",
            })
            return

def _detect_hua_ke_ru_ming_shen(palaces: list[dict], ming_branch: int, shen_branch: int, patterns: list[dict]) -> None:
    ming = _get_palace_by_branch(palaces, ming_branch)
    shen = _get_palace_by_branch(palaces, shen_branch)
    for p in (ming, shen):
        if not p:
            continue
        for s in p.get("majorStars", []):
            if s.get("type") == "major" and s.get("mutagen") == "科":
                is_ming = _get_branch(p) == ming_branch
                patterns.append({
                    "name": "化科入命" if is_ming else "化科入身",
                    "level": "good",
                    "description": f"{s['name']}化科入{'命' if is_ming else '身'}宫，主名声、文书、学术运。倪师讲化科是「贵人星」——{s['name']}化科带来的是被人看重的特质，宜从事文书、教育、研究、咨询、文创等"以名取利"的方向。",
                    "palaces": ["命宫" if is_ming else "身宫"],
                    "conditions": {"required": [f"{s['name']}化科入{'命' if is_ming else '身'}宫"]},
                    "source": "《紫微斗数全书·四化论》",
                })
                return

def _detect_ji_yue_tong_liang_partial(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    has = [s for s in ["天机", "太阴", "天同", "天梁"] if s in sf_set]
    if len(has) != 3:
        return
    missing = [s for s in ["天机", "太阴", "天同", "天梁"] if s not in sf_set]
    sf_palaces = _san_fang_palaces(palaces, ming_branch)
    patterns.append({
        "name": "机月同梁三星会",
        "level": "neutral",
        "description": (
            f"三方四正会齐{'、'.join(has)}，差{'、'.join(missing)}未会。"
            f"机月同梁不全格，文质带谋，但稳定度不如四星齐。仍宜公职、教研、医疗、服务等需要积累与稳定的行业，关键看缺位星与四化的配合。"
        ),
        "palaces": list({p.get("name", "") for p in sf_palaces if any(s in _major_names(p) for s in has)}),
        "conditions": {"required": [f"三方四正会{'、'.join(has)}（机月同梁缺{'、'.join(missing)}）"]},
        "source": "《紫微斗数全书·机月同梁格》（降级版）",
    })

def _detect_chang_qu_tong_hui(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "文昌" not in sf_set or "文曲" not in sf_set:
        return
    ming = next((p for p in palaces if _get_branch(p) == ming_branch), None)
    if not ming:
        return
    in_ming = _has_star(ming, "文昌") and _has_star(ming, "文曲")
    patterns.append({
        "name": "昌曲坐命" if in_ming else "昌曲同会",
        "level": "good",
        "description": (
            "文昌文曲同入命宫，主聪明俊秀、文采斐然，宜文学、教育、写作、咨询。最忌化忌——昌曲化忌主文书契约暗亏。"
            if in_ming else
            "文昌文曲同会三方四正，主才华横溢、口才文笔俱佳。宜走需要表达与文采的行业，化科加持则名声大显。"
        ),
        "palaces": ["命宫"],
        "conditions": {"required": ["文昌、文曲同会命宫三方四正"]},
        "source": "《紫微斗数全书·文星论》",
    })

def _detect_fu_bi_tong_hui(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "左辅" not in sf_set or "右弼" not in sf_set:
        return
    patterns.append({
        "name": "辅弼同会",
        "level": "good",
        "description": "左辅右弼同会命宫三方四正，主一生贵人不绝、人缘极佳。最宜领导岗位与团队合作型工作。倪师说「辅弼夹命，平生贵人多」——你不是单打独斗的命，要善用人际网络。",
        "palaces": ["命宫"],
        "conditions": {"required": ["左辅、右弼同会命宫三方四正"]},
        "source": "《紫微斗数全书·辅弼论》",
    })

def _detect_kui_yue_tong_hui(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf_set = _san_fang_all_stars(palaces, ming_branch)
    if "天魁" not in sf_set or "天钺" not in sf_set:
        return
    patterns.append({
        "name": "魁钺同会",
        "level": "good",
        "description": "天魁天钺同会命宫三方四正，主"天乙贵人"加持，关键时刻总有贵人提携。倪师说「魁钺夹命，必为贵人」——遇到困难时身边会出现得力相助者，宜主动维护人脉。",
        "palaces": ["命宫"],
        "conditions": {"required": ["天魁、天钺同会命宫三方四正"]},
        "source": "《紫微斗数全书·魁钺论》",
    })

def _detect_ke_quan_shuang_hui(palaces: list[dict], ming_branch: int, patterns: list[dict]) -> None:
    sf = _san_fang_palaces(palaces, ming_branch)
    has_ke = has_quan = False
    for p in sf:
        for s in p.get("majorStars", []):
            if s.get("type") == "major":
                if s.get("mutagen") == "科":
                    has_ke = True
                elif s.get("mutagen") == "权":
                    has_quan = True
    if not has_ke or not has_quan:
        return
    patterns.append({
        "name": "科权双会",
        "level": "good",
        "description": "化科 + 化权 同会三方四正，主名权双美——既有学识/名声（科），又有掌控力（权），宜走"专业权威"路线（如医生、律师、教授、技术骨干），名利双收且根基扎实。",
        "palaces": ["命宫"],
        "conditions": {"required": ["化科、化权同会命宫三方四正"]},
        "source": "《紫微斗数全书·四化会照》",
    })


# ── Main Entry ──

def detect_patterns(astrolabe: dict) -> list[dict]:
    """Run all ZWDS pattern detectors on astrolabe data.

    Args:
        astrolabe: Python dict from ZiweiService (contains palaces list,
                   earthlyBranchOfSoulPalace, earthlyBranchOfBodyPalace)

    Returns:
        List of detected pattern dicts, each with:
          name, level, description, palaces, conditions, source
    """
    patterns: list[dict] = []
    palaces: list[dict] = astrolabe.get("palaces") or []

    # Get Ming Gong (命宫) branch
    ming_branch_name = astrolabe.get("earthlyBranchOfSoulPalace", "")
    if isinstance(ming_branch_name, int):
        ming_branch = ming_branch_name % 12
    else:
        ming_branch = BRANCH_INDEX.get(str(ming_branch_name), 0)

    # Get Shen Gong (身宫) branch
    shen_branch_name = astrolabe.get("earthlyBranchOfBodyPalace", "")
    if isinstance(shen_branch_name, int):
        shen_branch = shen_branch_name % 12
    else:
        shen_branch = BRANCH_INDEX.get(str(shen_branch_name), 0)

    ming = _get_palace_by_branch(palaces, ming_branch)
    if not ming:
        return patterns

    # 上格
    _detect_jun_chen_qing_hui(palaces, ming, ming_branch, patterns)
    _detect_zi_fu(palaces, ming, ming_branch, patterns)
    _detect_fu_xiang_chao_yuan(palaces, ming, ming_branch, patterns)
    _detect_yang_liang_chang_lu(palaces, ming_branch, patterns)
    _detect_huo_tan_ling_tan(palaces, ming_branch, patterns)
    _detect_wu_tan(palaces, ming_branch, patterns)
    _detect_sha_po_lang(palaces, ming_branch, patterns)
    _detect_ji_yue_tong_liang(palaces, ming_branch, patterns)

    # 中格
    _detect_lian_xiang(palaces, ming_branch, patterns)
    _detect_wu_qi_sha(palaces, ming_branch, patterns)
    _detect_tong_liang(palaces, ming_branch, patterns)
    _detect_ri_yue_tong_gong(palaces, ming_branch, patterns)
    _detect_ri_yue_jia_ming(palaces, ming_branch, patterns)
    _detect_ju_ri_tong_gong(palaces, ming_branch, patterns)
    _detect_shi_zhong_yin_yu(palaces, ming, ming_branch, patterns)
    _detect_ming_zhu_chu_hai(palaces, ming, ming_branch, patterns)
    _detect_zi_wei_in_ming(palaces, ming, ming_branch, patterns)

    # 助力格
    _detect_fu_bi_jia_ming(palaces, ming_branch, patterns)
    _detect_chang_qu_jia_ming(palaces, ming_branch, patterns)
    _detect_kui_yue_jia_ming(palaces, ming_branch, patterns)
    _detect_shuang_lu_chao_yuan(palaces, ming, ming_branch, patterns)
    _detect_san_qi_jia_hui(palaces, ming_branch, patterns)
    _detect_hua_lu_ru_ming(palaces, ming, ming_branch, patterns)

    # 恶格
    _detect_hua_ji_ru_ming_qian(palaces, ming_branch, patterns)
    _detect_yang_tuo_jia_ji(palaces, ming_branch, patterns)
    _detect_huo_ling_jia_ming(palaces, ming_branch, patterns)
    _detect_kong_jie_jia_ming(palaces, ming_branch, patterns)
    _detect_lian_sha_yang(palaces, ming_branch, patterns)
    _detect_ju_huo_yang(palaces, ming_branch, patterns)
    _detect_ling_chang_tuo_wu(palaces, ming_branch, patterns)
    _detect_ma_tou_dai_jian(palaces, ming, ming_branch, patterns)

    # 基础格局
    _detect_lu_cun_shou_shen(palaces, ming_branch, shen_branch, patterns)
    _detect_tian_ma_ru_ming(palaces, ming_branch, patterns)
    _detect_hua_lu_ru_cai(palaces, ming_branch, patterns)
    _detect_hua_quan_ru_guan(palaces, ming_branch, patterns)
    _detect_hua_ke_ru_ming_shen(palaces, ming_branch, shen_branch, patterns)
    _detect_ji_yue_tong_liang_partial(palaces, ming_branch, patterns)
    _detect_chang_qu_tong_hui(palaces, ming_branch, patterns)
    _detect_fu_bi_tong_hui(palaces, ming_branch, patterns)
    _detect_kui_yue_tong_hui(palaces, ming_branch, patterns)
    _detect_ke_quan_shuang_hui(palaces, ming_branch, patterns)

    return patterns


def get_ming_gong_summary(astrolabe: dict) -> dict:
    """Get a simple summary of the Ming Gong (命宫)."""
    palaces: list[dict] = astrolabe.get("palaces") or []
    ming_branch_name = astrolabe.get("earthlyBranchOfSoulPalace", "")
    if isinstance(ming_branch_name, int):
        ming_branch = ming_branch_name % 12
    else:
        ming_branch = BRANCH_INDEX.get(str(ming_branch_name), 0)
    ming = _get_palace_by_branch(palaces, ming_branch)
    if not ming:
        return {"stars": [], "keywords": [], "nature": ""}

    major_stars = [s["name"] for s in ming.get("majorStars", []) if s.get("name") and s.get("type") == "major"]
    star_names = major_stars

    keyword_map: dict[str, list[str]] = {
        "紫微": ["尊贵", "独立", "领导"],
        "天机": ["智慧", "机变", "善谋"],
        "太阳": ["阳刚", "官贵", "慷慨"],
        "武曲": ["财富", "刚毅", "果断"],
        "天同": ["温和", "享福", "随缘"],
        "廉贞": ["才艺", "桃花", "多变"],
        "天府": ["财库", "稳重", "保守"],
        "太阴": ["柔美", "财富", "细腻"],
        "贪狼": ["欲望", "桃花", "多才"],
        "巨门": ["善辩", "多思", "口才"],
        "天相": ["辅佐", "行政", "稳健"],
        "天梁": ["荫护", "医药", "长辈"],
        "七杀": ["将星", "果决", "孤克"],
        "破军": ["开创", "变动", "破旧"],
    }
    nature_map: dict[str, str] = {
        "紫微": "帝王星", "天机": "智慧星", "太阳": "贵人星",
        "武曲": "财帛星", "天同": "福德星", "廉贞": "桃花星",
        "天府": "财库星", "太阴": "财富星", "贪狼": "桃花星",
        "巨门": "是非星", "天相": "印绶星", "天梁": "荫庇星",
        "七杀": "将帅星", "破军": "变动星",
    }

    keywords: list[str] = []
    for n in star_names:
        keywords.extend(keyword_map.get(n, []))
    keywords = keywords[:5]
    nature = nature_map.get(star_names[0], "") if star_names else "空宫"

    return {"stars": star_names, "keywords": keywords, "nature": nature}
