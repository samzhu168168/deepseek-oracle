# 隐相判官 · 志愿官项目 CLAUDE.md
# 苏州智启谷科技有限公司 | Solo Founder: Sam
# 最后更新：2026年5月21日 | 高考倒计时17天

---

## ▌ 项目身份

**产品名**：隐相判官 / 终局志愿官
**产品类型**：高考志愿个性化分析报告，PDF交付
**当前定价**：¥499（6月23日出分后涨至¥699）
**核心用户**：高考家长，普通家庭，子女成绩500-650分
**旺季窗口**：5月-7月（高考6月7-8日，出分约6月23日）

---

## ▌ 技术栈（当前真实版本）

| 层级 | 技术 | 说明 |
|------|------|------|
| 用户入口 | 微信服务号「隐相AI」 | AppID: wx7c2a603e546c49b7 |
| 对话/承接 | Coze智能体 | 接收用户信息，触发流程 |
| 支付验证 | 微信支付商户 | 支付成功后触发报告生成 |
| 报告生成AI | DeepSeek V4 API | 主力模型，生成报告内容 |
| 模板渲染 | Jinja2 | HTML报告模板 |
| PDF导出 | Playwright | HTML → PDF |
| 自动化/交付 | 飞书（Feishu）| 报告推送给用户 |
| 托管 | Singapore VPS | Claude/DeepSeek API无限制访问 |

**已弃用**：~~Accio表单收集~~ → 替换为微信服务号+Coze智能体

---

## ▌ 真实业务流程（当前版本）

```
用户在微信服务号「隐相AI」发消息
    ↓
Coze智能体接收并引导用户填写信息
（省份、分数、文理科、意向行业、家庭情况）
    ↓
引导用户完成微信支付（¥499）
    ↓
微信支付回调验证成功
    ↓
触发报告生成任务
    ↓
DeepSeek V4 API 生成报告各章节内容
（张雪峰风格System Prompt）
    ↓
Jinja2渲染HTML → Playwright导出PDF
    ↓
飞书机器人推送PDF给用户
```

---

## ▌ 微信服务号信息

```
公众号ID：gh_a86bb5295677
AppID：wx7c2a603e546c49b7
账号名称：隐相AI
```

> ⚠️ AppSecret、微信支付密钥等敏感信息统一存放在 `.env` 文件，不得写入代码或本文件。

---

## ▌ 环境变量清单（存 .env，不提交git）

```bash
# DeepSeek V4
DEEPSEEK_API_KEY=sk-xxxx          # 在DeepSeek控制台生成，定期轮换
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat      # 或实际模型名

# 微信服务号
WX_APPID=wx7c2a603e546c49b7
WX_APPSECRET=xxxx                  # 在公众号后台获取
WX_TOKEN=xxxx                      # 服务号验证Token

# 微信支付
WX_PAY_MCH_ID=xxxx
WX_PAY_KEY=xxxx
WX_PAY_NOTIFY_URL=https://your-vps-ip/pay/notify

# Coze
COZE_API_KEY=xxxx
COZE_BOT_ID=xxxx

# 飞书
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxx

# 服务配置
VPS_HOST=your-singapore-vps-ip
PORT=5000
DEBUG=False
```

---

## ▌ DeepSeek V4 调用规范

```python
# 标准调用示例
import openai

client = openai.OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL"),
)

response = client.chat.completions.create(
    model=os.getenv("DEEPSEEK_MODEL"),
    messages=[
        {"role": "system", "content": ZHANG_XUEFENG_SYSTEM_PROMPT},
        {"role": "user", "content": user_info_formatted},
    ],
    temperature=0.7,      # 报告内容：0.7
    max_tokens=4096,      # 根据章节调整
    stream=False,
)
```

**System Prompt风格**：张雪峰式
- 直接、数据驱动、不说废话
- 有明确判断，不用「可能」「建议您」「也许」
- 普通家庭视角，强调就业确定性
- 给具体数字，不给模糊区间

---

## ▌ 报告章节结构

```
1. 用户画像摘要
   └── 省份/分数/位次/科类/意向行业

2. 推荐院校清单（TOP 5-10所）
   └── 录取位次（近3年）+ DS综合评分

3. DS综合评分维度
   └── 就业壁垒 × 投资回报 × 防御性（抗AI替代）

4. 三种命运推演
   └── 乐观路径 / 现实路径 / 悲观路径

5. 行业雇主数据
   └── 谁在招 / 招什么岗 / 门槛多高 / 参考薪资

6. AI替代风险时间表
   └── 5年内低风险 / 中风险 / 高风险岗位

7. 最终建议
   └── 首选方向 + 保底方向 + 必须规避的坑
```

---

## ▌ Coze智能体对接规范

