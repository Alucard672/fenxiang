# 云函数部署指南

## 当前状态
✅ 环境ID已配置：cloud1-1gdp8tuace5811f4
✅ 小程序ID已配置：wxbecdba631bdcbfe2  
✅ 图片资源已移动到 miniprogram/assets/images/
✅ 图片路径已更新

## 需要手动操作（在微信开发者工具中）

### 1. 部署云函数
在微信开发者工具中：
- 右键点击 `cloud` 文件夹 → "上传并部署：云端安装依赖"
- 或逐个部署每个云函数：
  - `cloud/functions/listWorks`
  - `cloud/functions/createWork` 
  - `cloud/functions/uploadImages`
  - `cloud/functions/searchWorks`
  - `cloud/functions/updateWork`
  - `cloud/functions/deleteWork`

### 2. 创建数据库集合
在云开发控制台：
1. 进入"数据库"
2. 创建集合：`works`
3. 权限设置：所有用户可读，仅创建者可写
4. 可选：创建 `users` 集合

### 3. 测试验证
部署完成后，页面应该能正常加载数据，不再显示 fallback 数据。

## 错误解决方案
- 如果云函数未找到：检查云函数是否已部署
- 如果图片加载失败：确认路径为 `/assets/images/`
- 如果数据库权限错误：检查集合权限设置