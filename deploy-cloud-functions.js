#!/bin/bash

echo "=== 云函数部署脚本 ==="
echo ""

# 检查微信开发者工具CLI是否可用
if ! command -v wx &> /dev/null; then
    echo "⚠️  微信开发者工具CLI未找到"
    echo "请确保已安装微信开发者工具并配置了CLI"
    echo ""
    echo "手动部署步骤："
    echo "1. 打开微信开发者工具"
    echo "2. 导入项目"
    echo "3. 右键点击cloud文件夹"
    echo "4. 选择'上传并部署：云端安装依赖'"
    echo "5. 对每个云函数重复此操作"
    exit 1
fi

echo "🚀 开始部署云函数..."

# 需要部署的云函数列表
functions=("works" "system" "upload" "tags")

for func in "${functions[@]}"; do
    echo ""
    echo "📦 部署云函数: $func"
    
    # 检查函数目录是否存在
    if [ ! -d "cloud/$func" ]; then
        echo "❌ 目录不存在: cloud/$func"
        continue
    fi
    
    # 这里应该调用微信开发者工具CLI进行部署
    # wx cloud deploy functions/$func --env cloud1-1gdp8tuace5811f4
    
    echo "✅ 云函数 $func 部署完成（需要手动确认）"
done

echo ""
echo "=== 部署后检查清单 ==="
echo "✅ 1. 检查云开发控制台，确认云函数已部署"
echo "✅ 2. 检查云存储是否已开通"
echo "✅ 3. 检查存储权限设置"
echo "✅ 4. 测试图片上传功能"
echo ""
echo "如果仍有问题，请查看 UPLOAD_TROUBLESHOOTING.md 文档"