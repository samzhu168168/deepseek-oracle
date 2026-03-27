# ══════════════════════════════════════════════════════════════════
# 集成指南：把 license 验证流程接入现有 Result 页面
# ══════════════════════════════════════════════════════════════════

# ── 1. 文件放置 ─────────────────────────────────────────
# frontend/src/components/LicenseKeyModal.tsx   ← 新增
# frontend/src/components/FullReport.tsx        ← 新增
# backend/license_routes.py                    ← 新增


# ── 2. 后端注册 Blueprint ──────────────────────────────
# 在 backend/app.py 里加两行：

from license_routes import license_bp
app.register_blueprint(license_bp)

# 环境变量 .env 加：
# GUMROAD_PRODUCT_ID=bhpmxr
# ANTHROPIC_API_KEY=sk-ant-...


# ── 3. 前端 Result 页面改动（伪代码，按你实际组件名调整）────
"""
// 在你的 ResultPage.tsx / ResultView.tsx 顶部 import：
import { LicenseKeyModal, FullReportData } from '../components/LicenseKeyModal'
import { FullReport } from '../components/FullReport'

// 在组件内部加两个 state：
const [showLicenseModal, setShowLicenseModal] = useState(false)
const [fullReport, setFullReport] = useState<FullReportData | null>(null)

// 把你现有的 "Already purchased?" 文字改成：
<button
  onClick={() => setShowLicenseModal(true)}
  style={{ background: 'none', border: 'none', color: '#c4956a', 
           cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
>
  Already purchased? Unlock here →
</button>

// 在模糊区域（paywall card）下方，条件渲染：
{fullReport ? (
  <FullReport
    data={fullReport}
    elementPair={resultData.elementPair}   // 替换成你实际的变量名
    score={resultData.score}
  />
) : (
  // 你现有的模糊内容 + paywall card 保持不变
  <YourExistingBlurredSection />
)}

// Modal 挂载在页面底部：
<LicenseKeyModal
  isOpen={showLicenseModal}
  onClose={() => setShowLicenseModal(false)}
  onSuccess={(reportData) => {
    setFullReport(reportData)
    setShowLicenseModal(false)
    // 可选：平滑滚动到报告位置
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }}
  resultPayload={{
    person1: resultData.person1,   // 替换成你实际的变量名
    person2: resultData.person2,
    score: resultData.score,
    elementPair: resultData.elementPair,
  }}
/>
"""


# ── 4. 依赖检查 ─────────────────────────────────────────
# 后端已有 requests？如没有：pip install requests --break-system-packages
# 后端已有 anthropic？如没有：pip install anthropic --break-system-packages
# 前端无需新依赖，LicenseKeyModal 和 FullReport 纯 React + inline styles


# ── 5. 生产环境缓存升级（可选，当日活超过 100 时处理）──────
# 把 _report_cache dict 换成 Redis：
#
# import redis
# r = redis.Redis.from_url(os.getenv('REDIS_URL'))
#
# 写入: r.setex(cache_key, 86400 * 30, json.dumps(report))  # 30天缓存
# 读取: cached = r.get(cache_key); if cached: return json.loads(cached)


# ── 6. 测试清单 ─────────────────────────────────────────
# □ 用真实 Gumroad key 测试完整流程
# □ 用错误 key 测试错误提示
# □ 同一个 key 第二次使用（测试缓存命中）
# □ 移动端 modal 显示正常
# □ 完整报告所有 section 有内容
