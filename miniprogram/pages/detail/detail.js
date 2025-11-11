Page({
  data: {
    editMode: false,
    loadingFields: false,
    customFields: [],
    fieldValues: {},
    workDetail: {
      id: null,
      tempId: '',
      name: '未命名作品',
      creator: '云作品小萌新',
      images: [],
      cover: '',
      isNew: false,
      createTime: '',
      imagePreviews: []
    }
  },

  onLoad(options) {
    this.pendingOptions = options || {}
    this.initializePage()
  },

  async initializePage() {
    await this.loadCustomFields()
    const { id, isNew, name } = this.pendingOptions

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

  async loadCustomFields() {
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
          icon: field.icon || 'client-icon',
          colorObj: field.colorObj || {},
          sortOrder: typeof field.sortOrder === 'number' ? field.sortOrder : index
        }))

        const sorted = list.sort((a, b) => a.sortOrder - b.sortOrder)

        this.setData({
          customFields: sorted
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
      workDetail: {
        ...this.data.workDetail,
        id: null,
        tempId: id,
        name: decodedName,
        images: [],
        cover: '',
        createTime: '',
        isNew: true,
        imagePreviews: []
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
          ? work.images
              .map(img => {
                if (!img) return ''
                if (typeof img === 'string') return img
                if (img && typeof img === 'object' && img.download_url) return img.download_url
                if (img && typeof img === 'object' && img.fileID) return img.fileID
                if (img && typeof img === 'object' && img.url) return img.url
                return ''
              })
              .filter(Boolean)
          : []
        const mergedImages = images.length ? images : (work.cover ? [work.cover] : [])
        const imagePreviews = await this.generatePreviewUrls(mergedImages)

        this.setData({
          fieldValues,
          editMode: false,
          workDetail: {
            ...this.data.workDetail,
            id: work._id,
            tempId: '',
            name: work.title || work.name || '未命名作品',
            images: mergedImages,
            cover: work.cover || mergedImages[0] || '',
            imagePreviews,
            isNew: false,
            createTime: work.createTime || ''
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
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths || []
        if (tempFilePaths.length) {
          const images = [...(this.data.workDetail.images || []), ...tempFilePaths]
          this.setData({
            'workDetail.images': images,
            'workDetail.cover': images[0] || '',
            'workDetail.imagePreviews': images
          })
        }
      }
    })
  },

  editIntro() {
    const nextEditMode = !this.data.editMode
    this.setData({
      editMode: nextEditMode
    })

    wx.showToast({
      title: nextEditMode ? '进入编辑模式' : '退出编辑模式',
      icon: 'none'
    })
  },

  onFieldInput(e) {
    const fieldId = e.currentTarget.dataset.id
    const fieldName = e.currentTarget.dataset.name
    const value = (e.detail.value || '').trim()
    const updates = {}
    if (fieldId) {
      updates[`fieldValues.${fieldId}`] = value
    }
    if (fieldName) {
      updates[`fieldValues.${fieldName}`] = value
    }
    this.setData(updates)
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
        icon: field.icon || 'client-icon',
        colorObj: field.colorObj
      }
    })

    return payload
  },

  async saveWork() {
    const { workDetail } = this.data
    const now = new Date().toLocaleString()
    const customFieldsPayload = this.buildCustomFieldPayload()
    const payloadImages = [...(workDetail.images || [])]
    const needUpload = payloadImages.some(path => path && !/^cloud:\/\//.test(path))

    if (needUpload) {
        console.log('检测到需要上传的图片:', payloadImages)
        console.log('使用基础ID:', baseId)
        console.log('检测到需要上传的图片:', payloadImages)
        console.log('使用基础ID:', baseId)
      const baseId = workDetail.id || workDetail.tempId || `temp_${Date.now()}`
      try {
        console.log('开始上传图片到云端...')
        console.log('开始上传图片到云端...')
        const uploaded = await this.uploadImages(payloadImages, baseId)
        payloadImages.splice(0, payloadImages.length, ...uploaded)
        console.log('图片上传结果', uploaded)
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

    const payload = {
      title: workDetail.name || '未命名作品',
      description: '',
      tags: [],
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
            imagePreviews
          }
        })

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
    return {
      title: '看看我的作品',
      path: '/pages/detail/detail'
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
            }
          })
        }
      } catch (error) {
        console.error('获取图片临时链接失败:', error)
      }
    }

    return paths.map(path => map[path] || path)
  },

  async uploadImages(images = [], workId) {
    if (!images || !images.length) return []
    
    console.log('开始上传图片:', images.length, '张')
    console.log('工作ID:', workId)
    
    const uploads = images.map(async (path, index) => {
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