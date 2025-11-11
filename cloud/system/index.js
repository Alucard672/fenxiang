// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const DEFAULT_TAGS = [
  {
    _id: 'default_brand',
    name: '品牌设计',
    color: '#2563EB',
    background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    sortOrder: 0
  },
  {
    _id: 'default_ui',
    name: 'UI设计',
    color: '#7C3AED',
    background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
    sortOrder: 1
  },
  {
    _id: 'default_web',
    name: '网页设计',
    color: '#059669',
    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    sortOrder: 2
  },
  {
    _id: 'default_ecommerce',
    name: '电商运营',
    color: '#EA580C',
    background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
    sortOrder: 3
  },
  {
    _id: 'default_visual',
    name: '视觉创意',
    color: '#DB2777',
    background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
    sortOrder: 4
  },
  {
    _id: 'default_other',
    name: '其它',
    color: '#1F2937',
    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
    sortOrder: 5
  }
]

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, ...params } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    switch (action) {
      case 'listCustomFields':
        return await listCustomFields(params, openid)
      case 'createCustomField':
        return await createCustomField(params, openid)
      case 'updateCustomField':
        return await updateCustomField(params, openid)
      case 'reorderCustomFields':
        return await reorderCustomFields(params, openid)
      case 'deleteCustomField':
        return await deleteCustomField(params, openid)
      case 'listTags':
        return await listTags(params, openid)
      case 'getUserProfile':
        return await getUserProfile(params, openid)
      case 'updateUserProfile':
        return await updateUserProfile(params, openid)
      case 'getSystemStats':
        return await getSystemStats(params, openid)
      default:
        return {
          success: false,
          error: '不支持的操作'
        }
    }
  } catch (error) {
    console.error('系统管理错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取自定义字段列表
async function listCustomFields({ page = 1, limit = 50 }, openid) {
  const skip = (page - 1) * limit

  const countResult = await db.collection('customFields')
    .where({
      _openid: openid
    })
    .count()

  const listQuery = db.collection('customFields')
    .where({
      _openid: openid
    })

  let listResult

  try {
    listResult = await listQuery
      .orderBy('sortOrder', 'asc')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get()
  } catch (error) {
    // sortOrder 字段不存在时回退到 createTime
    listResult = await listQuery
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get()
  }

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

// 创建自定义字段
async function createCustomField({ name, type, options = [], required = false, description = '', icon = '', color = '', colorObj = {}, sortOrder }, openid) {
  // 检查字段名是否已存在
  const existingField = await db.collection('customFields')
    .where({
      _openid: openid,
      name: name.trim()
    })
    .get()

  if (existingField.data.length > 0) {
    return {
      success: false,
      error: '字段名已存在'
    }
  }

  const fieldData = {
    name: name.trim(),
    type,
    options,
    required,
    description: description.trim(),
    icon: icon || '',
    color: color || '',
    colorObj,
    sortOrder: typeof sortOrder === 'number' ? sortOrder : Date.now(),
    createTime: new Date(),
    updateTime: new Date(),
    _openid: openid
  }

  const result = await db.collection('customFields').add({
    data: fieldData
  })

  return {
    success: true,
    data: {
      _id: result._id,
      ...fieldData
    }
  }
}

// 更新自定义字段
async function updateCustomField({ _id, name, type, options, required, description, icon, color, colorObj, sortOrder }, openid) {
  const updateData = {
    updateTime: new Date()
  }

  if (name !== undefined) updateData.name = name.trim()
  if (type !== undefined) updateData.type = type
  if (options !== undefined) updateData.options = options
  if (required !== undefined) updateData.required = required
  if (description !== undefined) updateData.description = description.trim()
  if (icon !== undefined) updateData.icon = icon
  if (color !== undefined) updateData.color = color
  if (colorObj !== undefined) updateData.colorObj = colorObj
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder

  // 如果更新名称，检查是否重复
  if (name !== undefined) {
    const existingField = await db.collection('customFields')
      .where({
        _openid: openid,
        name: name.trim(),
        _id: _.neq(_id)
      })
      .get()

    if (existingField.data.length > 0) {
      return {
        success: false,
        error: '字段名已存在'
      }
    }
  }

  const result = await db.collection('customFields')
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

// 批量更新自定义字段排序
async function reorderCustomFields({ orders = [] }, openid) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return {
      success: false,
      error: '排序数据不能为空'
    }
  }

  const batch = []

  orders.forEach(({ _id, sortOrder }, index) => {
    if (_id) {
      batch.push(
        db.collection('customFields')
          .where({
            _id,
            _openid: openid
          })
          .update({
            data: {
              sortOrder: typeof sortOrder === 'number' ? sortOrder : index,
              updateTime: new Date()
            }
          })
      )
    }
  })

  await Promise.all(batch)

  return {
    success: true,
    data: {
      updated: batch.length
    }
  }
}

// 删除自定义字段
async function deleteCustomField({ _id }, openid) {
  // 检查字段是否被使用
  const fieldResult = await db.collection('customFields')
    .where({
      _id,
      _openid: openid
    })
    .get()

  if (fieldResult.data.length === 0) {
    return {
      success: false,
      error: '字段不存在'
    }
  }

  const fieldName = fieldResult.data[0].name
  
  // 检查是否有作品使用了这个字段
  const worksResult = await db.collection('works')
    .where({
      _openid: openid,
      [`customFields.${fieldName}`]: _.exists(true)
    })
    .limit(1)
    .get()

  if (worksResult.data.length > 0) {
    return {
      success: false,
      error: '该字段被作品使用，无法删除'
    }
  }

  const result = await db.collection('customFields')
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

async function listTags({ page = 1, limit = 100 } = {}, openid) {
  const skip = (page - 1) * limit

  const tagsCollection = db.collection('tags').where({
    _openid: openid
  })

  let countResult
  try {
    countResult = await tagsCollection.count()
  } catch (error) {
    countResult = { total: 0 }
  }

  let list = []

  if (countResult.total > 0) {
    try {
      const listResult = await tagsCollection
        .orderBy('sortOrder', 'asc')
        .orderBy('createTime', 'desc')
        .skip(skip)
        .limit(limit)
        .get()

      list = (listResult.data || []).map((item, index) => ({
        _id: item._id,
        name: item.name || '',
        color: item.color || '#1F2937',
        background: item.background || '#F3F4F6',
        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index
      })).filter(tag => tag.name)
    } catch (error) {
      console.warn('加载用户标签失败，使用默认标签:', error)
    }
  }

  if (!list.length) {
    list = DEFAULT_TAGS.map((tag, index) => ({
      ...tag,
      sortOrder: typeof tag.sortOrder === 'number' ? tag.sortOrder : index
    }))
  }

  return {
    success: true,
    data: {
      list,
      total: countResult.total || list.length,
      page,
      limit
    }
  }
}

// 获取用户资料
async function getUserProfile({}, openid) {
  const userResult = await db.collection('users')
    .where({
      _openid: openid
    })
    .get()

  if (userResult.data.length === 0) {
    // 创建用户资料
    const userData = {
      nickName: '',
      avatarUrl: '',
      createTime: new Date(),
      updateTime: new Date(),
      _openid: openid
    }

    const result = await db.collection('users').add({
      data: userData
    })

    return {
      success: true,
      data: {
        _id: result._id,
        ...userData
      }
    }
  }

  return {
    success: true,
    data: userResult.data[0]
  }
}

// 更新用户资料
async function updateUserProfile({ nickName, avatarUrl }, openid) {
  const updateData = {
    updateTime: new Date()
  }

  if (nickName !== undefined) updateData.nickName = nickName.trim()
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim()

  const result = await db.collection('users')
    .where({
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

// 获取系统统计
async function getSystemStats({}, openid) {
  const [
    worksCount,
    tagsCount,
    fieldsCount
  ] = await Promise.all([
    db.collection('works').where({ _openid: openid }).count(),
    db.collection('tags').where({ _openid: openid }).count(),
    db.collection('customFields').where({ _openid: openid }).count()
  ])

  return {
    success: true,
    data: {
      works: worksCount.total,
      tags: tagsCount.total,
      customFields: fieldsCount.total
    }
  }
}