#!/usr/bin/env node

/**
 * 云函数自动部署监控脚本
 * 用于定期测试云函数服务是否恢复
 */

const fs = require('fs')
const path = require('path')

// 配置
const config = {
  cloudFunctionsDir: path.join(__dirname, 'cloud/functions'),
  testFunctionName: 'test-minimal',
  checkInterval: 60000, // 1分钟检查一次
  maxRetries: 10
}

// 日志函数
function log(message) {
  const timestamp = new Date().toLocaleString('zh-CN')
  console.log(`[${timestamp}] ${message}`)
}

// 检查云函数目录
function checkCloudFunctionDir() {
  const testFunctionPath = path.join(config.cloudFunctionsDir, config.testFunctionName)
  
  if (!fs.existsSync(testFunctionPath)) {
    log(`❌ 测试云函数目录不存在: ${testFunctionPath}`)
    return false
  }
  
  const indexPath = path.join(testFunctionPath, 'index.js')
  const packagePath = path.join(testFunctionPath, 'package.json')
  
  if (!fs.existsSync(indexPath) || !fs.existsSync(packagePath)) {
    log(`❌ 云函数文件不完整`)
    return false
  }
  
  log(`✅ 云函数文件检查通过`)
  return true
}

// 检查node_modules
function checkNodeModules() {
  const testFunctionPath = path.join(config.cloudFunctionsDir, config.testFunctionName)
  const nodeModulesPath = path.join(testFunctionPath, 'node_modules')
  
  if (!fs.existsSync(nodeModulesPath)) {
    log(`⚠️  node_modules 不存在，尝试安装依赖...`)
    const { execSync } = require('child_process')
    try {
      execSync('npm install', { cwd: testFunctionPath, stdio: 'inherit' })
      log(`✅ 依赖安装成功`)
      return true
    } catch (error) {
      log(`❌ 依赖安装失败: ${error.message}`)
      return false
    }
  }
  
  log(`✅ node_modules 检查通过`)
  return true
}

// 生成部署指导
function generateDeployGuide() {
  const guide = `
## 🚀 云函数部署指导

### 当前时间
${new Date().toLocaleString('zh-CN')}

### 部署步骤
1. 打开微信开发者工具
2. 确认当前项目已打开
3. 在左侧文件树中找到 \`cloud/functions/${config.testFunctionName}\`
4. 右键点击该文件夹
5. 选择 "上传并部署：云端安装依赖"
6. 等待部署完成

### 预期结果
- ✅ 成功：看到部署成功提示
- ❌ 失败：显示 CreateFailed 错误（说明服务端问题仍在）

### 如果成功
1. 测试云函数调用
2. 尝试部署完整功能云函数
3. 修改 app.js 中的 \`if (false)\` 为 \`if (true)\`

### 如果失败
1. 继续使用模拟模式
2. 等待下次检查
3. 联系腾讯云技术支持

---
自动生成时间：${new Date().toISOString()}
`

  const guidePath = path.join(__dirname, 'DEPLOY_GUIDE_CURRENT.md')
  fs.writeFileSync(guidePath, guide)
  log(`📋 部署指导已生成: ${guidePath}`)
}

// 主监控函数
async function startMonitor() {
  log('🚀 启动云函数部署监控')
  log(`📍 监控目录: ${config.cloudFunctionsDir}`)
  log(`🎯 测试函数: ${config.testFunctionName}`)
  log(`⏰ 检查间隔: ${config.checkInterval/1000}秒`)
  
  let retryCount = 0
  
  const check = () => {
    retryCount++
    log(`\n🔍 第 ${retryCount} 次检查`)
    
    if (checkCloudFunctionDir() && checkNodeModules()) {
      generateDeployGuide()
      log(`✅ 环境检查完成，请尝试部署云函数`)
    } else {
      log(`❌ 环境检查失败`)
    }
    
    if (retryCount < config.maxRetries) {
      log(`⏳ ${config.checkInterval/1000}秒后进行下次检查...`)
      setTimeout(check, config.checkInterval)
    } else {
      log(`🛑 达到最大检查次数 ${config.maxRetries}，监控结束`)
      log(`💡 建议联系腾讯云技术支持`)
    }
  }
  
  // 立即进行第一次检查
  check()
}

// 如果直接运行此脚本
if (require.main === module) {
  startMonitor().catch(console.error)
}

module.exports = { startMonitor, checkCloudFunctionDir, checkNodeModules }