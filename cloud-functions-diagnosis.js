#!/usr/bin/env node

/**
 * 云函数部署问题诊断脚本
 * 检查所有可能导致 CreateFailed 错误的问题
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 开始云函数部署问题诊断...\n')

// 检查项目配置
function checkProjectConfig() {
  console.log('📋 检查项目配置...')
  
  const configPath = path.join(__dirname, 'project.config.json')
  if (!fs.existsSync(configPath)) {
    console.log('❌ project.config.json 文件不存在')
    return false
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    
    console.log('✅ 项目配置文件存在')
    console.log(`📱 小程序AppID: ${config.appid}`)
    console.log(`📁 云函数目录: ${config.cloudfunctionRoot}`)
    console.log(`📁 小程序目录: ${config.miniprogramRoot}`)
    
    if (!config.cloudfunctionRoot) {
      console.log('❌ 未配置云函数目录')
      return false
    }
    
    return true
  } catch (error) {
    console.log(`❌ 项目配置文件解析失败: ${error.message}`)
    return false
  }
}

// 检查云函数文件
function checkCloudFunctions() {
  console.log('\n📦 检查云函数文件...')
  
  const cloudDir = path.join(__dirname, 'cloud', 'functions')
  if (!fs.existsSync(cloudDir)) {
    console.log('❌ 云函数目录不存在')
    return false
  }
  
  const functions = fs.readdirSync(cloudDir)
  console.log(`📁 发现云函数: ${functions.join(', ')}`)
  
  let allValid = true
  
  for (const funcName of functions) {
    const funcDir = path.join(cloudDir, funcName)
    const stat = fs.statSync(funcDir)
    
    if (!stat.isDirectory()) {
      console.log(`❌ ${funcName} 不是目录`)
      allValid = false
      continue
    }
    
    const indexPath = path.join(funcDir, 'index.js')
    const packagePath = path.join(funcDir, 'package.json')
    const nodeModulesPath = path.join(funcDir, 'node_modules')
    
    console.log(`\n🔍 检查云函数: ${funcName}`)
    
    // 检查必要文件
    if (!fs.existsSync(indexPath)) {
      console.log(`❌ 缺少 index.js`)
      allValid = false
    } else {
      const indexStat = fs.statSync(indexPath)
      console.log(`✅ index.js (${indexStat.size} bytes)`)
      
      if (indexStat.size > 200 * 1024) {
        console.log(`⚠️  index.js 超过200KB限制 (${Math.round(indexStat.size/1024)}KB)`)
      }
    }
    
    if (!fs.existsSync(packagePath)) {
      console.log(`❌ 缺少 package.json`)
      allValid = false
    } else {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
        console.log(`✅ package.json - ${packageJson.name}@${packageJson.version}`)
        
        if (!packageJson.dependencies || !packageJson.dependencies['wx-server-sdk']) {
          console.log(`⚠️  缺少 wx-server-sdk 依赖`)
        }
      } catch (error) {
        console.log(`❌ package.json 格式错误: ${error.message}`)
        allValid = false
      }
    }
    
    if (!fs.existsSync(nodeModulesPath)) {
      console.log(`⚠️  node_modules 不存在，需要运行 npm install`)
    } else {
      console.log(`✅ node_modules 存在`)
    }
  }
  
  return allValid
}

// 检查语法错误
function checkSyntax() {
  console.log('\n🔍 检查语法错误...')
  
  const cloudDir = path.join(__dirname, 'cloud', 'functions')
  const functions = fs.readdirSync(cloudDir)
  
  let allValid = true
  
  for (const funcName of functions) {
    const indexPath = path.join(cloudDir, funcName, 'index.js')
    
    if (fs.existsSync(indexPath)) {
      try {
        // 尝试解析代码
        const content = fs.readFileSync(indexPath, 'utf8')
        new Function(content)
        console.log(`✅ ${funcName}/index.js 语法正确`)
      } catch (error) {
        console.log(`❌ ${funcName}/index.js 语法错误: ${error.message}`)
        allValid = false
      }
    }
  }
  
  return allValid
}

// 检查环境变量
function checkEnvironment() {
  console.log('\n🌍 检查环境变量...')
  
  console.log(`📂 当前工作目录: ${process.cwd()}`)
  console.log(`🔧 Node.js 版本: ${process.version}`)
  console.log(`💻 操作系统: ${process.platform}`)
  
  // 检查关键环境变量
  const envVars = [
    'PATH',
    'HOME',
    'USER'
  ]
  
  envVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: ${process.env[varName]}`)
    } else {
      console.log(`⚠️  ${varName}: 未设置`)
    }
  })
  
  return true
}

// 检查文件权限
function checkPermissions() {
  console.log('\n🔐 检查文件权限...')
  
  const cloudDir = path.join(__dirname, 'cloud', 'functions')
  const functions = fs.readdirSync(cloudDir)
  
  let allValid = true
  
  for (const funcName of functions) {
    const funcDir = path.join(cloudDir, funcName)
    
    try {
      fs.accessSync(funcDir, fs.constants.R_OK | fs.constants.W_OK)
      console.log(`✅ ${funcName} 目录权限正常`)
    } catch (error) {
      console.log(`❌ ${funcName} 目录权限不足: ${error.message}`)
      allValid = false
    }
  }
  
  return allValid
}

// 生成解决方案建议
function generateSolutions(checks) {
  console.log('\n💡 解决方案建议:')
  
  if (!checks.projectConfig) {
    console.log('🔧 修复项目配置:')
    console.log('   1. 确保 project.config.json 存在且格式正确')
    console.log('   2. 设置正确的 cloudfunctionRoot 路径')
    console.log('   3. 确保 appid 配置正确')
  }
  
  if (!checks.cloudFunctions) {
    console.log('🔧 修复云函数:')
    console.log('   1. 确保每个云函数都有 index.js 和 package.json')
    console.log('   2. 运行 npm install 安装依赖')
    console.log('   3. 检查文件大小不超过 200KB')
  }
  
  if (!checks.syntax) {
    console.log('🔧 修复语法错误:')
    console.log('   1. 检查 JavaScript 语法')
    console.log('   2. 确保所有括号和引号匹配')
    console.log('   3. 检查函数调用和变量定义')
  }
  
  console.log('\n🚀 如果所有检查都通过但仍然失败:')
  console.log('   1. 这是腾讯云服务端问题，不是代码问题')
  console.log('   2. 继续使用模拟模式进行开发')
  console.log('   3. 联系腾讯云技术支持')
  console.log('   4. 在微信开发者社区寻求帮助')
}

// 主诊断流程
function main() {
  console.log('🎯 云函数部署问题完整诊断')
  console.log('=' .repeat(50))
  
  const checks = {
    projectConfig: checkProjectConfig(),
    cloudFunctions: checkCloudFunctions(),
    syntax: checkSyntax(),
    environment: checkEnvironment(),
    permissions: checkPermissions()
  }
  
  console.log('\n📊 诊断结果总结:')
  console.log('=' .repeat(30))
  
  Object.entries(checks).forEach(([name, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败'
    console.log(`${name}: ${status}`)
  })
  
  const allPassed = Object.values(checks).every(result => result)
  
  if (allPassed) {
    console.log('\n🎉 所有检查都通过了！')
    console.log('CreateFailed 错误是腾讯云服务端问题，建议:')
    console.log('1. 继续使用模拟模式开发')
    console.log('2. 联系腾讯云技术支持')
    console.log('3. 等待服务端问题修复')
  } else {
    generateSolutions(checks)
  }
  
  console.log('\n📞 技术支持:')
  console.log('- 微信开发者社区: https://developers.weixin.qq.com/community/')
  console.log('- 腾讯云工单: https://console.cloud.tencent.com/workorder')
  console.log('- 腾讯云客服: 95716')
}

// 运行诊断
main()