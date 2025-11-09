# 云作品小程序部署与使用说明

## 1. 环境准备
- 微信开发者工具（稳定版）
- 已申请小程序 AppID（填写在 `project.config.json` 的 `appid` 字段）
- 开通云开发（在微信开发者工具「云开发」中创建环境）

## 2. 项目结构
```
云作品分享/
├── miniprogram/          # 小程序前端
│   ├── pages/myworks/    # 我的作品页面
│   ├── app.js/json/wxss # 小程序入口
│   └── assets/CodeBubbyAssets/1_2/ # 静态资源
├── cloud/                # 云函数
│   └── functions/
│       ├── createWork/
│       ├── listWorks/
│       ├── uploadImages/
│       ├── searchWorks/
│       ├── updateWork/
│       └── deleteWork/
├── app.js/json/wxss      # 项目根入口（兼容）
├── project.config.json   # 项目配置
└── README.md
```

## 3. 云开发初始化
1. 在微信开发者工具打开项目根目录
2. 点击顶部「云开发」-> 开通（选择按量计费）
3. 记录环境 ID，在 `cloud/` 下所有云函数的 `index.js` 中若需指定 env 可写入
4. 在云开发控制台创建数据库集合：
   - `works`：作品集合（见 `cloud/collections.md` 字段说明）
   - `users`：用户集合

## 4. 云函数上传
在开发者工具左侧「云开发」->「函数」中右键每个函数目录：
- 右键 `createWork` -> 上传并部署：云端安装依赖
- 依次上传 `listWorks`、`uploadImages`、`searchWorks`、`updateWork`、`deleteWork`

## 5. 数据库权限与索引（在云开发控制台）
- 设置 `works`、`users` 集合读写权限为「仅创建者可读写」
- 在 `works` 集合创建索引：
  - 复合索引：`openid` + `createdAt`（用于用户作品列表）
  - 单字段索引：`tags`（用于标签搜索）

## 6. 小程序配置
1. 在 `project.config.json` 中填写正确的 `appid`
2. 在 `app.json` 中配置页面路径（已默认配置 `pages/myworks/myworks`）
3. 在 `miniprogram/app.json` 中可自定义 `navigationBarTitleText`

## 7. 运行与调试
1. 打开微信开发者工具，选择项目根目录
2. 确保云开发环境已初始化，云函数已上传
3. 在模拟器或真机预览 `pages/myworks/myworks`
4. 页面会自动加载当前用户的「我的作品」列表

## 8. 常见问题
- 若页面提示「未找到 app.json」，确保 `project.config.json` 中 `miniprogramRoot` 为 `"miniprogram/"`。
- 若云函数调用失败，检查云函数是否上传、环境 ID 是否匹配。
- 若数据不显示，检查数据库集合权限与索引设置。

## 9. 测试用例
- 创建作品：调用 `createWork`，传入 title、imageFileIds、tags
- 获取列表：调用 `listWorks`，检查返回结构与前端渲染
- 搜索功能：调用 `searchWorks`，传入 keyword 或 tags
- 更新与删除：调用 `updateWork`、`deleteWork`，确保权限校验

## 10. 发布准备
- 在小程序后台配置服务器域名（云开发无需配置）
- 补全用户信息页与新建作品页（目前为占位）
- 上传小程序代码并提交审核

---

详细字段与云函数接口请参见 `cloud/collections.md`。