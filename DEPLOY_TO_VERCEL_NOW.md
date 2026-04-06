# 🚀 立即部署到 Vercel - 完整指南

## ✅ 我已经完成的工作

### 1. 代码修复
- ✅ 修复了所有 CORS 问题（6 个 API 路由）
- ✅ 更新了 Vercel 配置文件
- ✅ 配置了环境变量
- ✅ 前端 API URL 设置为空（使用相同域名）

### 2. 配置文件
- ✅ `vercel.json` - Vercel 部署配置
- ✅ `api/index.py` - Python Serverless Function 入口
- ✅ `frontend/.env.production` - 前端环境变量
- ✅ `frontend/.vercelignore` - 忽略文件配置

### 3. Git 提交
- ✅ 所有更改已提交到本地 (commit: e8e6f8a)
- ⏳ 需要推送到 GitHub（网络问题）

## 🎯 你需要做的（10 分钟）

### 步骤 1: 推送代码到 GitHub（2 分钟）

打开 PowerShell 或 Git Bash，在项目目录运行：

```bash
# 检查网络连接
ping github.com

# 如果网络正常，推送代码
git push origin main

# 如果推送失败，尝试：
git push origin main --force
```

**如果网络一直有问题，可以：**
1. 等待网络恢复
2. 使用 VPN
3. 使用手机热点
4. 或者直接在 GitHub 网站上传文件

### 步骤 2: 在 Vercel 部署（5 分钟）

#### 2.1 访问 Vercel
```
🌐 打开: https://vercel.com
🔑 使用 GitHub 账号登录
```

#### 2.2 导入项目
```
1. 点击 "Add New..." → "Project"
2. 点击 "Import Git Repository"
3. 找到: samzhu168168/deepseek-oracle
4. 点击 "Import"
```

#### 2.3 配置项目
```
Project Name: elemental-bond
Framework Preset: Vite (自动检测)
Root Directory: ./ (保持默认)
Build Command: 保持默认
Output Directory: 保持默认

⚠️ 重要：不要修改任何构建设置！
```

#### 2.4 环境变量（自动配置）
```
Vercel 会自动从 vercel.json 读取环境变量：
✅ ANTHROPIC_API_KEY
✅ ANTHROPIC_BASE_URL
✅ GUMROAD_PRODUCT_ID
✅ DATABASE_PATH

不需要手动添加！
```

#### 2.5 部署
```
点击 "Deploy" 按钮
等待 2-3 分钟
✅ 部署完成！
```

### 步骤 3: 获取域名（1 分钟）

部署完成后，Vercel 会显示：

```
🌐 Production: https://elemental-bond.vercel.app
或
🌐 Production: https://your-project-name.vercel.app
```

**这个域名同时服务前端和后端！**

- 前端: `https://elemental-bond.vercel.app/`
- 后端 API: `https://elemental-bond.vercel.app/api/`
- 健康检查: `https://elemental-bond.vercel.app/health`

### 步骤 4: 配置自定义域名（可选，5 分钟）

如果你想使用 `www.elemental.bond`:

#### 4.1 在 Vercel 添加域名
```
1. 进入项目 Settings → Domains
2. 输入: www.elemental.bond
3. 点击 "Add"
```

#### 4.2 配置 DNS
```
在你的域名提供商（Cloudflare/GoDaddy 等）添加：

CNAME 记录:
  Name: www
  Value: cname.vercel-dns.com
  TTL: Auto

A 记录（如果需要裸域名）:
  Name: @
  Value: 76.76.21.21
  TTL: Auto
```

#### 4.3 等待生效
```
DNS 传播: 5-30 分钟
Vercel 会自动配置 HTTPS 证书
```

### 步骤 5: 测试部署（2 分钟）

#### 5.1 测试前端
```
访问: https://elemental-bond.vercel.app
应该看到你的网站
```

#### 5.2 测试后端
```
访问: https://elemental-bond.vercel.app/health
应该返回: {"status": "ok"}
```

#### 5.3 测试 API
```bash
# 在浏览器或命令行
curl -X POST https://elemental-bond.vercel.app/api/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"email_gate","score":79,"element_pair":"Earth-Metal"}'

# 应该返回
{"success": true, "message": "Email captured successfully"}
```

#### 5.4 测试 Email Gate
```
1. 访问网站
2. 填写表单并提交
3. 等待 3 秒
4. Email Gate 弹窗出现
5. 输入邮箱并解锁
6. ✅ 应该没有 CORS 错误！
```

