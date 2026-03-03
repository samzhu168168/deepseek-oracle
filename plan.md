## 目标
- 在结果页评分区下方加入社交分享按钮
- 生成可分享图片（分数大字、元素组合、域名水印）
- 在结果页底部加入引导分享的文案

## 修改范围
- frontend/src/pages/Result.tsx
- 可能新增前端图片生成依赖（如 html-to-image 或 html2canvas）

## 具体步骤
1. 选择图片生成方案
   - 优先使用轻量依赖生成 PNG
   - 在结果页渲染隐藏的分享卡片 DOM
2. 在评分区下方加入按钮
   - 文案为 “Share Your Soul Reading”
   - 点击后生成图片并触发下载或分享
3. 在页面底部加入提示文案
   - “Want to know what your score means? Share and tag us — we read every one.”

## 验证
- 点击按钮可生成图片且内容完整
- 图片含大数字、元素组合、域名水印
- 底部分享提示文案可见
