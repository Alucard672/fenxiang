// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { title, description, coverFileId, imageFileIds, tags, gradient } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!title || !Array.isArray(imageFileIds) || imageFileIds.length === 0) {
    return { errCode: 400, errMsg: '参数不完整' }
  }

  const now = new Date()
  const workData = {
    openid,
    title,
    description,
    cover: coverFileId || imageFileIds[0],
    images: imageFileIds,
    tags: Array.isArray(tags) ? tags : [],
    badgeCount: imageFileIds.length,
    gradient: gradient || null,
    createdAt: now,
    updatedAt: now
  }

  try {
    const res = await db.collection('works').add({ data: workData })
    return { errCode: 0, errMsg: 'ok', workId: res._id }
  } catch (e) {
    return { errCode: 500, errMsg: '创建作品失败', detail: e }
  }
}