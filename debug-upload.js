
// 增强的图片上传函数
async uploadImages(images = [], workId) {
  if (!images || !images.length) return []
  
  console.log('开始上传图片:', images.length, '张')
  console.log('工作ID:', workId)
  
  const uploads = images.map(async (path, index) => {
    try {
      if (!path || /^cloud:\/\//.test(path)) {
        console.log(`图片 ${index} 已经是云存储路径: ${path}`)
        return path
      }
      
      console.log(`开始上传图片 ${index}: ${path}`)
      
      const extMatch = path.match(/\.[^./]+$/)
      const ext = extMatch ? extMatch[0] : '.jpg'
      const cloudPath = `works/${workId}/${Date.now()}_${index}_${Math.random().toString(36).slice(2)}${ext}`
      
      console.log(`上传路径: ${cloudPath}`)
      
      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath: path
      })
      
      console.log(`图片 ${index} 上传成功: ${res.fileID}`)
      return res.fileID
    } catch (error) {
      console.error(`图片 ${index} 上传失败:`, error)
      wx.showToast({
        title: `图片${index + 1}上传失败`,
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
}
