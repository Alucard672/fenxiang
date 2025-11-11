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
        return await listTags(params, openid)
      case 'create':
        return await createTag(params, openid)
      case 'update':
        return await updateTag(params, openid)
      case 'delete':
        return await deleteTag(params, openid)
      case 'getUsage':
        return await getTagUsage(params, openid)
      default:
        return {
          success: false,
          error: '不支持的操作'
        }
    }
  } catch (error) {
    console.error('标签管理错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取标签列表
async function listTags({ page = 1, limit = 50 }, openid) {
  const skip = (page - 1) * limit

  // 获取标签列表
  const tagsResult = await db.collection('tags')
    .where({
      _openid: openid
    })
    .orderBy('createTime', 'desc')
    .skip(skip)
    .limit(limit)
    .get()

  // 获取每个标签的使用次数
  const tagsWithUsage = await Promise.all(
    tagsResult.data.map(async (tag) => {
      const usageCount = await db.collection('works')
        .where({
          _openid: openid,
          tags: tag.name
        })
        .count()

      return {
        ...tag,
        usageCount: usageCount.total
      }
    })
  )

  // 获取总数
  const countResult = await db.collection('tags')
    .where({
      _openid: openid
    })
    .count()

  return {
    success: true,
    data: {
      list: tagsWithUsage,
      total: countResult.total,
      page,
      limit
    }
  }
}

// 创建标签
async function createTag({ name, color, description = '' }, openid) {
  // 检查标签名是否已存在
  const existingTag = await db.collection('tags')
    .where({
      _openid: openid,
      name: name.trim()
    })
    .get()

  if (existingTag.data.length > 0) {
    return {
      success: false,
      error: '标签名已存在'
    }
  }

  const tagData = {
    name: name.trim(),
    color: color || '#007AFF',
    description: description.trim(),
    createTime: new Date(),
    updateTime: new Date(),
    _openid: openid
  }

  const result = await db.collection('tags').add({
    data: tagData
  })

  return {
    success: true,
    data: {
      _id: result._id,
      ...tagData,
      usageCount: 0
    }
  }
}

// 更新标签
async function updateTag({ _id, name, color, description }, openid) {
  const updateData = {
    updateTime: new Date()
  }

  if (name !== undefined) updateData.name = name.trim()
  if (color !== undefined) updateData.color = color
  if (description !== undefined) updateData.description = description.trim()

  // 如果更新名称，检查是否重复
  if (name !== undefined) {
    const existingTag = await db.collection('tags')
      .where({
        _openid: openid,
        name: name.trim(),
        _id: _.neq(_id)
      })
      .get()

    if (existingTag.data.length > 0) {
      return {
        success: false,
        error: '标签名已存在'
      }
    }
  }

  const result = await db.collection('tags')
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

// 删除标签
async function deleteTag({ _id }, openid) {
  // 检查标签是否被使用
  const tagResult = await db.collection('tags')
    .where({
      _id,
      _openid: openid
    })
    .get()

  if (tagResult.data.length === 0) {
    return {
      success: false,
      error: '标签不存在'
    }
  }

  const tagName = tagResult.data[0].name
  const usageCount = await db.collection('works')
    .where({
      _openid: openid,
      tags: tagName
    })
    .count()

  if (usageCount.total > 0) {
    return {
      success: false,
      error: `该标签被 ${usageCount.total} 个作品使用，无法删除`
    }
  }

  const result = await db.collection('tags')
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

// 获取标签使用情况
async function getTagUsage({ _id }, openid) {
  const tagResult = await db.collection('tags')
    .where({
      _id,
      _openid: openid
    })
    .get()

  if (tagResult.data.length === 0) {
    return {
      success: false,
      error: '标签不存在'
    }
  }

  const tagName = tagResult.data[0].name
  
  // 获取使用该标签的作品
  const worksResult = await db.collection('works')
    .where({
      _openid: openid,
      tags: tagName
    })
    .orderBy('createTime', 'desc')
    .limit(10)
    .get()

  return {
    success: true,
    data: {
      tag: tagResult.data[0],
      usageCount: worksResult.data.length,
      recentWorks: worksResult.data
    }
  }
}