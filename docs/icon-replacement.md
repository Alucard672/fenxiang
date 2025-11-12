# TDesign 图标替换方案（最终版）

本文档根据设计稿（图1）与现状（图2）对比，整理全项目的图标选型与替换说明，统一到 TDesign 官方图标库（tdesign-miniprogram）。

## 目标与风格准则
- 统一视觉风格：优先选用「线性」风格（与设计稿一致），必要处使用 Filled 变体以增强语义（如评分）。
- 语义优先：图标必须与功能直观匹配，避免抽象或易误解图形。
- 尺寸与布局：保持现有布局的像素尺寸与间距不变；图标大小按 14px / 16px / 20px 三档适配。
- 一致性：相同语义在不同页面使用同一个图标；命名统一，便于维护。

参考文档与资源：
- TDesign 小程序图标组件使用文档：https://tdesign.tencent.com/miniprogram/components/icon  
- TDesign 图标全集（名称检索参考）：https://iconbuddy.com/tdesign  

## 全局命名规范
- 统一使用 `<t-icon name="{tdesign-icon-name}" />`，不再使用本地 `/assets/images/*.svg` 作为功能图标。
- 若某功能存在状态切换，采用 `xxx` 与 `xxx-off`（或 `-filled`）等成对命名。
- 组件使用统一大小：
  - Sheet/弹窗列表：`size="16px"`
  - 标签或次要入口：`size="14px"`
  - 主要操作按钮：`size="20px"`

## 使用场景与最终图标清单

### 作品详情页底部操作 Sheet（`miniprogram/pages/detail/detail.wxml`）
1) 添加图片（原：`/assets/images/7.svg`）
   - 候选：`browse-gallery`、`image`、`upload`、`add-circle`、`add-rectangle`
   - 最终：`browse-gallery`
   - 说明：更贴近“从相册/图库添加”的语义；若强调上传，可在后续状态改为 `upload`。

2) 名称（原：`/assets/images/8.svg`）
   - 候选：`edit-1`、`text`、`article`、`assignment`
   - 最终：`edit-1`
   - 说明：名称通常伴随编辑动作，铅笔更直观。

3) 简介（原：`/assets/images/9.svg`）
   - 候选：`article`、`text`、`chat`、`information`
   - 最终：`article`
   - 说明：简介为文本段落，文档/文章图形更合适。

4) 标签（原：`/assets/images/10.svg`）
   - 候选：`tag`、`label`、`bookmark`
   - 最终：`tag`

5) 评分（原：`/assets/images/11.svg`）
   - 候选：`star`、`star-filled`、`thumb-up`、`medal`
   - 最终：`star-filled`
   - 说明：Filled 版本在评分语义上更强，视觉更醒目。

6) 卡片装饰（原：`/assets/images/12.svg`）
   - 候选：`brush`、`palette`、`magic`、`paint-bucket`
   - 最终：`brush`

7) 排序（原：`/assets/images/13.svg`）
   - 候选：`sort`、`arrow-up-down-1`、`arrow-up-down-2`、`swap`
   - 最终：`arrow-up-down-1`

8) 单列（原：自定义 `sheet-icon-layout`）
   - 候选：`view-list`、`list`、`view-rectangle`、`layout`
   - 最终：`view-list`

9) 沉浸浏览（原：自定义 `sheet-icon-immersive`）
   - 候选：`browse`、`browse-off`、`fullscreen`、`eye`
   - 最终：`browse`（开） / `browse-off`（关）成对使用

10) 停用作品（原：`/assets/images/14.svg`）
   - 候选：`poweroff`、`stop-circle`、`close-circle`、`forbid`
   - 最终：`poweroff`

### 我的作品页编辑弹层（`miniprogram/pages/myworks/myworks.wxml`）
1) 编辑作品（原：`/assets/images/10.svg`） → `edit-1`
2) 重命名（原：`/assets/images/11.svg`） → `text`（或继续用 `edit-1`，保持一致性）
3) 设置封面（原：`/assets/images/12.svg`） → `image`
4) 作品标签（原：`/assets/images/13.svg`） → `tag`
5) 卡片装饰（原：`/assets/images/14.svg`） → `brush`
6) 分享作品（原：`/assets/images/15.svg`） → `share-1`
7) 复制作品（原：`/assets/images/16.svg`） → `copy`
8) 删除作品（原：`/assets/images/17.svg`） → `delete`

