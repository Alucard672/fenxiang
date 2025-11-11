# 独立云函数部署指南

## 📋 云函数架构

现在云函数已按功能模块分离，每个模块都有独立的云函数：

```
cloud/functions/
├── works/           # 作品管理
├── tags/            # 标签管理  
├── system/          # 系统管理
└── upload/          # 文件上传
```

## 🚀 部署步骤

### 1. 部署作品管理云函数
- 右键点击 `cloud/functions/works` 文件夹
- 选择"上传并部署：云端安装依赖"
- 等待部署完成

### 2. 部署标签管理云函数
- 右键点击 `cloud/functions/tags` 文件夹
- 选择"上传并部署：云端安装依赖"
- 等待部署完成

### 3. 部署系统管理云函数
- 右键点击 `cloud/functions/system` 文件夹
- 选择"上传并部署：云端安装依赖"
- 等待部署完成

### 4. 部署文件上传云函数
- 右键点击 `cloud/functions/upload` 文件夹
- 选择"上传并部署：云端安装依赖"
- 等待部署完成

## 📞 API 调用格式

### 作品管理 (works)
```javascript
wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'list',        // 获取作品列表
    page: 1,
    limit: 20
  }
})

wx.cloud.callFunction({
  name: 'works', 
  data: {
    action: 'create',      // 创建作品
    title: '作品标题',
    description: '作品描述',
    tags: ['标签1', '标签2'],
    images: ['图片URL'],
    customFields: {}
  }
})

wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'update',      // 更新作品
    _id: '作品ID',
    title: '新标题'
  }
})

wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'delete',      // 删除作品
    _id: '作品ID'
  }
})

wx.cloud.callFunction({
  name: 'works',
  data: {
    action: 'search',      // 搜索作品
    keyword: '搜索关键词',
    page: 1,
    limit: 20
  }
})
```

### 标签管理 (tags)
```javascript
wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'list',         // 获取标签列表
    page: 1,
    limit: 50
  }
})

wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'create',       // 创建标签
    name: '标签名',
    color: '#007AFF',
    description: '标签描述'
  }
})

wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'update',       // 更新标签
    _id: '标签ID',
    name: '新标签名',
    color: '#FF3B30'
  }
})

wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'delete',       // 删除标签
    _id: '标签ID'
  }
})

wx.cloud.callFunction({
  name: 'tags',
  data: {
    action: 'getUsage',     // 获取标签使用情况
    _id: '标签ID'
  }
})
```

### 系统管理 (system)
```javascript
wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'listCustomFields',    // 获取自定义字段
    page: 1,
    limit: 50
  }
})

wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'createCustomField',   // 创建自定义字段
    name: '字段名',
    type: 'text',
    options: [],
    required: false,
    description: '字段描述'
  }
})

wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'updateCustomField',   // 更新自定义字段
    _id: '字段ID',
    name: '新字段名'
  }
})

wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'deleteCustomField',   // 删除自定义字段
    _id: '字段ID'
  }
})

wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'getUserProfile',      // 获取用户资料
  }
})

wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'updateUserProfile',   // 更新用户资料
    nickName: '昵称',
    avatarUrl: '头像URL'
  }
})

wx.cloud.callFunction({
  name: 'system',
  data: {
    action: 'getSystemStats',      // 获取系统统计
  }
})
```

### 文件上传 (upload)
```javascript
wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'getUploadURL',        // 获取上传链接
    fileName: '图片.jpg',
    fileType: 'image'
  }
})

wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'deleteFile',          // 删除文件
    fileID: '云存储文件ID'
  }
})

wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'getFileInfo',         // 获取文件信息
    fileID: '云存储文件ID'
  }
})

wx.cloud.callFunction({
  name: 'upload',
  data: {
    action: 'batchDeleteFiles',    // 批量删除文件
    fileIDs: ['文件ID1', '文件ID2']
  }
})
```

## ✅ 前端代码更新

所有前端代码已更新为调用独立的云函数：

- ✅ `myworks.js` - 调用 `works` 和 `system` 云函数
- ✅ `tags.js` - 调用 `tags` 云函数
- ✅ `customfields.js` - 调用 `system` 云函数

## 🎯 部署验证

部署完成后，将前端代码中的 `if (false)` 改为 `if (true)` 来测试云函数功能：

```javascript
// 在各个页面的 JS 文件中
if (true) { // 改为 true 使用云函数
  // 云函数调用代码
} else {
  // 模拟数据代码
}
```

## 🚨 故障排除

如果某个云函数部署失败：
1. 检查该云函数的代码语法
2. 确认依赖包已正确安装
3. 查看微信开发者工具的部署日志
4. 单独重新部署该云函数

其他云函数不受影响，可以正常使用。

---

*部署完成后，您的小程序将拥有模块化的云函数架构，更易维护和扩展！*