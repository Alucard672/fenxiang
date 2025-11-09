# 微信开发者工具调试要点（严格按 figma 1_2）

## 1. 像素转换与设备适配
- 画板宽度 393px ≈ 小程序 rpx 设计稿 750rpx，请用 iPhone6 (375×667) 或同比例真机预览。
- 所有尺寸已在 wxss 中按 px 写死，若出现偏差请检查设备像素比设置（建议 2x）。

## 2. 字体与行高
- 标题 15.75px → 微信不支持小数，建议用 16px，可通过 letter-spacing 微调。
- 小字 10.5px → 建议用 11px 或 10px，若出现模糊可调整。
- 使用 font-family: Inter，若小程序内无该字体，可改为 -apple-system, BlinkMacSystemFont。

## 3. 图片模式与裁剪
- `mode="aspectFill"` 保证裁剪与画板一致；若出现变形，可尝试 `mode="scaleToFill"`。
- 图片资源路径确保 `/assets/CodeBubbyAssets/1_2/` 目录可访问。

## 4. 边距与圆角
- 卡片圆角 14px，按钮圆角 999px（全圆），标签圆角 999px。
- 容器 padding 14px，卡片间距 14px（grid gap）。

## 5. 渐变与阴影
- 渐变采用 CSS linear-gradient，cyan: #14B8A6 → #06B6D4；red: #FF6B6B → #EE5A6F。
- 卡片阴影：`box-shadow: 0 1px 2px rgba(0,0,0,0.1)`；若小程序不支持 rgba，可改用 #0000001A。

## 6. 交互占位
- 卡片点击已绑定 `onCardTap`，点击会显示 toast（仅调试用）。
- 新建按钮、搜索按钮暂无跳转，仅用于视觉还原。

## 7. 调试顺序
1. 确认容器背景色 #F8F9FD，header #fff，分割线 #F3F4F6。
2. 检查图片加载与裁剪是否与画板一致。
3. 验证渐变卡片背景与标签半透明度。
4. 检查所有文字大小、颜色、间距。
5. 真机预览，确认无异常。

## 8. 常见问题
- 若在小程序中图标不显示，检查 `.svg` 路径与小程序对 SVG 的兼容性，必要时转 PNG。
- 若渐变失效，检查微信版本对 CSS linear-gradient 的支持。
- 若标签文字被截断，检查 `white-space: nowrap` 与 `overflow: hidden`。

调试无误后，即可进入云函数与数据库设计阶段。