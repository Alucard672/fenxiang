// 云函数：更新作品信息
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { workId, title, description, tags, gradient } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!workId) {
    return { errCode: 400, errMsg: '缺少 workId' }
  }

  const updateData = { updatedAt: new Date() }
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (Array.isArray(tags)) updateData.tags = tags
  if (gradient !== undefined) updateData.gradient = gradient

  try {
    const res = await db.collection('works')
      .where({ _id: workId, openid })
      .update({ data: updateData })

    if (res.stats.updated === 0) {
      return { errCode: 404, errMsg: '作品不存在或无权限' }
    }

    return { errCode: 0, errMsg: 'ok' }
  } catch (e) {
    return { errCode: 500, errMsg: '更新失败', detail: e }
  }
}