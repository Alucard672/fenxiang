// 云函数：全局/标签搜索
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 20

exports.main = async (event, context) => {
  const { keyword, tags, page = 1, pageSize = 10 } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const skip = (page - 1) * Math.min(pageSize, MAX_LIMIT)
  const limit = Math.min(pageSize, MAX_LIMIT)

  let query = {}
  if (keyword && typeof keyword === 'string') {
    query.title = db.RegExp({ regexp: keyword, options: 'i' })
  }
  if (Array.isArray(tags) && tags.length > 0) {
    query.tags = _.in(tags)
  }

  try {
    const countResult = await db.collection('works').where(query).count()
    const total = countResult.total

    const listResult = await db.collection('works')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .field({
        _id: 1,
        title: 1,
        cover: 1,
        tags: 1,
        badgeCount: 1,
        gradient: 1,
        createdAt: 1
      })
      .get()

    return {
      errCode: 0,
      errMsg: 'ok',
      list: listResult.data,
      total,
      page,
      pageSize: limit
    }
  } catch (e) {
    return { errCode: 500, errMsg: '搜索失败', detail: e }
  }
}