### 其他页面与通用图标
- 箭头下拉（`arrow-down.svg`） → `arrow-down`
- 拖拽把手（`drag-handle.svg`） → `drag-drop`
- 新增（`add-icon.svg`） → `add` 或 `add-circle`
- 编辑（`edit-icon.svg`） → `edit-1`
- 删除（`delete-icon.svg`） → `delete`
- 心形（`heart-icon.svg`） → `heart` / `heart-filled`
- 分享（`share_769.svg`） → `share-1`
- 标签占位（字段徽章 `{{item.icon}}.svg`） → 统一用 `tag`，或按字段语义替换为更具体的图标

## 替换实施说明

1) 组件引用
```json
// miniprogram/app.json
{
  "usingComponents": {
    "t-icon": "tdesign-miniprogram/icon/icon"
  }
}
```

2) 代码替换示例
```xml
<!-- 旧：本地 svg -->
<image src="/assets/images/10.svg" class="edit-modal__icon" />

<!-- 新：TDesign 图标 -->
<t-icon name="tag" size="16px" class="edit-modal__icon" />
```

3) 样式适配
- 保持原有容器尺寸不变，必要时在图标上添加 `display: inline-flex; align-items: center; justify-content: center;` 以居中。
- 对于 `Filled` 图标如 `star-filled`，如需强调颜色，可按设计稿在父容器上设置主题色。

4) 状态检查
- hover/active：小程序不支持 hover，交互反馈通过 `:active` 或点击态样式实现；图标本身保持不变。
- 勾选/开关：使用成对图标（如 `browse` / `browse-off`）切换。

## 验证清单
- 页面覆盖：`detail`、`myworks`、`settings`、`tags`、`customfields` 等所有使用场景逐一检查。
- 设备适配：iPhone 6/8/11、Android 中端机，确认像素对齐与清晰度。
- 语义复核：非设计或产品人员也能准确理解每项操作含义。
- 性能回归：移除大量本地 svg 后，包体积与渲染无异常。

## 新旧图标对比（截图占位）
> 请在 TDesign 图标库中搜索并截图以下最终图标，与现状截图并排对比：

| 功能 | 旧图标路径 | 新图标（name） |
|---|---|---|
| 添加图片 | `/assets/images/7.svg` | `browse-gallery` |
| 名称 | `/assets/images/8.svg` | `edit-1` |
| 简介 | `/assets/images/9.svg` | `article` |
| 标签 | `/assets/images/10.svg` | `tag` |
| 评分 | `/assets/images/11.svg` | `star-filled` |
| 卡片装饰 | `/assets/images/12.svg` | `brush` |
| 排序 | `/assets/images/13.svg` | `arrow-up-down-1` |
| 单列 | 自定义 | `view-list` |
| 沉浸浏览 | 自定义 | `browse` / `browse-off` |
| 停用作品 | `/assets/images/14.svg` | `poweroff` |
| 编辑作品 | `/assets/images/10.svg` | `edit-1` |
| 重命名 | `/assets/images/11.svg` | `text` |
| 设置封面 | `/assets/images/12.svg` | `image` |
| 作品标签 | `/assets/images/13.svg` | `tag` |
| 分享作品 | `/assets/images/15.svg` | `share-1` |
| 复制作品 | `/assets/images/16.svg` | `copy` |
| 删除作品 | `/assets/images/17.svg` | `delete` |

> 截图采集建议：在 TDesign 图标库中直接搜索名称（示例：`tag`、`browse-gallery`），导出 2x PNG 或 SVG，保存到 `docs/iconshots/` 供评审。对比当前页面截图（图2）即可完成评估。

## 备注
- 若后续确定需替换为面性或双色风格，请将 `-filled` 或双色系列纳入统一规范，并在本文档补充颜色与大小约束。
- 字段徽章内的图标（如 `{{item.icon}}`）建议逐步改为受控枚举，以免出现非语义图标。