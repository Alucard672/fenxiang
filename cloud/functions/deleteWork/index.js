// 云函数：删除作品（级联删除云存储图片）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { workId } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!workId) {
    return { errCode: 400, errMsg: '缺少 workId' }
  }

  try {
    // 查询作品信息
    const workRes = await db.collection('works')
      .where({ _id: workId, openid })
      .field({ cover: 1, images: 1 })
      .get()

    if (workRes.data.length === 0) {
      return { errCode: 404, errMsg: '作品不存在或无权限' }
    }

    const work = workRes.data[0]
    const filesToDelete = [work.cover, ...work.images]

    // 删除云存储文件
    await Promise.allSettled(
      filesToDelete.map(fileId => cloud.deleteFile({ fileList: [fileId] }))
    )

    // 删除数据库记录
    const delRes = await db.collection('works')
      .where({ _id: workId, openid })
      .remove()

    return { errCode: 0, errMsg: 'ok', deletedCount: delRes.stats.removed }
  } catch (e) {
    return { errCode: 500, errMsg: '删除失败', detail: e }
  }
}