# 云函数部署指南

## 📋 当前云函数架构

云函数已正确放置在 `cloud/` 根目录下，符合微信小程序云函数部署要求：

```
cloud/
├── works/           # 作品管理云函数
├── tags/            # 标签管理云函数  
├── system/          # 系统管理云函数
└── upload/          # 文件上传云函数
```

## 🚀 部署步骤

### 1. 打开微信开发者工具
- 确保项目已正确打开
- 确认云开发环境已开通

### 2. 逐个部署云函数

#### 部署作品管理云函数
1. 在左侧文件树中找到 `cloud/works/` 文件夹
2. 右键点击 `works` 文件夹
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待部署完成，看到成功提示

#### 部署标签管理云函数
1. 在左侧文件树中找到 `cloud/tags/` 文件夹
2. 右键点击 `tags` 文件夹
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待部署完成，看到成功提示

#### 部署系统管理云函数
1. 在左侧文件树中找到 `cloud/system/` 文件夹
2. 右键点击 `system` 文件夹
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待部署完成，看到成功提示

#### 部署文件上传云函数
1. 在左侧文件树中找到 `cloud/upload/` 文件夹
2. 右键点击 `upload` 文件夹
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待部署完成，看到成功提示

## 📞 云函数 API 文档

### 作品管理 (works)
```javascript
// 获取作品列表
wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'list',
    page: 1,
    limit: 20
  }
})

// 创建作品
wx.cloud.callFunction({
  name: 'works', 
  data: {
    action: 'create',
    title: '作品标题',
    description: '作品描述',
    tags: ['标签1', '标签2'],
    images: ['图片URL'],
    customFields: {}
  }
})

// 更新作品
wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'update',
    _id: '作品ID',
    title: '新标题'
  }
})

// 删除作品
wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'delete',
    _id: '作品ID'
  }
})

// 搜索作品
wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'search',
    keyword: '搜索关键词',
    page: 1,
    limit: 20
  }
})
```

### 标签管理 (tags)
```javascript
// 获取标签列表
wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'list',
    page: 1,
    limit: 50
  }
})

// 创建标签
wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'create',
    name: '标签名',
    color: '#007AFF',
    description: '标签描述'
  }
})

// 更新标签
wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'update',
    _id: '标签ID',
    name: '新标签名',
    color: '#FF3B30'
  }
})

// 删除标签
wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'delete',
    _id: '标签ID'
  }
})

// 获取标签使用情况
wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'getUsage',
    _id: '标签ID'
  }
})
```

### 系统管理 (system)
```javascript
// 获取自定义字段
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'listCustomFields',
    page: 1,
    limit: 50
  }
})

// 创建自定义字段
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'createCustomField',
    name: '字段名',
    type: 'text',
    options: [],
    required: false,
    description: '字段描述'
  }
})

// 更新自定义字段
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'updateCustomField',
    _id: '字段ID',
    name: '新字段名'
  }
})

// 删除自定义字段
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'deleteCustomField',
    _id: '字段ID'
  }
})

// 获取用户资料
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'getUserProfile'
  }
})

// 更新用户资料
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'updateUserProfile',
    nickName: '昵称',
    avatarUrl: '头像URL'
  }
})

// 获取系统统计
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'getSystemStats'
  }
})
```

### 文件上传 (upload)
```javascript
// 获取上传链接
wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'getUploadURL',
    fileName: '图片.jpg',
    fileType: 'image'
  }
})

// 删除文件
wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'deleteFile',
    fileID: '云存储文件ID'
  }
})

// 获取文件信息
wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'getFileInfo',
    fileID: '云存储文件ID'
  }
})

// 批量删除文件
wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'batchDeleteFiles',
    fileIDs: ['文件ID1', '文件ID2']
  }
})
```

## ✅ 前端代码状态

前端代码已正确配置调用独立云函数：

- ✅ `myworks.js` - 调用 `works` 和 `system` 云函数
- ✅ `tags.js` - 调用 `tags` 云函数
- ✅ `customfields.js` - 调用 `system` 云函数

## 🎯 部署验证

所有云函数部署完成后：

1. **将模拟模式切换为真实模式**：
   在各个页面的 JS 文件中，将 `if (false)` 改为 `if (true)`

2. **测试各个功能**：
   - 作品列表加载
   - 创建/编辑/删除作品
   - 标签管理
   - 自定义字段管理
   - 文件上传

## 🚨 故障排除

### 如果某个云函数部署失败
1. 检查该云函数的代码语法
2. 确认 `package.json` 和 `index.js` 文件完整
3. 查看微信开发者工具的部署日志
4. 单独重新部署该云函数

### 如果云函数调用失败
1. 确认云函数已成功部署
2. 检查云函数名称拼写
3. 确认参数格式正确
4. 查看云开发控制台的日志

## 📋 数据库集合

云函数需要以下数据库集合：

- `works` - 作品数据
- `tags` - 标签数据
- `customFields` - 自定义字段
- `users` - 用户资料

这些集合会在首次使用时自动创建。

---

**现在可以开始部署云函数了！这种独立的云函数架构更稳定，便于维护。** 🚀