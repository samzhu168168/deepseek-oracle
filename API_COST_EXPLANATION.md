# API 成本和流量说明 💰

## ✅ API Key 已集成

你的 API Key 已经成功集成到系统中：
```
ANTHROPIC_API_KEY=sk-kEznPpu5i1dHx8EZ0aD4Fc6c3bA347E8993e331e20E347D1
ANTHROPIC_BASE_URL=https://api.laozhang.ai
```

## 🔍 使用的服务

根据你提供的 API Key 和截图，你使用的是：

- **服务商**: 老张 API (laozhang.ai) - 这是一个第三方 Claude API 代理服务
- **模型**: `claude-sonnet-4-20250514` (Claude Sonnet 4)
- **用途**: 生成完整的 BaZi 兼容性报告

## 💸 成本分析

### 1. 是否需要消耗该模型？

**是的，每次生成完整报告都会调用 Claude Sonnet 4 模型。**

具体触发时机：
- ✅ 用户在 Gumroad 购买后输入 license key
- ✅ License key 验证通过
- ✅ 调用 `/api/generate-full-report` 接口
- ✅ 系统向老张 API 发送请求，调用 Claude Sonnet 4

### 2. 是否需要消耗流量？

**是的，会消耗 API 调用额度和 token 流量。**

#### 每次报告生成的消耗：

**输入 (Prompt):**
- 提示词模板: ~500 tokens
- 用户数据 (生日、时间、分数等): ~100 tokens
- **总输入**: ~600 tokens

**输出 (Response):**
- 完整报告 (JSON 格式): 设置为 `max_tokens=2000`
- 实际输出通常: 1500-2000 tokens
- **总输出**: ~1500-2000 tokens

#### 单次报告成本估算：

根据老张 API 的定价（从你的截图看，你的账户显示 $1.08 余额）：

假设 Claude Sonnet 4 的定价（第三方代理通常比官方贵 10-30%）：
- 输入: ~$3 / 1M tokens
- 输出: ~$15 / 1M tokens

**单次报告成本:**
```
输入成本: 600 tokens × $3 / 1M = $0.0018
输出成本: 1800 tokens × $15 / 1M = $0.027
总成本: ~$0.029 (约 ¥0.21 人民币)
```

#### 你的余额可以生成多少报告？

```
$1.08 ÷ $0.029 ≈ 37 份完整报告
```

## 🎯 优化建议

### 1. 缓存机制 (已实现)

代码中已经实现了缓存：
```python
cache_key = hashlib.sha256(license_key.encode()).hexdigest()
if cache_key in _report_cache:
    return jsonify({'success': True, 'report': _report_cache[cache_key]})
```

**好处**: 同一个 license key 多次请求，只调用一次 API

### 2. 降低 max_tokens

如果报告不需要那么长，可以降低 `max_tokens`:
```python
'max_tokens': 1500,  # 从 2000 降到 1500
```

**节省**: 每份报告节省 ~$0.0075 (约 25%)

### 3. 使用更便宜的模型

如果质量要求不是特别高，可以换成：
- `claude-3-5-sonnet-20241022` (更便宜，但稍旧)
- `claude-3-haiku-20240307` (最便宜，速度快)

### 4. 升级到 Redis 缓存

当前使用内存缓存，服务器重启后会丢失。建议：
```python
# 使用 Redis 持久化缓存
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)
```

## 📊 业务模型分析

### 你的定价: $24.90 / 份报告

### 成本结构:
- AI 生成成本: ~$0.029 (0.12%)
- Gumroad 手续费: ~$2.74 (11% + $0.30)
- **净利润**: ~$22.13 (88.8%)

### 盈亏平衡点:
- 第 1 份报告就已经盈利
- AI 成本占比极低，主要成本是支付手续费

## ⚠️ 注意事项

### 1. API 额度监控

从截图看，你的账户余额只有 $1.08，建议：
- 及时充值，避免服务中断
- 设置余额告警
- 监控每日 API 调用量

### 2. 错误处理

代码已经包含了错误处理：
```python
except Exception as e:
    return jsonify({'success': False, 'error': f'Report generation failed: {str(e)}'}), 500
```

但建议添加更详细的日志记录。

### 3. 速率限制

老张 API 可能有速率限制，建议：
- 添加请求队列
- 实现重试机制
- 避免短时间内大量请求

## 🚀 下一步行动

1. ✅ API Key 已集成
2. ⏳ 充值老张 API 账户（建议充值 $50-100）
3. ⏳ 测试完整的购买 → 验证 → 生成流程
4. ⏳ 监控 API 使用情况
5. ⏳ 根据实际使用调整 max_tokens

## 📞 技术支持

如果遇到问题：
- 老张 API 文档: https://api.laozhang.ai/docs
- 检查 API Key 是否有效
- 查看后端日志: `backend/logs/`
- 测试 API 连接: `curl -H "x-api-key: YOUR_KEY" https://api.laozhang.ai/v1/models`

---

**总结**: 是的，每次生成报告都会消耗 Claude Sonnet 4 模型和流量，但成本很低（~$0.029/份），相比你的售价 $24.90，利润率非常高。建议及时充值以确保服务稳定运行。