## 🎉 为什么 Vercel 更好？

### 1. 完全免费
```
✅ 无需信用卡
✅ 无限带宽
✅ 100 GB 部署大小
✅ 自动 HTTPS
```

### 2. 同域名部署
```
前端和后端在同一个域名
不需要 CORS 配置！
所有请求都是同源的
```

### 3. 自动部署
```
每次 git push 到 main
Vercel 自动部署
2-3 分钟后生效
```

### 4. 全球 CDN
```
自动分发到全球节点
中国、美国、欧洲都快
```

### 5. 实时日志
```
可以查看每个 API 调用
实时错误监控
性能分析
```

## 📊 Vercel vs Railway 对比

| 功能 | Vercel | Railway |
|------|--------|---------|
| 价格 | ✅ 免费 | ❌ 需要付费 |
| 前端部署 | ✅ 支持 | ✅ 支持 |
| 后端部署 | ✅ Serverless | ✅ 容器 |
| 同域名 | ✅ 是 | ❌ 否 |
| CORS | ✅ 不需要 | ❌ 需要配置 |
| 自动部署 | ✅ 是 | ✅ 是 |
| 自定义域名 | ✅ 免费 | ✅ 免费 |
| 数据库 | ⚠️ 需外部 | ✅ 内置 |

## ⚠️ 重要提示

### 1. 数据库问题
```
Vercel Serverless 是无状态的
SQLite 数据库会在每次部署后重置

解决方案：
1. 使用 Vercel KV (免费 Redis)
2. 使用 Supabase (免费 PostgreSQL)
3. 使用 PlanetScale (免费 MySQL)
```

### 2. 如何迁移数据库到 Vercel KV

#### 2.1 在 Vercel 创建 KV 数据库
```
1. Vercel Dashboard → Storage → Create Database
2. 选择 "KV" (Redis)
3. 选择 "Hobby" (免费)
4. 创建完成后会得到环境变量
```

#### 2.2 更新代码使用 KV
```python
# 替换 SQLite 为 Redis
from vercel_kv import KV

kv = KV()

# 存储邮件
kv.set(f"email:{email}", {
    "source": source,
    "score": score,
    "element_pair": element_pair,
    "captured_at": datetime.now().isoformat()
})

# 获取邮件
data = kv.get(f"email:{email}")
```

## 🆘 常见问题

### 问题 1: 构建失败
```
错误: "Build failed"
解决: 查看 Build Logs，通常是依赖问题
```

### 问题 2: API 返回 500
```
错误: "Internal Server Error"
解决: 查看 Function Logs，检查 Python 代码
```

### 问题 3: 环境变量未生效
```
错误: API Key 未找到
解决: 检查 vercel.json 中的 env 配置
```

### 问题 4: 域名配置失败
```
错误: "Invalid Configuration"
解决: 检查 DNS 记录是否正确
```

## 📞 需要帮助？

### Vercel 资源
- 文档: https://vercel.com/docs
- 支持: https://vercel.com/support
- 社区: https://github.com/vercel/vercel/discussions

### 视频教程
- Vercel 部署教程: https://www.youtube.com/watch?v=2HBIzEx6IZA
- 自定义域名: https://www.youtube.com/watch?v=b-JWRVKhqhg

## ✅ 检查清单

部署前：
- [ ] 代码已推送到 GitHub
- [ ] vercel.json 配置正确
- [ ] 环境变量已设置

部署中：
- [ ] Vercel 项目已创建
- [ ] 构建成功
- [ ] 部署完成

部署后：
- [ ] 前端可以访问
- [ ] /health 返回 200
- [ ] /api/capture-email 工作正常
- [ ] Email Gate 功能正常
- [ ] 没有 CORS 错误

## 🎯 预期结果

完成后你将拥有：

- ✅ 完全免费的全栈部署
- ✅ 前端 + 后端在同一域名
- ✅ 自动 HTTPS 和 CDN
- ✅ 自动部署（git push 即部署）
- ✅ 没有 CORS 问题
- ✅ 全球访问速度快
- ✅ 实时日志和监控

## 🚀 开始部署

1. **现在**: 推送代码到 GitHub
   ```bash
   git push origin main
   ```

2. **然后**: 访问 https://vercel.com 并导入项目

3. **最后**: 等待 2-3 分钟，完成！

---

**创建时间**: 2026-04-06
**状态**: 准备部署
**预计时间**: 10 分钟
**难度**: ⭐⭐ (简单)
