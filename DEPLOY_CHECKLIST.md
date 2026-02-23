# 部署检查清单

- [ ] 备案或购买域名，并将域名解析到服务器公网 IP
- [ ] 申请并下载 SSL 证书（或使用 Let’s Encrypt 自动签发）
- [ ] 将证书文件放入 nginx/certs，并命名为 fullchain.pem 与 privkey.pem
- [ ] 在 .env.production 中设置 SERVER_NAME 与证书路径
- [ ] 生成并填写 SECRET_KEY（高强度随机字符串）
- [ ] 配置 SMTP 邮件服务账号与授权码
- [ ] 配置 LLM API Key 与模型（至少一个可用供应商）
- [ ] 配置 ADMIN_EMAILS 与 SPECIAL_ADMIN_EMAIL
- [ ] 确认是否启用邀请制（INVITE_ONLY 与 INVITE_CODES）
- [ ] 设置 CORS_ORIGINS 为实际前端域名
- [ ] 确认 Redis 端口与连接地址可用
- [ ] 确认服务器 80/443 端口放行
- [ ] 确认数据目录可持久化与备份策略
- [ ] 运行 docker-compose up -d 并检查容器健康状态
- [ ] 验证前端访问、登录注册、邮件验证与占卜流程
