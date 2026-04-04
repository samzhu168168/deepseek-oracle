"""
测试 Nǎi Nai Prompt 的效果
"""
import json
from app.prompts.naonai_system_prompt import (
    NAONAI_SYSTEM_PROMPT,
    NAONAI_TEASER_PROMPT,
    NAONAI_FULL_PROMPT,
)

# 模拟的命盘数据
sample_data = {
    "person_a": {
        "element": "火",
        "day_master": "丙火",
        "year_branch": "午",
    },
    "person_b": {
        "element": "水",
        "day_master": "壬水",
        "year_branch": "子",
    },
    "compatibility": {
        "five_element_relation": "相克",
        "harmony_score": 72,
        "challenge": "沟通方式不同",
        "strength": "互补性强",
    },
}

def test_system_prompt():
    """测试系统 Prompt"""
    print("=" * 80)
    print("Nǎi Nai 系统 Prompt")
    print("=" * 80)
    print(NAONAI_SYSTEM_PROMPT[:500])
    print("\n...(省略中间部分)...\n")
    print(NAONAI_SYSTEM_PROMPT[-500:])
    print("\n")

def test_teaser_prompt():
    """测试免费层 Prompt"""
    print("=" * 80)
    print("免费层 Prompt")
    print("=" * 80)
    print(NAONAI_TEASER_PROMPT)
    print("\n")

def test_full_prompt():
    """测试付费层 Prompt"""
    print("=" * 80)
    print("付费层 Prompt")
    print("=" * 80)
    print(NAONAI_FULL_PROMPT)
    print("\n")

def test_complete_prompt():
    """测试完整的 Prompt 组合"""
    print("=" * 80)
    print("完整 Prompt 示例（发送给 AI 的内容）")
    print("=" * 80)
    
    complete_prompt = f"""
{NAONAI_SYSTEM_PROMPT}

---

{NAONAI_FULL_PROMPT}

使用以下预计算的数据进行解读：

{json.dumps(sample_data, ensure_ascii=False, indent=2)}

现在请以 Nǎi Nai（奶奶）的身份，用温暖的口吻写出完整的解读。
"""
    
    print(complete_prompt[:1000])
    print("\n...(省略中间部分)...\n")
    print(complete_prompt[-500:])
    print("\n")
    
    print(f"总长度：{len(complete_prompt)} 字符")
    print(f"预估 Token 数：{len(complete_prompt) // 2} tokens")

if __name__ == "__main__":
    test_system_prompt()
    test_teaser_prompt()
    test_full_prompt()
    test_complete_prompt()
    
    print("=" * 80)
    print("✅ Nǎi Nai Prompt 测试完成")
    print("=" * 80)
