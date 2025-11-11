const DEFAULT_AVATAR = '/assets/images/8.svg'

Page({
  data: {
    defaultAvatar: DEFAULT_AVATAR,
    loading: true,
    workId: '',
    creator: {
      name: '云作品创作者',
      avatar: DEFAULT_AVATAR
    },
    workDetail: {
      title: '作品详情',
      createTime: ''
    },
    description: '',
    imageList: [],
    tags: [],
    fields: [],
    liked: false,
    shareTime: '',
    descriptionParagraphs: [],
    highlights: [],
    meta: {
      likes: 0,
      shares: 0,
      favorites: 0
    }
  },

  onLoad(options = {}) {
    const { id, title, creatorName, creatorAvatar, shareTime } = options
    const decodedTitle = title ? decodeURIComponent(title) : ''
    const decodedName = creatorName ? decodeURIComponent(creatorName) : ''
    const decodedAvatar = creatorAvatar ? decodeURIComponent(creatorAvatar) : ''
    const decodedTime = shareTime ? decodeURIComponent(shareTime) : ''

    this.setData({
      workId: id || '',
      workDetail: {
        ...this.data.workDetail,
        title: decodedTitle || this.data.workDetail.title
      },
      creator: {
        name: decodedName || this.data.creator.name,
        avatar: decodedAvatar || DEFAULT_AVATAR
      },
      shareTime: decodedTime || this.data.shareTime
    })

    if (id) {
      this.loadWork(id)
    } else {
      wx.showToast({
        title: '未找到作品内容',
        icon: 'none'
      })
    }
  },

  async loadWork(id) {
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
        const work = result.result.data || {}
        const images = this.sanitizeImageList(this.extractImages(work))
        const previewUrls = await this.generatePreviewUrls(images)
        const imageList = this.buildImageList(previewUrls, work)
        const fields = this.formatFields(work)

        this.setData({
          workDetail: {
            title: work.title || work.name || this.data.workDetail.title,
            createTime: work.createTime || '',
            company: work.company || '',
            industry: work.industry || '',
            cycle: work.cycle || '',
            team: work.team || '',
            budget: work.budget || '',
            subtitle: work.subtitle || ''
          },
          descriptionParagraphs: this.buildDescriptionParagraphs(work),
          highlights: this.buildHighlights(work),
          imageList,
          tags: this.normalizeTags(work.tags).slice(0, 4),
          fields,
          meta: this.extractMeta(work)
        })
      } else {
        wx.showToast({
          title: result?.result?.error || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载分享详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  extractImages(work = {}) {
    const rawImages = Array.isArray(work.images) ? work.images : []
    const cover = work.cover ? [work.cover] : []
    const merged = rawImages.length ? rawImages : cover
    return merged
  },

  buildImageList(previews = [], work = {}) {
    const captions = this.resolveImageCaptions(work)
    return previews.map((url, index) => ({
      url,
      caption: captions[index] || ''
    }))
  },

  resolveImageCaptions(work = {}) {
    if (Array.isArray(work.imageCaptions)) {
      return work.imageCaptions
    }
    if (typeof work.imageCaptions === 'string') {
      try {
        const parsed = JSON.parse(work.imageCaptions)
        if (Array.isArray(parsed)) return parsed
      } catch (err) {
        // treat as newline separated string
        return work.imageCaptions.split(/\r?\n/).map(str => str.trim()).filter(Boolean)
      }
    }
    if (work.customFields && typeof work.customFields === 'object') {
      const custom = work.customFields.imageCaptions || work.customFields['图片说明']
      if (Array.isArray(custom)) {
        return custom
      }
      if (typeof custom === 'object' && custom.value) {
        return String(custom.value).split(/\r?\n/).map(str => str.trim()).filter(Boolean)
      }
      if (typeof custom === 'string') {
        return custom.split(/\r?\n/).map(str => str.trim()).filter(Boolean)
      }
    }
    return []
  },

  formatFields(work = {}) {
    const customFields = work.customFields || {}
    const baseInfo = [
      { id: 'company', name: '客户', value: work.company || '' },
      { id: 'industry', name: '行业', value: work.industry || '' },
      { id: 'cycle', name: '项目周期', value: work.cycle || '' },
      { id: 'team', name: '项目成员', value: work.team || '' },
      { id: 'budget', name: '项目预算', value: work.budget || '' }
    ]

    const custom = Object.keys(customFields || {}).map(key => {
      const item = customFields[key] || {}
      const baseValue = item.value !== undefined ? item.value : item
      return {
        id: key,
        name: item.name || key,
        value: baseValue !== undefined ? String(baseValue).trim() : ''
      }
    })

    return [...baseInfo, ...custom]
  },

  buildDescriptionParagraphs(work = {}) {
    const longDesc = (work.longDescription || work.projectSummary || '').trim()
    const desc = longDesc || (work.description || '').trim()
    if (!desc) return []
    return desc.split(/\r?\n{1,}/).map(item => item.trim()).filter(Boolean)
  },

  buildHighlights(work = {}) {
    if (Array.isArray(work.highlights)) {
      return work.highlights.filter(Boolean).map(item => String(item).trim())
    }
    const highlightFields = ['highlights', '核心设计理念', '设计亮点']
    for (const key of highlightFields) {
      const source = work.customFields && work.customFields[key]
      if (source) {
        if (Array.isArray(source)) {
          return source.map(item => (item.value || item).toString().trim()).filter(Boolean)
        }
        if (typeof source === 'object' && source.value) {
          return String(source.value).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
        }
        if (typeof source === 'string') {
          return source.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
        }
      }
      if (typeof work[key] === 'string') {
        return work[key].split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      }
    }
    return []
  },

  normalizeTags(tags = []) {
    if (!Array.isArray(tags)) return []
    const seen = new Set()
    return tags
      .map((tag, index) => {
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
            color: '#2b7fff',
            background: 'rgba(43, 127, 255, 0.12)'
          }
        }
        if (typeof tag === 'object') {
          const name = String(tag.name || tag.label || tag.text || tag.value || '').trim()
          if (!name) return null
          const id = tag._id || tag.id || name || `tag_${index}`
          if (seen.has(id)) return null
          seen.add(id)
          const color = tag.color || tag.textColor || (tag.colorObj && tag.colorObj.text) || '#2b7fff'
          const background = tag.background || tag.bgColor || (tag.colorObj && tag.colorObj.background) || 'rgba(43, 127, 255, 0.12)'
          return {
            _id: id,
            name,
            color,
            background
          }
        }
        return null
      })
      .filter(Boolean)
  },

  extractMeta(work = {}) {
    const meta = work.meta || work.statistics || {}
    return {
      likes: meta.likes || meta.favorites || 0,
      shares: meta.shares || meta.forward || 0,
      favorites: meta.collections || meta.bookmarks || 0
    }
  },

  isInvalidTempPath(path) {
    if (!path || typeof path !== 'string') return true
    return /__tmp__|127\.0\.0\.1/i.test(path)
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
            } else if (item.fileID) {
              console.warn('临时链接失效，使用原始 fileID:', item.fileID, item.errMsg)
              map[item.fileID] = item.fileID
            }
          })
        }
      } catch (error) {
        console.warn('获取图片临时链接失败，将使用原始 fileID:', error)
        cloudIds.forEach(id => {
          map[id] = id
        })
      }
    }

    return this.sanitizeImageList(paths.map(path => map[path] || path))
  },

  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const urls = this.data.imageList || []
    if (!urls.length) return
    wx.previewImage({
      current: urls[index || 0],
      urls
    })
  },

  toggleLike() {
    const next = !this.data.liked
    this.setData({ liked: next })
    wx.showToast({
      title: next ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/myworks/myworks'
    })
  }
})

