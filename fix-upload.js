const fs = require('fs')
const path = require('path')

// 读取detail.js文件
const detailJsPath = path.join(__dirname, 'miniprogram/pages/detail/detail.js')
let content = fs.readFileSync(detailJsPath, 'utf8')

// 找到uploadImages函数并替换
const oldFunction = /async uploadImages\(images = \[\], workId\) \{[\s\S]*?return Promise\.all\(uploads\)[\s\S]*?\}/
const newFunction = `async uploadImages(images = [], workId) {
    if (!images || !images.length) return []
    
    console.log('开始上传图片:', images.length, '张')
    console.log('工作ID:', workId)
    
    const uploads = images.map(async (path, index) => {
      try {
        if (!path || /^cloud:\\/\\//.test(path)) {
          console.log(\`图片 \${index} 已经是云存储路径: \${path}\`)
          return path
        }
        
        console.log(\`开始上传图片 \${index}: \${path}\`)
        
        const extMatch = path.match(/\\.[^./]+$/)
        const ext = extMatch ? extMatch[0] : '.jpg'
        const cloudPath = \`works/\${workId}/\${Date.now()}_\${index}_\${Math.random().toString(36).slice(2)}\${ext}\`
        
        console.log(\`上传路径: \${cloudPath}\`)
        
        const res = await wx.cloud.uploadFile({
          cloudPath,
          filePath: path
        })
        
        console.log(\`图片 \${index} 上传成功: \${res.fileID}\`)
        return res.fileID
      } catch (error) {
        console.error(\`图片 \${index} 上传失败:\`, error)
        wx.showToast({
          title: \`图片\${index + 1}上传失败\`,
          icon: 'none'
        })
        throw error
      }
    })
    
    try {
      const results = await Promise.all(uploads)
      console.log('所有图片上传完成:', results)
      return results
    } catch (error) {
      console.error('图片上传过程中出错:', error)
      throw error
    }
  }`

if (oldFunction.test(content)) {
  content = content.replace(oldFunction, newFunction)
  fs.writeFileSync(detailJsPath, content)
  console.log('✓ 成功修复uploadImages函数，添加了详细的日志和错误处理')
} else {
  console.log('✗ 未找到uploadImages函数，可能文件已被修改')
  console.log('请手动检查文件内容')
}

// 同时在saveWork函数中添加更多日志
const saveWorkPattern = /(async saveWork\(\) \{[\s\S]*?)if \(needUpload\) \{([\s\S]*?)const uploaded = await this\.uploadImages\(payloadImages, baseId\)/
if (saveWorkPattern.test(content)) {
  content = content.replace(saveWorkPattern, (match, before, middle) => {
    return before + `if (needUpload) {
        console.log('检测到需要上传的图片:', payloadImages)
        console.log('使用基础ID:', baseId)` + middle + `console.log('开始上传图片到云端...')
        const uploaded = await this.uploadImages(payloadImages, baseId)`
  })
  fs.writeFileSync(detailJsPath, content)
  console.log('✓ 成功为saveWork函数添加详细日志')
}

console.log('\n修复完成！')
console.log('现在上传图片时会有详细的控制台日志，帮助诊断问题。')