// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, ...params } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    switch (action) {
      case 'list':
        return await listWorks(params, openid)
      case 'get':
        return await getWork(params, openid)
      case 'create':
        return await createWork(params, openid)
      case 'update':
        return await updateWork(params, openid)
      case 'delete':
        return await deleteWork(params, openid)
      case 'search':
        return await searchWorks(params, openid)
      default:
        return {
          success: false,
          error: '不支持的操作'
        }
    }
  } catch (error) {
    console.error('作品管理错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取单个作品详情
async function getWork({ _id }, openid) {
  if (!_id) {
    return {
      success: false,
      error: '作品ID不能为空'
    }
  }

  const result = await db.collection('works')
    .where({
      _id,
      _openid: openid
    })
    .limit(1)
    .get()

  if (!result.data.length) {
    return {
      success: false,
      error: '作品不存在'
    }
  }

  return {
    success: true,
    data: result.data[0]
  }
}

// 获取作品列表
async function listWorks({ page = 1, limit = 20, tag, sortBy = 'createTime', sortOrder = 'desc' }, openid) {
  const skip = (page - 1) * limit
  let query = db.collection('works').where({
    _openid: openid
  })

  // 标签过滤
  if (tag && tag !== '全部') {
    query = query.where({
      tags: tag
    })
  }

  // 排序
  const sort = {}
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1

  // 执行查询
  const countResult = await query.count()
  const listResult = await query
    .orderBy(sortBy, sortOrder)
    .skip(skip)
    .limit(limit)
    .get()

  return {
    success: true,
    data: {
      list: listResult.data,
      total: countResult.total,
      page,
      limit
    }
  }
}

// 创建作品
async function createWork({ title, description, tags = [], images = [], cover = '', customFields = {} }, openid) {
  const sanitizedTags = sanitizeTags(tags)
  const workData = {
    title: title.trim(),
    description: description.trim(),
    tags: sanitizedTags,
    images,
    cover,
    customFields,
    createTime: new Date(),
    updateTime: new Date(),
    _openid: openid
  }

  const result = await db.collection('works').add({
    data: workData
  })

  return {
    success: true,
    data: {
      _id: result._id,
      ...workData
    }
  }
}

// 更新作品
async function updateWork({ _id, title, description, tags, images, cover, customFields }, openid) {
  const updateData = {
    updateTime: new Date()
  }

  if (title !== undefined) updateData.title = title.trim()
  if (description !== undefined) updateData.description = description.trim()
  if (tags !== undefined) updateData.tags = sanitizeTags(tags)
  if (images !== undefined) updateData.images = images
  if (cover !== undefined) updateData.cover = cover
  if (customFields !== undefined) updateData.customFields = customFields

  const result = await db.collection('works')
    .where({
      _id,
      _openid: openid
    })
    .update({
      data: updateData
    })

  return {
    success: true,
    data: {
      updated: result.stats.updated
    }
  }
}

// 删除作品
async function deleteWork({ _id }, openid) {
  const result = await db.collection('works')
    .where({
      _id,
      _openid: openid
    })
    .remove()

  return {
    success: true,
    data: {
      deleted: result.stats.removed
    }
  }
}

// 搜索作品
async function searchWorks({ keyword, page = 1, limit = 20 }, openid) {
  if (!keyword || keyword.trim() === '') {
    return {
      success: false,
      error: '搜索关键词不能为空'
    }
  }

  const skip = (page - 1) * limit
  const searchRegex = new RegExp(keyword.trim(), 'i')

  const countResult = await db.collection('works')
    .where({
      _openid: openid,
      $or: [
        { title: db.RegExp({
          regexp: keyword.trim(),
          options: 'i'
        })},
        { description: db.RegExp({
          regexp: keyword.trim(),
          options: 'i'
        })}
      ]
    })
    .count()

  const listResult = await db.collection('works')
    .where({
      _openid: openid,
      $or: [
        { title: db.RegExp({
          regexp: keyword.trim(),
          options: 'i'
        })},
        { description: db.RegExp({
          regexp: keyword.trim(),
          options: 'i'
        })}
      ]
    })
    .orderBy('createTime', 'desc')
    .skip(skip)
    .limit(limit)
    .get()

  return {
    success: true,
    data: {
      list: listResult.data,
      total: countResult.total,
      page,
      limit,
      keyword
    }
  }
}

function sanitizeTags(tags = []) {
  if (!Array.isArray(tags)) return []
  const seen = new Set()

  return tags
    .map((tag, index) => {
      if (!tag) return null

      if (typeof tag === 'string') {
        const name = tag.trim()
        if (!name) return null
        return {
          _id: `tag_${index}_${name}`,
          name,
          color: '#1F2937',
          background: '#F3F4F6'
        }
      }

      if (typeof tag === 'object') {
        const name = String(tag.name || tag.label || tag.text || tag.value || '').trim()
        if (!name) return null
        const id = tag._id || tag.id || `tag_${index}_${name}`
        return {
          _id: id,
          name,
          color: tag.color || '#1F2937',
          background: tag.background || '#F3F4F6'
        }
      }

      return null
    })
    .filter(tag => {
      if (!tag) return false
      if (seen.has(tag._id)) return false
      seen.add(tag._id)
      return true
    })
}