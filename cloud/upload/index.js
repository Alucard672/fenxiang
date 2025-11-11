// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, ...params } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    switch (action) {
      case 'getUploadURL':
        return await getUploadURL(params, openid)
      case 'deleteFile':
        return await deleteFile(params, openid)
      case 'getFileInfo':
        return await getFileInfo(params, openid)
      case 'batchDeleteFiles':
        return await batchDeleteFiles(params, openid)
      default:
        return {
          success: false,
          error: '不支持的操作'
        }
    }
  } catch (error) {
    console.error('文件上传错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取文件上传链接
async function getUploadURL({ fileName, fileType = 'image' }, openid) {
  try {
    // 生成唯一文件名
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = fileName.split('.').pop()
    const cloudFileName = `${fileType}/${openid}/${timestamp}_${random}.${extension}`

    // 获取上传链接
    const result = await cloud.getTempFileURL({
      fileList: [{
        fileID: cloudFileName,
        maxAge: 60 * 60 // 1小时有效期
      }]
    })

    if (result.fileList && result.fileList.length > 0) {
      return {
        success: true,
        data: {
          fileID: cloudFileName,
          tempFileURL: result.fileList[0].tempFileURL,
          uploadURL: result.fileList[0].tempFileURL, // 前端需要使用这个URL上传
          fileName: cloudFileName
        }
      }
    } else {
      return {
        success: false,
        error: '获取上传链接失败'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `获取上传链接失败: ${error.message}`
    }
  }
}

// 删除文件
async function deleteFile({ fileID }, openid) {
  try {
    // 检查文件权限
    if (!fileID.includes(openid)) {
      return {
        success: false,
        error: '无权限删除此文件'
      }
    }

    const result = await cloud.deleteFile({
      fileList: [fileID]
    })

    return {
      success: true,
      data: {
        deleted: result.fileList && result.fileList.length > 0 ? 
          result.fileList[0].status === 'success' : false
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `删除文件失败: ${error.message}`
    }
  }
}

// 获取文件信息
async function getFileInfo({ fileID }, openid) {
  try {
    // 检查文件权限
    if (!fileID.includes(openid)) {
      return {
        success: false,
        error: '无权限访问此文件'
      }
    }

    const result = await cloud.getTempFileURL({
      fileList: [fileID]
    })

    if (result.fileList && result.fileList.length > 0) {
      const fileInfo = result.fileList[0]
      return {
        success: true,
        data: {
          fileID,
          tempFileURL: fileInfo.tempFileURL,
          status: fileInfo.status,
          maxAge: fileInfo.maxAge
        }
      }
    } else {
      return {
        success: false,
        error: '文件不存在或已过期'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `获取文件信息失败: ${error.message}`
    }
  }
}

// 批量删除文件
async function batchDeleteFiles({ fileIDs }, openid) {
  try {
    // 检查文件权限
    const unauthorizedFiles = fileIDs.filter(fileID => !fileID.includes(openid))
    if (unauthorizedFiles.length > 0) {
      return {
        success: false,
        error: `无权限删除部分文件: ${unauthorizedFiles.join(', ')}`
      }
    }

    const result = await cloud.deleteFile({
      fileList: fileIDs
    })

    const deletedFiles = result.fileList
      .filter(file => file.status === 'success')
      .map(file => file.fileID)

    return {
      success: true,
      data: {
        total: fileIDs.length,
        deleted: deletedFiles.length,
        deletedFiles,
        failedFiles: fileIDs.filter(id => !deletedFiles.includes(id))
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `批量删除文件失败: ${error.message}`
    }
  }
}