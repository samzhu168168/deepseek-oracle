# 零基础 Railway + Vercel 部署手册

## 前置准备
- 一个可用的 Git 仓库（已包含本项目代码）
- Railway 账号
- Vercel 账号
- DeepSeek API Key
- SMTP 邮箱服务账号与授权码

## 一、在 Railway 部署后端

### 1. 创建项目并导入仓库
1) 打开 https://railway.app 并登录
2) 点击右上角 New Project
3) 选择 Deploy from GitHub Repo
4) 选择本项目仓库，点击 Deploy

### 2. 设置运行命令
1) 进入项目后，点击你的服务卡片
2) 点击 Settings
3) 找到 Build & Deploy 区域
4) 确认使用 Nixpacks 构建
5) 确认仓库根目录已包含 railway.toml 与 Procfile

### 3. 添加 Redis
1) 回到项目首页
2) 点击 New
3) 选择 Database
4) 选择 Redis 并创建
5) 进入 Redis 服务，复制连接地址

### 4. 配置环境变量
1) 回到后端服务卡片
2) 点击 Variables
3) 逐条添加后端所需环境变量（见本手册“后端环境变量”）
4) 将 REDIS_URL 设置为 Redis 连接地址
5) 将 CORS_ORIGINS 设置为你的 Vercel 域名

### 5. 启动与查看日志
1) 点击 Deployments
2) 点击最新部署记录
3) 打开 Logs，确认服务启动成功
4) 在 Settings -> Networking 查看公网 URL

## 二、在 Vercel 部署前端

### 1. 创建项目并导入仓库
1) 打开 https://vercel.com 并登录
2) 点击 New Project
3) 选择导入本项目仓库

### 2. 配置构建
1) Framework Preset 选择 Vite
2) Root Directory 选择 frontend
3) Build Command 填写 npm run build
4) Output Directory 填写 dist

### 3. 设置环境变量
1) 进入 Project Settings
2) 选择 Environment Variables
3) 添加 VITE_API_URL
4) 值填写 Railway 后端公网 URL，例如 https://xxx.up.railway.app
5) Environment 选择 Production

### 4. 部署并访问
1) 回到 Deployments
2) 点击最新部署
3) 等待完成后点击 Visit 访问站点

## 三、后端环境变量（Railway 控制台填写）

- SECRET_KEY
- DEBUG
- CORS_ORIGINS
- DATABASE_PATH
- REDIS_URL
- ANALYSIS_QUEUE
- IZTHON_SRC_PATH
- IZTRO_SERVICE_URL
- REQUEST_TIMEOUT_S
- MAX_TASK_RETRY
- LLM_MAX_RETRIES
- ORACLE_EAST_ONLY_MVP
- AUTH_TOKEN_EXPIRE_HOURS
- INVITE_ONLY
- INVITE_CODES
- ADMIN_EMAILS
- SPECIAL_ADMIN_EMAIL
- EMAIL_VERIFY_REQUIRED
- EMAIL_CODE_EXPIRE_MINUTES
- SMTP_HOST
- SMTP_PORT
- SMTP_USE_SSL
- SMTP_USERNAME
- SMTP_PASSWORD
- SMTP_FROM_EMAIL
- SMTP_FROM_NAME
- SMTP_TIMEOUT_S
- LLM_PROVIDER
- LLM_MODEL
- PROMPT_VERSION
- ARK_API_KEY
- ARK_API_MODEL
- DEEPSEEK_API_KEY
- DEEPSEEK_BASE_URL
- ALIYUN_API_KEY
- ALIYUN_BASE_URL
- ZHIPU_API_KEY
- QWEN_API_KEY
- QWEN_BASE_URL
- CALENDAR_PRECOMPUTE_DAY
- SCHEDULER_POLL_SECONDS

## 四、上线验证步骤
1) 访问 Vercel 前端域名
2) 注册账号并完成邮箱验证
3) 登录后执行一次占卜或分析
4) 验证历史记录与导出功能
5) 验证 /api/oracle/chat/stream 流式接口是否正常
