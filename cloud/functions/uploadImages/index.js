// 云函数：批量上传图片至云存储
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { files } = event // files 为 base64 或云存储临时路径数组
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!Array.isArray(files) || files.length === 0 || files.length > 20) {
    return { errCode: 400, errMsg: '文件数量错误' }
  }

  const result = []

  for (let i = 0; i < files.length; i++) {
    try {
      const uploadRes = await cloud.uploadFile({
        cloudPath: `images/${openid}_${Date.now()}_${i}.jpg`,
        fileContent: Buffer.from(files[i], 'base64')
      })
      result.push(uploadRes.fileID)
    } catch (e) {
      result.push({ err: `第${i+1}张上传失败`, detail: e })
    }
  }

  const success = result.filter(r => typeof r === 'string')
  const fail = result.filter(r => typeof r !== 'string')

  return {
    errCode: 0,
    errMsg: 'ok',
    success,
    fail,
    total: files.length,
    uploadedCount: success.length
  }
}