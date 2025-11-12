const DISPLAY_FIELD_STORAGE_KEY = 'detail_display_fields'
const DEV_TEMP_PATTERN = /__tmp__|127\.0\.0\.1/i
const TAG_FALLBACKS = [
  {
    _id: 'default_brand',
    name: '品牌设计',
    color: '#2563EB',
    background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
  },
  {
    _id: 'default_ui',
    name: 'UI设计',
    color: '#7C3AED',
    background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
  },
  {
    _id: 'default_web',
    name: '网页设计',
    color: '#059669',
    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
  },
  {
    _id: 'default_ecommerce',
    name: '电商运营',
    color: '#EA580C',
    background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)'
  },
  {
    _id: 'default_visual',
    name: '视觉创意',
    color: '#DB2777',
    background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)'
  },
  {
    _id: 'default_other',
    name: '其它',
    color: '#1F2937',
    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
  }
]

Page({
  data: {
    editMode: false,
    loadingFields: false,
    customFields: [],
    fieldValues: {},
    selectedFieldIds: [],
    displayFields: [],
    availableFields: [],
    showAssetSheet: false,
    showFieldManager: false,
    showTagManager: false,
    tagDisplayList: [],
    allTags: [],
    tagSelection: [],
    maxTagCount: 5,
    loadingTags: false,
    userInfo: {
      name: '云作品小萌新',
      avatarUrl: ''
    },
    layoutSingleColumn: false,
    immersiveMode: false,
    uploadingImages: {}, // 存储上传进度 {index: progress}
    workDetail: {
      id: null,
      tempId: '',
      name: '未命名作品',
      creator: '云作品小萌新',
      images: [],
      cover: '',
      isNew: false,
      createTime: '',
      imagePreviews: [],
      tags: []
    }
  },

  startEdit() {
    if (this.data.editMode) return
    this.closeAssetSheet()
    this.setData({
      editMode: true
    })
    wx.showToast({
      title: '已进入编辑模式',
      icon: 'none',
      duration: 1200
    })
  },

  isInvalidTempPath(path) {
    if (!path || typeof path !== 'string') return true
    return DEV_TEMP_PATTERN.test(path)
  },

  sanitizeImageList(list = []) {
    if (!Array.isArray(list)) return []
    const seen = new Set()
    return list
      .map(item => (typeof item === 'string' ? item.trim() : item))
      .filter(Boolean)
      .filter(item => {
        if (typeof item !== 'string') return false
        if (this.isInvalidTempPath(item)) {
          console.warn('移除无效图片路径:', item)
          return false
        }
        if (seen.has(item)) return false
        seen.add(item)
        return true
      })
  },

  normalizeWorkTags(tags) {
    if (!Array.isArray(tags)) return []
    const seen = new Set()
    return tags
      .map((tag) => {
        if (!tag) return null
        if (typeof tag === 'string') {
          const name = tag.trim()
          if (!name) return null
          const id = name
          if (seen.has(id)) return null
          seen.add(id)
          return {
            _id: id,
            name,
            background: '#EEF2FF',
            color: '#374151'
          }
        }
        if (typeof tag === 'object') {
          const name = String(tag.name || tag.label || tag.text || tag.value || '').trim()
          if (!name) return null
          const id = tag._id || tag.id || name
          if (seen.has(id)) return null
          seen.add(id)
          const background = tag.background || tag.bgColor || (tag.colorObj && tag.colorObj.background) || '#EEF2FF'
          const color =
            tag.color ||
            tag.textColor ||
            (tag.colorObj && tag.colorObj.text) ||
            '#374151'
          return {
            _id: id,
            name,
            background,
            color
          }
        }
        return null
      })
      .filter(Boolean)
  },

  updateTagDisplay(list = []) {
    this.setData({
      tagDisplayList: Array.isArray(list) ? list : []
    })
  },

  async loadTagOptions(force = false) {
    if (this.data.loadingTags) return
    if (!force && this.data.allTags.length) return

    this.setData({ loadingTags: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'system',
        data: {
          action: 'listTags',
          page: 1,
          limit: 200
        }
      })

      if (result?.result?.success) {
        const list = (result.result.data?.list || []).map((item, index) => ({
          _id: item._id || item.id || `tag_${index}`,
          name: item.name || '',
          color: item.color || '#374151',
          background: item.background || '#F3F4F6',
          sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index
        })).filter(tag => tag.name)

        this.setData({
          allTags: list.length ? list : TAG_FALLBACKS
        })
      } else {
        this.setData({
          allTags: TAG_FALLBACKS
        })
      }
    } catch (error) {
      console.error('加载标签失败:', error)
      this.setData({
        allTags: TAG_FALLBACKS
      })
    } finally {
      this.setData({ loadingTags: false })
    }
  },

  hydrateWorkTags(tags = []) {
    if (!Array.isArray(tags)) return []

    const { allTags } = this.data
    const byId = new Map()
    const byName = new Map()

    allTags.forEach(tag => {
      if (tag?._id) byId.set(tag._id, tag)
      if (tag?.name) byName.set(tag.name, tag)
    })

    const seen = new Set()

    return tags
      .map((tag) => {
        if (!tag) return null

        if (typeof tag === 'string') {
          const name = tag.trim()
          if (!name) return null
          const matched = byName.get(name)
          const base = matched || {
            _id: `custom_${index}_${name}`,
            name,
            color: '#374151',
            background: '#F3F4F6'
          }
          return {
            _id: base._id,
            name: base.name,
            color: base.color,
            background: base.background
          }
        }

        if (typeof tag === 'object') {
          const name = String(tag.name || tag.label || tag.text || tag.value || '').trim()
          if (!name) return null
          const id = tag._id || tag.id
          const matched = (id && byId.get(id)) || byName.get(name)
          const color = tag.color || matched?.color || '#374151'
          const background = tag.background || matched?.background || '#F3F4F6'
          const finalId = id || matched?._id || `custom_${index}_${name}`
          return {
            _id: finalId,
            name,
            color,
            background
          }
        }

        return null
      })
      .filter(tag => {
        if (!tag || !tag.name) return false
        if (seen.has(tag._id)) return false
        seen.add(tag._id)
        return true
      })
  },

  syncTagSelection(tags = []) {
    if (!Array.isArray(tags) || !tags.length) {
      this.setData({
        tagSelection: []
      })
      return
    }

    const ids = tags
      .map(tag => (tag && (tag._id || tag.id)) || null)
      .filter(Boolean)

    this.setData({
      tagSelection: [...new Set(ids)]
    })
  },

  buildSelectedTagObjects(ids = []) {
    if (!Array.isArray(ids) || !ids.length) return []

    const { allTags, workDetail } = this.data
    const fallbackMap = new Map()
    ;(workDetail.tags || []).forEach(tag => {
      if (!tag) return
      const tagId = tag._id || tag.id
      if (!tagId) return
      fallbackMap.set(tagId, tag)
    })

    return ids
      .map(id => {
        const matched = allTags.find(item => item._id === id)
        if (matched) {
          return {
            _id: matched._id,
            name: matched.name,
            color: matched.color || '#374151',
            background: matched.background || '#F3F4F6'
          }
        }
        const fallback = fallbackMap.get(id)
        if (fallback) {
          return {
            _id: fallback._id || id,
            name: fallback.name || '',
            color: fallback.color || '#374151',
            background: fallback.background || '#F3F4F6'
          }
        }
        return null
      })
      .filter(tag => tag && tag.name)
  },

  onLoad(options) {
    this.pendingOptions = options || {}
    this.autoOpenTagManager = options?.openTagManager === 'true' || options?.openTagManager === '1'
    const app = getApp()
    if (app?.globalData?.userInfo) {
      const { nickName, name, avatarUrl } = app.globalData.userInfo
      this.setData({
        userInfo: {
          name: name || nickName || '云作品小萌新',
          avatarUrl: avatarUrl || ''
        }
      })
    }
    this.initializePage()
  },

  async initializePage() {
    await Promise.all([
      this.loadCustomFields(),
      this.loadTagOptions()
    ])
    const { id, isNew, name } = this.pendingOptions

    // 清理本地存储中的无效图片数据
    this.cleanupInvalidImages()

    if (id) {
      if (isNew === 'true') {
        this.initNewWork(id, name)
      } else {
        await this.loadWorkDetail(id)
      }
    } else {
      this.initNewWork(`temp_${Date.now()}`, '未命名作品')
    }
  },

  cleanupInvalidImages() {
    try {
      const keys = ['workDetail', 'tempWorkData', 'imageCache']
      keys.forEach(key => {
        const data = wx.getStorageSync(key)
        if (data && typeof data === 'object') {
          let changed = false

          if (Array.isArray(data.images)) {
            const sanitized = this.sanitizeImageList(data.images)
            if (sanitized.length !== data.images.length) {
              data.images = sanitized
              changed = true
            }
          }

          if (Array.isArray(data.imagePreviews)) {
            const sanitizedPreview = this.sanitizeImageList(data.imagePreviews)
            if (sanitizedPreview.length !== data.imagePreviews.length) {
              data.imagePreviews = sanitizedPreview
              changed = true
            }
          }

          if (changed) {
            wx.setStorageSync(key, data)
            console.log(`已清理 ${key} 中的无效图片`)
          }
        }
      })
    } catch (error) {
      console.error('清理无效图片失败:', error)
    }
  },

  async loadCustomFields() {
    // 移除旧图标映射，直接使用 TDesign 图标名称
    this.setData({ loadingFields: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'system',
        data: {
          action: 'listCustomFields',
          page: 1,
          limit: 100
        }
      })

      if (result?.result?.success) {
        const list = (result.result.data.list || []).map((field, index) => ({
          _id: field._id,
          name: field.name,
          icon: field.icon || 'user-1',
          colorObj: field.colorObj || {},
          sortOrder: typeof field.sortOrder === 'number' ? field.sortOrder : index
        }))

        const sorted = list.sort((a, b) => a.sortOrder - b.sortOrder)
        const storedSelection = wx.getStorageSync(DISPLAY_FIELD_STORAGE_KEY) || []
        const validSelection = storedSelection.filter(id => sorted.some(field => field._id === id))
        const fallbackSelection = sorted.slice(0, Math.min(3, sorted.length)).map(field => field._id)
        const selectedFieldIds = validSelection.length ? validSelection : fallbackSelection

        if (!validSelection.length && fallbackSelection.length) {
          wx.setStorageSync(DISPLAY_FIELD_STORAGE_KEY, fallbackSelection)
        }

        this.setData({
          customFields: sorted,
          selectedFieldIds
        }, () => {
          this.refreshDisplayFields()
        })

        wx.setStorageSync('customFields', sorted)
      } else {
        this.setData({ customFields: [] })
      }
    } catch (error) {
      console.error('加载自定义字段失败:', error)
      this.setData({ customFields: [] })
    } finally {
      this.setData({ loadingFields: false })
    }
  },

  buildFieldValueMap(fields = [], existingValues = {}) {
    const values = {}

    fields.forEach(field => {
      const key = field._id || field.name
      let value = ''

      if (existingValues && typeof existingValues === 'object') {
        const matchedById = existingValues[key]
        const matchedByName = existingValues[field.name]
        const matched = matchedById !== undefined ? matchedById : matchedByName

        if (matched && typeof matched === 'object' && matched.value !== undefined) {
          value = String(matched.value).trim()
        } else if (matched !== undefined) {
          value = String(matched).trim()
        }
      }

      values[key] = value
      if (field.name) {
        values[field.name] = value
      }
    })

    return values
  },

  initNewWork(id, name) {
    const decodedName = name ? decodeURIComponent(name) : '未命名作品'
    const fieldValues = this.buildFieldValueMap(this.data.customFields)

    this.setData({
      editMode: true,
      fieldValues,
      tagSelection: [],
      tagDisplayList: [],
      workDetail: {
        ...this.data.workDetail,
        id: null,
        tempId: id,
        name: decodedName,
        images: [],
        cover: '',
        createTime: '',
        isNew: true,
        imagePreviews: [],
        tags: []
      }
    }, () => {
      this.refreshDisplayFields()
      if (this.autoOpenTagManager) {
        this.autoOpenTagManager = false
        this.manageTags()
      }
    })
  },

  async loadWorkDetail(id) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'works',
        data: {
          action: 'get',
          _id: id
        }
      })

      if (result?.result?.success) {
        const work = result.result.data
        const fieldValues = this.buildFieldValueMap(this.data.customFields, work.customFields)
        const images = Array.isArray(work.images)
          ? this.sanitizeImageList(
              work.images.map(img => {
                if (!img) return ''
                if (typeof img === 'string') return img
                if (img && typeof img === 'object' && img.download_url) return img.download_url
                if (img && typeof img === 'object' && img.fileID) return img.fileID
                if (img && typeof img === 'object' && img.url) return img.url
                return ''
              })
            )
          : []
        const coverCandidate = work.cover && !this.isInvalidTempPath(work.cover) ? work.cover : ''
        const mergedImages = this.sanitizeImageList(images.length ? images : (coverCandidate ? [coverCandidate] : []))
        const imagePreviews = await this.generatePreviewUrls(mergedImages)
        const hydratedTags = this.hydrateWorkTags(work.tags)
        const displayTags = this.normalizeWorkTags(hydratedTags)

        this.setData({
          fieldValues,
          editMode: false,
          workDetail: {
            ...this.data.workDetail,
            id: work._id,
            tempId: '',
            name: work.title || work.name || '未命名作品',
            images: mergedImages,
            cover: coverCandidate || mergedImages[0] || '',
            imagePreviews,
            isNew: false,
            createTime: work.createTime || '',
            tags: hydratedTags
          }
        }, () => {
          this.refreshDisplayFields()
          this.updateTagDisplay(displayTags)
          this.syncTagSelection(hydratedTags)
          if (this.autoOpenTagManager) {
            this.autoOpenTagManager = false
            this.manageTags()
          }
        })
      } else {
        wx.showToast({
          title: result?.result?.error || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载作品详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  addImage() {
    // 检查是否在编辑模式或新建模式
    if (!this.data.editMode && !this.data.workDetail.isNew) {
      wx.showToast({
        title: '请先进入编辑模式',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    const currentCount = this.data.workDetail.imagePreviews?.length || 0
    const remainingCount = Math.max(0, 50 - currentCount) // 最多支持50张图片
    
    if (remainingCount === 0) {
      wx.showToast({
        title: '最多上传50张图片',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 显示操作菜单
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? 'album' : 'camera'
        this.chooseImages(sourceType, remainingCount)
      }
    })
  },

  chooseImages(sourceType, count) {
    wx.chooseImage({
      count,
      sizeType: ['compressed'], // 优先使用压缩版本
      sourceType: [sourceType],
      success: async (res) => {
        const tempFilePaths = res.tempFilePaths || []
        if (tempFilePaths.length) {
          wx.showLoading({
            title: '处理图片中...',
            mask: true
          })

          try {
            // 验证图片格式和大小
            const validImages = await this.validateImages(tempFilePaths)
            
            if (validImages.length === 0) {
              wx.showToast({
                title: '没有有效的图片',
                icon: 'none'
              })
              return
            }
            
            // 压缩和处理图片
            const processedImages = await this.processImages(validImages)
            
            const currentImages = this.data.workDetail.images || []
            const currentPreviews = this.data.workDetail.imagePreviews || []
            
            // 更新数据
            const newImages = [...currentImages, ...processedImages]
            const newPreviews = [...currentPreviews, ...processedImages]
            
            this.setData({
              'workDetail.images': newImages,
              'workDetail.cover': newImages[0] || '',
              'workDetail.imagePreviews': newPreviews
            })

            wx.showToast({
              title: `成功添加${processedImages.length}张图片`,
              icon: 'success',
              duration: 1500
            })
          } catch (error) {
            console.error('图片处理失败:', error)
            wx.showToast({
              title: '图片处理失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      },
      fail: (error) => {
        if (error.errMsg !== 'chooseImage:fail cancel') {
          wx.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      }
    })
  },

  async validateImages(imagePaths) {
    const validImages = []
    const supportedFormats = ['jpg', 'jpeg', 'png', 'webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i]
      
      try {
        // 获取图片信息
        const imageInfo = await this.getImageInfo(imagePath)
        
        // 检查文件格式
        const extension = imagePath.toLowerCase().split('.').pop()
        if (!supportedFormats.includes(extension)) {
          wx.showToast({
            title: `第${i + 1}张图片格式不支持`,
            icon: 'none',
            duration: 2000
          })
          continue
        }
        
        // 检查文件大小（如果API支持）
        if (imageInfo.size && imageInfo.size > maxSize) {
          wx.showToast({
            title: `第${i + 1}张图片超过5MB`,
            icon: 'none',
            duration: 2000
          })
          continue
        }
        
        validImages.push(imagePath)
      } catch (error) {
        console.error(`验证第${i + 1}张图片失败:`, error)
        wx.showToast({
          title: `第${i + 1}张图片无效`,
          icon: 'none',
          duration: 2000
        })
      }
    }
    
    return validImages
  },

  async processImages(imagePaths) {
    const processed = []
    
    for (let i = 0; i < imagePaths.length; i++) {
      try {
        const imagePath = imagePaths[i]
        
        // 获取图片信息
        const imageInfo = await this.getImageInfo(imagePath)
        
        // 如果图片太大，进行压缩
        let finalPath = imagePath
        if (imageInfo.width > 1200 || imageInfo.height > 1200 || imageInfo.size > 1024 * 1024) {
          finalPath = await this.compressImage(imagePath, imageInfo)
        }
        
        processed.push(finalPath)
        
        // 更新上传进度
        const progress = Math.round(((i + 1) / imagePaths.length) * 100)
        const index = (this.data.workDetail.imagePreviews?.length || 0) + i
        this.setData({
          [`uploadingImages.${index}`]: progress
        })
        
      } catch (error) {
        console.error(`处理第${i + 1}张图片失败:`, error)
        // 即使某张图片失败，也处理其他图片
        processed.push(imagePaths[i])
      }
    }
    
    // 清除上传进度
    setTimeout(() => {
      this.setData({ uploadingImages: {} })
    }, 500)
    
    return processed
  },

  getImageInfo(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imagePath,
        success: resolve,
        fail: reject
      })
    })
  },

  compressImage(imagePath, imageInfo) {
    return new Promise((resolve, reject) => {
      // 计算压缩后的尺寸
      let { width, height } = imageInfo
      const maxSize = 1200
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }
      
      // 使用canvas压缩
      const ctx = wx.createCanvasContext('compress-canvas')
      ctx.drawImage(imagePath, 0, 0, width, height)
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'compress-canvas',
          width,
          height,
          fileType: 'jpg',
          quality: 0.8,
          success: (res) => {
            resolve(res.tempFilePath)
          },
          fail: reject
        })
      })
    })
  },

  buildCustomFieldPayload() {
    const { customFields, fieldValues } = this.data
    const payload = {}

    customFields.forEach(field => {
      const key = field._id || field.name
      const rawValue = fieldValues[key]
      const value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : ''
      payload[key] = {
        value,
        name: field.name,
        icon: field.icon || 'user-1',
        colorObj: field.colorObj
      }
    })

    return payload
  },

  refreshDisplayFields() {
    const { customFields, selectedFieldIds, fieldValues } = this.data
    if (!customFields || !customFields.length) {
      this.setData({
        displayFields: []
      })
      return
    }

    let ids = selectedFieldIds && selectedFieldIds.length
      ? selectedFieldIds
      : customFields.slice(0, Math.min(3, customFields.length)).map(field => field._id)

    // 去除无效ID
    ids = ids.filter(id => customFields.some(field => field._id === id))

    let idsChanged = false

    if (!ids.length) {
      ids = customFields.slice(0, Math.min(3, customFields.length)).map(field => field._id)
      idsChanged = true
    }

    const displayFields = ids
      .map(id => {
        const field = customFields.find(f => f._id === id)
        if (!field) return null
        const value = fieldValues[field._id] || fieldValues[field.name] || ''
        return {
          ...field,
          value,
          icon: field.icon || 'tag'
        }
      })
      .filter(Boolean)

    this.setData({
      displayFields,
      selectedFieldIds: ids
    })

    if (idsChanged) {
      wx.setStorageSync(DISPLAY_FIELD_STORAGE_KEY, ids)
    }
  },

  openAssetSheet() {
    this.setData({
      showAssetSheet: true
    })
  },

  closeAssetSheet() {
    this.setData({
      showAssetSheet: false
    })
  },

  noop() {},

  openFieldManager() {
    this.closeAssetSheet()
    if (!this.data.customFields.length) {
      wx.showToast({
        title: '暂无可管理字段',
        icon: 'none'
      })
      return
    }

    const availableFields = this.data.customFields.map(field => ({
      ...field,
      selected: this.data.selectedFieldIds.includes(field._id),
      value: this.data.fieldValues[field._id] || this.data.fieldValues[field.name] || ''
    }))

    this.setData({
      availableFields,
      showFieldManager: true
    })
  },

  closeFieldManager() {
    this.setData({
      showFieldManager: false
    })
  },

  handleFieldTap(e) {
    // 保留兼容性逻辑：当前仅在只读模式下提示
    if (this.data.editMode) {
      return
    }
    const { name } = e.currentTarget.dataset
    wx.showToast({
      title: `请点击右上方“编辑”后填写${name || '字段'}`,
      icon: 'none'
    })
  },

  onFieldInput(e) {
    const { id, name } = e.currentTarget.dataset
    const value = (e.detail.value || '').trim()
    const updates = { editMode: true }

    if (id) {
      updates[`fieldValues.${id}`] = value
    }
    if (name) {
      updates[`fieldValues.${name}`] = value
    }

    this.setData(updates, () => {
      this.refreshDisplayFields()
    })
  },

  toggleFieldDisplay(e) {
    const id = e.currentTarget.dataset.id
    const availableFields = this.data.availableFields.map(field => ({
      ...field,
      selected: field._id === id ? !field.selected : field.selected
    }))
    this.setData({
      availableFields
    })
  },

  applyFieldSelection() {
    const selectedIds = this.data.availableFields
      .filter(field => field.selected)
      .map(field => field._id)

    wx.setStorageSync(DISPLAY_FIELD_STORAGE_KEY, selectedIds)

    this.setData({
      selectedFieldIds: selectedIds,
      showFieldManager: false
    }, () => {
      this.refreshDisplayFields()
    })
  },

  addImageFromSheet() {
    this.closeAssetSheet()
    if (!this.data.editMode) {
      this.setData({
        editMode: true
      })
    }
    this.addImage()
  },

  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const urls = this.data.workDetail.imagePreviews || []
    if (!urls.length) return
    wx.previewImage({
      current: urls[index || 0],
      urls
    })
  },

  removeImage(e) {
    if (!this.data.editMode) return
    const index = Number(e.currentTarget.dataset.index)
    if (Number.isNaN(index)) return

    const currentImages = this.data.workDetail.images || []
    const currentPreviews = this.data.workDetail.imagePreviews || []

    const newImages = [...currentImages]
    const newPreviews = [...currentPreviews]

    newImages.splice(index, 1)
    newPreviews.splice(index, 1)

    this.setData({
      'workDetail.images': newImages,
      'workDetail.imagePreviews': newPreviews,
      'workDetail.cover': newImages[0] || ''
    })
  },

  handlePrimaryAction() {
    if (this.data.editMode) {
      this.saveWork()
    } else {
      this.shareWork()
    }
  },

  promptRename() {
    wx.showModal({
      title: '作品名称',
      editable: true,
      placeholderText: '请输入作品名称',
      content: this.data.workDetail.name || '',
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          const value = res.content.trim()
          this.setData({
            editMode: true,
            'workDetail.name': value || '未命名作品'
          })
          this.refreshDisplayFields()
        }
      }
    })
  },

  promptDescription() {
    wx.showModal({
      title: '作品简介',
      editable: true,
      placeholderText: '请输入作品简介',
      content: this.data.fieldValues.description || '',
      success: (res) => {
        if (res.confirm && res.content !== undefined) {
          const value = res.content.trim()
          this.setData({
            editMode: true,
            'fieldValues.description': value
          }, () => {
            this.refreshDisplayFields()
          })
        }
      }
    })
  },

  editWorkName() {
    this.closeAssetSheet()
    this.promptRename()
  },

  editWorkDescription() {
    this.closeAssetSheet()
    this.promptDescription()
  },

  async manageTags() {
    this.closeAssetSheet()
    await this.loadTagOptions()
    const hydrated = this.hydrateWorkTags(this.data.workDetail.tags)
    const ids = hydrated.map(tag => tag._id)
    const displayTags = this.normalizeWorkTags(hydrated)

    this.setData({
      showTagManager: true,
      editMode: true,
      tagSelection: ids,
      'workDetail.tags': hydrated
    })
    this.updateTagDisplay(displayTags)
  },

  closeTagManager() {
    this.setData({
      showTagManager: false
    })
  },

  toggleTagSelection(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return

    const selection = [...this.data.tagSelection]
    const index = selection.indexOf(id)

    if (index >= 0) {
      selection.splice(index, 1)
    } else {
      if (selection.length >= this.data.maxTagCount) {
        wx.showToast({
          title: `最多选择${this.data.maxTagCount}个标签`,
          icon: 'none'
        })
        return
      }
      selection.push(id)
    }

    this.setData({
      tagSelection: selection
    })
  },

  applyTagSelection() {
    const selectedTags = this.buildSelectedTagObjects(this.data.tagSelection)
    const displayTags = this.normalizeWorkTags(selectedTags)

    this.setData({
      showTagManager: false,
      editMode: true,
      'workDetail.tags': selectedTags
    })
    this.updateTagDisplay(displayTags)
    this.syncTagSelection(selectedTags)
  },

  editRating() {
    this.closeAssetSheet()
    wx.showToast({
      title: '评分功能开发中',
      icon: 'none'
    })
  },

  decorCard() {
    this.closeAssetSheet()
    wx.showToast({
      title: '卡片装饰开发中',
      icon: 'none'
    })
  },

  sortWorks() {
    this.closeAssetSheet()
    wx.showToast({
      title: '排序功能开发中',
      icon: 'none'
    })
  },

  toggleLayout() {
    this.closeAssetSheet()
    const next = !this.data.layoutSingleColumn
    this.setData({
      layoutSingleColumn: next
    })
    wx.showToast({
      title: next ? '已切换为单列' : '已切换为双列',
      icon: 'none'
    })
  },

  toggleImmersive() {
    this.closeAssetSheet()
    const next = !this.data.immersiveMode
    this.setData({
      immersiveMode: next
    })
    wx.showToast({
      title: next ? '已开启沉浸浏览' : '已关闭沉浸浏览',
      icon: 'none'
    })
  },

  deactivateWork() {
    this.closeAssetSheet()
    wx.showToast({
      title: '停用功能开发中',
      icon: 'none'
    })
  },

  async saveWork() {
    const { workDetail } = this.data
    const now = new Date().toLocaleString()
    const customFieldsPayload = this.buildCustomFieldPayload()
    const payloadImages = [...(workDetail.images || [])]
    const needUpload = payloadImages.some(path => path && !/^cloud:\/\//.test(path))

    if (needUpload) {
      const baseId = workDetail.id || workDetail.tempId || `temp_${Date.now()}`
      wx.showLoading({
        title: '上传图片',
        mask: true
      })
      try {
        const uploaded = await this.uploadImages(payloadImages, baseId)
        payloadImages.splice(0, payloadImages.length, ...uploaded)
      } catch (error) {
        console.error('图片上传失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        return
      } finally {
        wx.hideLoading()
      }
    }

    const payloadTags = this.hydrateWorkTags(workDetail.tags)
    const payload = {
      title: workDetail.name || '未命名作品',
      description: '',
      tags: payloadTags,
      images: payloadImages,
      cover: payloadImages[0] || workDetail.cover || '',
      customFields: customFieldsPayload
    }

    wx.showLoading({
      title: '保存中',
      mask: true
    })

    try {
      let result

      if (workDetail.isNew || !workDetail.id) {
        result = await wx.cloud.callFunction({
          name: 'works',
          data: {
            action: 'create',
            ...payload
          }
        })
      } else {
        result = await wx.cloud.callFunction({
          name: 'works',
          data: {
            action: 'update',
            _id: workDetail.id,
            ...payload
          }
        })
      }

      if (result?.result?.success) {
        const data = result.result.data || {}
        const newId = workDetail.id || data._id
        const createTime = workDetail.createTime || now
        const imagePreviews = await this.generatePreviewUrls(payload.images)

        const hydratedTags = this.hydrateWorkTags(payload.tags || payloadTags)
        const displayTags = this.normalizeWorkTags(hydratedTags)

        this.setData({
          editMode: false,
          workDetail: {
            ...this.data.workDetail,
            id: newId || this.data.workDetail.id,
            tempId: '',
            isNew: false,
            createTime,
            name: payload.title,
            images: payload.images,
            cover: payload.cover,
            imagePreviews,
            tags: hydratedTags
          }
        })
        this.updateTagDisplay(displayTags)
        this.syncTagSelection(hydratedTags)

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: result?.result?.error || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存作品失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  shareWork() {
    this.closeAssetSheet()
    this.closeFieldManager()
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      }
    })
  },

  onShareAppMessage() {
    const { workDetail, userInfo } = this.data
    const workId = workDetail.id || workDetail.tempId || ''
    const title = workDetail.name || '看看我的作品'
    const creatorName = encodeURIComponent(userInfo.name || '')
    const creatorAvatar = encodeURIComponent(userInfo.avatarUrl || '')
    const shareTime = encodeURIComponent(workDetail.createTime || '')
    let path = '/pages/share/share'

    if (workId) {
      const encodedTitle = encodeURIComponent(title)
      path = `/pages/share/share?id=${workId}&title=${encodedTitle}&creatorName=${creatorName}&creatorAvatar=${creatorAvatar}&shareTime=${shareTime}`
    }

    return {
      title,
      path,
      imageUrl: (workDetail.imagePreviews && workDetail.imagePreviews[0]) || ''
    }
  },

  onShareTimeline() {
    return {
      title: '我的作品展示'
    }
  },

  async generatePreviewUrls(paths = []) {
    if (!paths || !paths.length) return []
    const cloudIds = [...new Set(paths.filter(path => /^cloud:\/\//.test(path)))]
    const map = {}

    if (cloudIds.length) {
      try {
        const res = await wx.cloud.getTempFileURL({
          fileList: cloudIds
        })
        if (res && Array.isArray(res.fileList)) {
          res.fileList.forEach(item => {
            if (item.status === 0 && item.fileID && item.tempFileURL) {
              map[item.fileID] = item.tempFileURL
            } else if (item.status !== 0) {
              console.warn('图片临时链接失效，将使用原始 fileID 展示占位图:', item.fileID, item.errMsg)
            }
          })
        }
      } catch (error) {
        console.warn('获取图片临时链接失败，使用原始 fileID 展示占位图:', error)
        cloudIds.forEach(id => {
          map[id] = id
        })
      }
    }

    return this.sanitizeImageList(paths.map(path => map[path] || path))
  },

  handleImageError(e) {
    const index = e.currentTarget.dataset.index
    console.warn(`图片 ${index} 加载失败:`, e.detail)
    
    // 如果是临时图片路径，尝试移除它
    const { imagePreviews, images } = this.data.workDetail
    if (imagePreviews && imagePreviews[index]) {
      const failedImage = imagePreviews[index]

      if (this.isInvalidTempPath(failedImage)) {
        const newPreviews = this.sanitizeImageList(imagePreviews.filter((_, i) => i !== index))
        const newImages = this.sanitizeImageList(images.filter((_, i) => i !== index))

        this.setData({
          'workDetail.imagePreviews': newPreviews,
          'workDetail.images': newImages,
          'workDetail.cover': newImages[0] || ''
        })

        wx.showToast({
          title: '图片链接已失效，请重新上传',
          icon: 'none',
          duration: 1800
        })
      } else if (/^cloud:\/\//.test(images?.[index] || '')) {
        this.generatePreviewUrls([images[index]]).then(([preview]) => {
          if (preview) {
            this.setData({
              [`workDetail.imagePreviews[${index}]`]: preview
            })
          }
        })
      }
    }
  },

  async uploadImages(images = [], workId) {
    if (!images || !images.length) return []
    
    console.log('开始上传图片:', images.length, '张')
    console.log('工作ID:', workId)
    
    // 过滤掉无效的临时图片路径
    const validImages = this.sanitizeImageList(images)
    
    console.log('有效图片数量:', validImages.length)
    
    const uploads = validImages.map(async (path, index) => {
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
})