```
Coze承接的信息字段：
- user_province: 省份
- user_score: 高考分数（估分或实际）
- user_subject: 文科/理科/新高考选科
- user_preference: 意向行业（可多选）
- family_type: 普通家庭/有一定基础/不限
- contact: 微信号或手机（用于报告交付）

支付完成后Coze触发Webhook：
POST https://your-vps/api/generate-report
Body: { user_info, order_id, timestamp, sign }
```

---

## ▌ 微信支付回调处理要点

```python
# 必须实现幂等性：同一order_id只生成一次报告
# 签名验证：每次回调必须验证微信签名
# 超时处理：生成失败需要有重试机制
# 通知用户：生成完成后飞书推送，同时微信服务号回复

@app.route('/pay/notify', methods=['POST'])
def pay_notify():
    # 1. 验证微信签名
    # 2. 检查order_id是否已处理（幂等）
    # 3. 异步触发报告生成任务
    # 4. 立刻返回200给微信（超时会重推）
    pass
```

---

## ▌ 核心数据资产（已核实，可直接引用）

```python
VERIFIED_DATA = {
    "民航大学_2025届": {
        "平均月薪": 9861,
        "央企比例": "63.8%",
        "国有单位": ">75%",
        "全国排名": 80,
    },
    "中广核_2026校招_运行岗": {
        "本科总包": 170000,
        "硕士总包": 190000,
        "博士总包": 240000,
        "工作制": "六班三倒",
    },
    "三峡大学_2025届": {
        "进国网人数": 705,
        "全国排名": 2,
        "院校类型": "双非",
    },
    "兰州交通大学_2025届": {
        "进国铁排名": "全国前3",
        "院校类型": "双非",
    },
    "华北电力大学": {
        "类型": "211（非双非）",
        "注意": "历史上曾误写为双非，已更正",
    },
    "川航_等上机案例": {
        "等待时长": ">1年",
        "收入": 0,
        "社保": 0,
    },
    "中飞院_成都校区": {
        "位置": "成都东部新区",
        "注意": "非天府新区！已公开更正过",
        "说明": "非飞行专业在此，广汉=飞行训练基地",
    },
    "飞行技术_两条路": {
        "航司招飞通道": "学费5800/年，训练费航司出",
        "自费通道": "训练费自己出，数十万至上百万",
    },
}
```

---

## ▌ 常用命令（填入实际值）

```bash
# 启动开发服务器
# [TODO] python app.py

# 运行测试
# [TODO] pytest tests/ -v

# 单条报告生成测试
# [TODO] python test_report.py --score 580 --province 江苏

# 部署到VPS
# [TODO] ssh user@singapore-vps-ip "cd /project && git pull && restart"

# 查看服务日志
# [TODO] ssh user@vps "tail -f /logs/app.log"

# 微信支付回调本地测试
# [TODO] ngrok http 5000

# Coze Webhook本地联调
# [TODO] 填入实际测试命令
```

---

## ▌ 平台营销合规规则

```
小红书标题：≤20字（含标点）
抖音标题：≤30字
视频号标题：6-16字

✅ 合规CTA：「私信回复「志愿」」/ 「主页购买报告」
❌ 禁止：帖子内写微信号/公众号名称/二维码
❌ 禁止：「留省份+分数我来帮你看」（诱导互动，曾封号）
❌ 禁止：承诺/保证录取
```

**爆款内容公式**：垂直行业 + 内部人数据 + 具体数字 + 命运对比/认错格式

---

## ▌ 旺季关键节点

```
现在（5月21日）→ 高考（6月7日）：内容种草期，每天2-3篇
高考后（6月7-22日）：低流量期，准备出分爆发素材
出分当天（约6月23日）：三平台联发，价格调整至¥699
```

---

## ▌ 架构决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| AI主模型 | DeepSeek V4 | 成本低，中文能力强，API兼容OpenAI格式 |
| 用户入口 | 微信服务号 | 目标用户在微信生态，转化路径最短 |
| 智能体平台 | Coze | 无需自建对话流，快速上线 |
| 报告格式 | PDF（Playwright） | 用户收藏/分享/打印友好 |
| 交付方式 | 飞书机器人 | 稳定，不受微信商业限制 |
| 托管 | Singapore VPS | API访问无限制 |
| 弃用Accio | → 微信服务号+Coze | 减少跨平台跳转摩擦，提升转化 |

---

## ▌ 给Claude Code的工作规范

1. **先问后改**：不清楚现有实现时先问，不直接改
2. **改前说计划**：执行前先输出修改计划
3. **不碰.env**：环境变量只读，需新增变量时提示我手动添加
4. **API Key安全**：任何密钥不写入代码文件和文档，只存.env
5. **幂等性优先**：所有支付/报告生成相关接口必须有幂等处理
6. **commit规范**：feat: / fix: / refactor: / docs: 前缀

