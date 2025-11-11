#!/usr/bin/env node

/**
 * 云函数部署检查和修复工具
 */

const fs = require('fs')
const path = require('path')

const CLOUD_FUNCTIONS_PATH = path.join(__dirname, 'cloud/functions')

function log(message) {
  console.log(`[DEPLOY] ${message}`)
}

function success(message) {
  console.log(`[SUCCESS] ${message}`)
}

function error(message) {
  console.log(`[ERROR] ${message}`)
}

function warn(message) {
  console.log(`[WARN] ${message}`)
}

// 检查云函数文件结构
function checkCloudFunction(funcName) {
  const funcPath = path.join(CLOUD_FUNCTIONS_PATH, funcName)
  
  if (!fs.existsSync(funcPath)) {
    error(`云函数目录不存在: ${funcName}`)
    return false
  }
  
  const requiredFiles = ['index.js', 'package.json']
  let allGood = true
  
  requiredFiles.forEach(file => {
    const filePath = path.join(funcPath, file)
    if (fs.existsSync(filePath)) {
      success(`${funcName}/${file} ✓`)
    } else {
      error(`${funcName}/${file} ✗`)
      allGood = false
    }
  })
  
  // 检查 package.json 内容
  const packagePath = path.join(funcPath, 'package.json')
  if (fs.existsSync(packagePath)) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      if (packageContent.dependencies && packageContent.dependencies['wx-server-sdk']) {
        success(`${funcName} wx-server-sdk 依赖 ✓`)
      } else {
        error(`${funcName} 缺少 wx-server-sdk 依赖 ✗`)
        allGood = false
      }
    } catch (e) {
      error(`${funcName} package.json 格式错误 ✗`)
      allGood = false
    }
  }
  
  // 检查 index.js 语法
  const indexPath = path.join(funcPath, 'index.js')
  if (fs.existsSync(indexPath)) {
    try {
      const content = fs.readFileSync(indexPath, 'utf8')
      
      // 基本语法检查
      if (content.includes('wx-server-sdk')) {
        success(`${funcName} 引入 wx-server-sdk ✓`)
      } else {
        error(`${funcName} 未引入 wx-server-sdk ✗`)
        allGood = false
      }
      
      if (content.includes('cloud.init')) {
        success(`${funcName} 调用 cloud.init ✓`)
      } else {
        error(`${funcName} 未调用 cloud.init ✗`)
        allGood = false
      }
      
      if (content.includes('exports.main')) {
        success(`${funcName} 导出 main 函数 ✓`)
      } else {
        error(`${funcName} 未导出 main 函数 ✗`)
        allGood = false
      }
      
    } catch (e) {
      error(`${funcName} index.js 读取失败 ✗`)
      allGood = false
    }
  }
  
  return allGood
}

// 修复云函数
function fixCloudFunction(funcName) {
  log(`尝试修复云函数: ${funcName}`)
  
  const funcPath = path.join(CLOUD_FUNCTIONS_PATH, funcName)
  
  // 确保目录存在
  if (!fs.existsSync(funcPath)) {
    fs.mkdirSync(funcPath, { recursive: true })
    log(`创建目录: ${funcPath}`)
  }
  
  // 创建基础 package.json
  const packagePath = path.join(funcPath, 'package.json')
  if (!fs.existsSync(packagePath)) {
    const packageContent = {
      name: funcName,
      version: '1.0.0',
      description: `${funcName} 云函数`,
      main: 'index.js',
      dependencies: {
        'wx-server-sdk': '~2.6.3'
      }
    }
    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2))
    success(`创建 package.json: ${funcName}`)
  }
  
  // 如果是 test 函数，创建基础代码
  if (funcName === 'test') {
    const indexPath = path.join(funcPath, 'index.js')
    if (!fs.existsSync(indexPath)) {
      const indexContent = `// ${funcName} 云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  console.log('${funcName} 函数被调用:', event)
  return {
    errCode: 0,
    errMsg: 'ok',
    data: {
      message: '${funcName} 函数运行成功',
      timestamp: new Date().toISOString(),
      event: event
    }
  }
}`
      fs.writeFileSync(indexPath, indexContent)
      success(`创建 index.js: ${funcName}`)
    }
  }
}

// 主检查函数
function main() {
  log('云函数部署检查工具')
  log('==================')
  
  // 检查所有云函数
  const allFunctions = fs.readdirSync(CLOUD_FUNCTIONS_PATH)
    .filter(name => {
      const stat = fs.statSync(path.join(CLOUD_FUNCTIONS_PATH, name))
      return stat.isDirectory()
    })
  
  log(`发现云函数: ${allFunctions.join(', ')}`)
  
  let allGood = true
  
  allFunctions.forEach(funcName => {
    log(`\n检查云函数: ${funcName}`)
    if (!checkCloudFunction(funcName)) {
      warn(`${funcName} 有问题，尝试修复...`)
      fixCloudFunction(funcName)
      if (!checkCloudFunction(funcName)) {
        error(`${funcName} 修复失败`)
        allGood = false
      }
    }
  })
  
  log('\n==================')
  if (allGood) {
    success('所有云函数检查通过！')
    log('\n部署步骤:')
    log('1. 打开微信开发者工具')
    log('2. 右键点击每个云函数文件夹')
    log('3. 选择"上传并部署：云端安装依赖"')
    log('\n建议先部署 test 函数进行测试')
  } else {
    error('存在问题的云函数，请检查上述错误')
  }
  
  log('\n如果仍然部署失败，请参考 FIX_DEPLOYMENT_ISSUE.md')
}

if (require.main === module) {
  main()
}

module.exports = {
  checkCloudFunction,
  fixCloudFunction
}