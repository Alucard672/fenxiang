#!/usr/bin/env node

/**
 * 云作品分享小程序 - 自动化测试脚本
 * 测试云函数功能和前端页面
 */

const fs = require('fs')
const path = require('path')

// 测试配置
const TEST_CONFIG = {
  projectPath: __dirname,
  miniprogramPath: path.join(__dirname, 'miniprogram'),
  cloudFunctionsPath: path.join(__dirname, 'cloud/functions'),
  pages: ['myworks', 'tags', 'customfields', 'detail', 'create'],
  cloudFunctions: ['works', 'system']
}

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
}

// 日志工具
function log(level, message) {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  console.log(`${prefix} ${message}`)
}

function success(message) {
  log('success', message)
  testResults.passed++
  testResults.total++
}

function error(message) {
  log('error', message)
  testResults.failed++
  testResults.total++
}

function info(message) {
  log('info', message)
}

// 测试文件是否存在
function testFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description}: ✓ ${filePath}`)
    return true
  } else {
    error(`${description}: ✗ ${filePath}`)
    return false
  }
}

// 测试云函数结构
function testCloudFunctions() {
  info('开始测试云函数结构...')
  
  TEST_CONFIG.cloudFunctions.forEach(funcName => {
    const funcPath = path.join(TEST_CONFIG.cloudFunctionsPath, funcName)
    testFileExists(funcPath, `云函数目录: ${funcName}`)
    testFileExists(path.join(funcPath, 'index.js'), `云函数入口: ${funcName}/index.js`)
    testFileExists(path.join(funcPath, 'package.json'), `云函数配置: ${funcName}/package.json`)
  })
}

// 测试前端页面结构
function testPages() {
  info('开始测试前端页面结构...')
  
  TEST_CONFIG.pages.forEach(pageName => {
    const pagePath = path.join(TEST_CONFIG.miniprogramPath, 'pages', pageName)
    testFileExists(pagePath, `页面目录: ${pageName}`)
    testFileExists(path.join(pagePath, `${pageName}.js`), `页面JS: ${pageName}.js`)
    testFileExists(path.join(pagePath, `${pageName}.wxml`), `页面WXML: ${pageName}.wxml`)
    testFileExists(path.join(pagePath, `${pageName}.wxss`), `页面样式: ${pageName}.wxss`)
    testFileExists(path.join(pagePath, `${pageName}.json`), `页面配置: ${pageName}.json`)
  })
}

// 测试云函数代码质量
function testCloudFunctionCode() {
  info('开始测试云函数代码质量...')
  
  TEST_CONFIG.cloudFunctions.forEach(funcName => {
    const jsPath = path.join(TEST_CONFIG.cloudFunctionsPath, funcName, 'index.js')
    
    if (fs.existsSync(jsPath)) {
      const content = fs.readFileSync(jsPath, 'utf8')
      
      // 检查必要的关键代码
      const checks = [
        { pattern: /wx-server-sdk/, message: '引入wx-server-sdk' },
        { pattern: /cloud\.init/, message: '初始化云开发' },
        { pattern: /exports\.main/, message: '导出main函数' },
        { pattern: /try.*catch/, message: '错误处理' },
        { pattern: /errCode/, message: '错误码返回' }
      ]
      
      checks.forEach(check => {
        if (check.pattern.test(content)) {
          success(`${funcName}: ✓ ${check.message}`)
        } else {
          error(`${funcName}: ✗ ${check.message}`)
        }
      })
    }
  })
}

// 测试前端代码质量
function testPageCode() {
  info('开始测试前端代码质量...')
  
  TEST_CONFIG.pages.forEach(pageName => {
    const jsPath = path.join(TEST_CONFIG.miniprogramPath, 'pages', pageName, `${pageName}.js`)
    
    if (fs.existsSync(jsPath)) {
      const content = fs.readFileSync(jsPath, 'utf8')
      
      // 检查必要的关键代码
      const checks = [
        { pattern: /Page\(/, message: 'Page()结构' },
        { pattern: /data\s*:/, message: 'data对象' },
        { pattern: /onLoad/, message: 'onLoad生命周期' }
      ]
      
      checks.forEach(check => {
        if (check.pattern.test(content)) {
          success(`${pageName}: ✓ ${check.message}`)
        } else {
          error(`${pageName}: ✗ ${check.message}`)
        }
      })
    }
  })
}

// 测试项目配置文件
function testProjectConfig() {
  info('开始测试项目配置文件...')
  
  const configFiles = [
    { path: 'project.config.json', desc: '项目配置' },
    { path: 'app.js', desc: '应用入口' },
    { path: 'app.wxss', desc: '全局样式' },
    { path: 'sitemap.json', desc: '站点地图' }
  ]
  
  configFiles.forEach(config => {
    testFileExists(path.join(TEST_CONFIG.projectPath, config.path), config.desc)
  })
}

// 测试资源文件
function testAssets() {
  info('开始测试资源文件...')
  
  const assetsPath = path.join(TEST_CONFIG.projectPath, 'assets')
  
  if (fs.existsSync(assetsPath)) {
    success('资源目录存在: ✓ /assets')
    
    // 检查图片文件
    const images = fs.readdirSync(assetsPath).filter(file => 
      /\.(png|jpg|jpeg|svg|gif)$/i.test(file)
    )
    
    if (images.length > 0) {
      success(`图片文件: ✓ ${images.length}个`)
    } else {
      error('图片文件: ✗ 没有找到图片文件')
    }
  } else {
    error('资源目录不存在: ✗ /assets')
  }
}

// 测试数据库集合设计
function testDatabaseDesign() {
  info('开始测试数据库集合设计...')
  
  const collectionsPath = path.join(TEST_CONFIG.projectPath, 'cloud/collections.md')
  
  if (fs.existsSync(collectionsPath)) {
    success('数据库设计文档: ✓ collections.md')
    
    const content = fs.readFileSync(collectionsPath, 'utf8')
    
    // 检查必要的集合
    const requiredCollections = ['works', 'users', 'tags', 'customFields']
    requiredCollections.forEach(collection => {
      if (content.includes(collection)) {
        success(`集合设计: ✓ ${collection}`)
      } else {
        error(`集合设计: ✗ ${collection}`)
      }
    })
  } else {
    error('数据库设计文档: ✗ collections.md')
  }
}

// 生成测试报告
function generateReport() {
  info('\n========== 测试报告 ==========')
  info(`总测试数: ${testResults.total}`)
  success(`通过: ${testResults.passed}`)
  error(`失败: ${testResults.failed}`)
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1)
  info(`成功率: ${successRate}%`)
  
  if (testResults.failed === 0) {
    success('🎉 所有测试通过！项目质量良好。')
  } else {
    error('❌ 存在测试失败，请检查相关问题。')
  }
  
  info('================================\n')
}

// 主测试函数
async function runTests() {
  info('开始执行自动化测试...')
  info(`测试项目: ${TEST_CONFIG.projectPath}`)
  
  testProjectConfig()
  testPages()
  testAssets()
  testCloudFunctions()
  testCloudFunctionCode()
  testPageCode()
  testDatabaseDesign()
  
  generateReport()
  
  // 返回退出码
  process.exit(testResults.failed > 0 ? 1 : 0)
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(error => {
    error(`测试执行失败: ${error.message}`)
    process.exit(1)
  })
}

module.exports = {
  runTests,
  testResults
}