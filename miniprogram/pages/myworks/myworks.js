// 移除旧图标映射，直接使用 TDesign 图标名称

Page({
  data: {
    showEditModal: false,
    currentWorkName: '未命名作品',
    currentWorkId: null,
    showProfile: false,
    userInfo: {
      name: '',
      avatarUrl: ''
    },
    works: [], // 作品列表
    loading: false, // 加载状态
    showCustomFieldsModal: false,
    customFields: [],
    tagSheetVisible: false,
    tagSheetLoading: false,
    tagSheetSaving: false,
    tagSheetTargetId: null,
    tagSheetTargetName: '未命名作品',
    tagList: [],
    tagSelection: [],
    maxTagCount: 5
  },

  onLoad() {
    this.loadUserInfo()
    this.loadWorks()
    this.loadCustomFields()
  },

  onShow() {
    this.loadWorks() // 每次显示时重新加载作品列表
    this.loadCustomFields() // 每次显示时重新加载自定义字段
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'system',
        data: {
          action: 'getUserProfile'
        }
      })

      if (result?.result?.success) {
        this.setData({
          userInfo: {
            name: result.result.data?.nickName || '',
            avatarUrl: result.result.data?.avatarUrl || ''
          }
        })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },

  normalizeTags(tags) {
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
            background: '#F3F4F6',
            color: '#1F2937'
          }
        }
        if (typeof tag === 'object') {
          const name = String(tag.name || tag.label || tag.text || tag.value || '').trim()
          if (!name) return null
          const id = tag._id || tag.id || name || `tag_${index}`
          if (seen.has(id)) return null
          seen.add(id)
          const background = tag.background || tag.bgColor || tag.color?.background || (tag.colorObj && tag.colorObj.background) || '#F3F4F6'
          const color = tag.color || tag.textColor || tag.color?.text || (tag.colorObj && tag.colorObj.text) || '#1F2937'
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

  async loadTagCollection(workId) {
    try {
      const [tagResult, workResult] = await Promise.all([
        wx.cloud.callFunction({
          name: 'system',
          data: {
            action: 'listTags',
            page: 1,
            limit: 200
          }
        }),
        wx.cloud.callFunction({
          name: 'works',
          data: {
            action: 'get',
            _id: workId
          }
        })
      ])

      let tagList = []
      if (tagResult?.result?.success) {
        tagList = this.normalizeTagCollection(tagResult.result.data?.list || [])
      }

      const workData = workResult?.result?.success ? workResult.result.data : null
      const currentTags = this.normalizeTagCollection(workData?.tags || [])
      const selection = currentTags.map(tag => String(tag._id))
      const mergedList = [...tagList]
      currentTags.forEach(tag => {
        if (!mergedList.find(item => item._id === tag._id)) {
          mergedList.push(tag)
        }
      })

      this.setData({
        tagList: mergedList,
        tagSelection: selection,
        tagSheetLoading: false,
        tagSheetSaving: false
      })
    } catch (error) {
      console.error('加载标签失败:', error)
      this.setData({
        tagList: [],
        tagSelection: [],
        tagSheetLoading: false,
        tagSheetSaving: false
      })
      wx.showToast({
        title: '加载标签失败',
        icon: 'none'
      })
    }
  },

  openTagSheet() {
    const workId = this.data.currentWorkId
    const workName = this.data.currentWorkName || '未命名作品'

    if (!workId) {
      wx.showToast({
        title: '请选择作品',
        icon: 'none'
      })
      return
    }

    this.setData({
      tagSheetVisible: true,
      tagSheetLoading: true,
       tagSheetSaving: false,
      tagSheetTargetId: workId,
      tagSheetTargetName: workName
    })
    this.loadTagCollection(workId)
  },

  closeTagSheet() {
    if (this.data.tagSheetSaving) return
    this.setData({
      tagSheetVisible: false,
      tagSheetTargetId: null,
      tagSheetTargetName: '未命名作品',
      tagSelection: [],
      tagSheetSaving: false
    })
  },

  toggleTagSelection(e) {
    if (this.data.tagSheetSaving) return
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
      selection.push(String(id))
    }

    this.setData({ tagSelection: selection })
  },

  buildSelectedTagObjects(ids = [], fallback = []) {
    if (!Array.isArray(ids) || !ids.length) return []
    const optionMap = new Map((this.data.tagList || []).map(tag => [String(tag._id), tag]))
    const fallbackMap = new Map((fallback || []).map(tag => [String(tag._id || tag.name), tag]))

    return ids
      .map(id => {
        const option = optionMap.get(String(id))
        if (option) {
          return {
            _id: option._id,
            name: option.name,
            color: option.color,
            background: option.background
          }
        }
        const existing = fallbackMap.get(String(id))
        if (existing) {
          return {
            _id: existing._id || id,
            name: existing.name,
            color: existing.color || '#2b7fff',
            background: existing.background || 'rgba(43, 127, 255, 0.12)'
          }
        }
        return null
      })
      .filter(Boolean)
  },

  async applyTagSheet() {
    if (this.data.tagSheetSaving) return
    const targetId = this.data.tagSheetTargetId
    if (!targetId) {
      this.closeTagSheet()
      return
    }
    const selectedIds = this.data.tagSelection
    const targetWork = (this.data.works || []).find(item => item._id === targetId)
    const fallbackTags = targetWork?.rawTags || []
    const selectedTags = this.buildSelectedTagObjects(selectedIds, fallbackTags)

    this.setData({ tagSheetSaving: true })
    wx.showLoading({
      title: '保存中',
      mask: true
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'works',
        data: {
          action: 'update',
          _id: targetId,
          tags: selectedTags
        }
      })

      if (result?.result?.success) {
        const normalizedAll = this.normalizeTagCollection(selectedTags)
        const displayTags = normalizedAll.slice(0, 3)
        const updatedWorks = (this.data.works || []).map(item => {
          if (item._id !== targetId) return item
          return {
            ...item,
            tags: displayTags,
            rawTags: normalizedAll
          }
        })

        this.setData({
          works: updatedWorks,
          tagSheetVisible: false,
          tagSheetSaving: false,
          tagSelection: [],
          tagSheetTargetId: null,
          tagSheetTargetName: '未命名作品'
        })

        wx.showToast({
          title: '标签已更新',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: result?.result?.error || '保存失败',
          icon: 'none'
        })
        this.setData({ tagSheetSaving: false })
      }
    } catch (error) {
      console.error('更新标签失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
      this.setData({ tagSheetSaving: false })
    } finally {
      wx.hideLoading()
    }
  },

  normalizeTagCollection(tags) {
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

  // 加载自定义字段
  async loadCustomFields() {
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
          color: field.color || '',
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
    }
  },

  // 加载作品列表
  async loadWorks() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'works',
        data: {
          action: 'list',
          page: 1,
          limit: 20
        }
      })

      if (result?.result?.success) {
        const customFields = this.data.customFields || []
        const list = (result.result.data.list || []).map((work) => {
          const fieldValues = work.customFields || {}
          const fieldArray = Object.keys(fieldValues).map(key => {
            const field = fieldValues[key]
            if (field && typeof field === 'object') {
              return field
            }
            const fallbackField = customFields.find(item => item._id === key || item.name === key)
            return {
              name: fallbackField?.name || key,
              value: field,
              colorObj: fallbackField?.colorObj || {}
            }
          })

          const normalizedTags = this.normalizeTags(work.tags || [])
          const tags = normalizedTags.slice(0, 3)

          return {
            _id: work._id,
            name: work.title || work.name || '',
            cover: work.cover || '',
            imageCount: Array.isArray(work.images) ? work.images.length : 0,
            tags,
            rawTags: normalizedTags
          }
        })

        const coverIds = [...new Set(list
          .filter(item => item.cover && /^cloud:\/\//.test(item.cover))
          .map(item => item.cover))]

        let coverMap = {}
        if (coverIds.length) {
          try {
            const res = await wx.cloud.getTempFileURL({
              fileList: coverIds
            })
            if (res && Array.isArray(res.fileList)) {
              res.fileList.forEach(file => {
                if (file.status === 0 && file.tempFileURL) {
                  coverMap[file.fileID] = file.tempFileURL
                }
              })
            }
          } catch (error) {
            console.error('获取封面临时链接失败:', error)
          }
        }

        const processedList = list.map(item => ({
          ...item,
          coverPreview: coverMap[item.cover] || item.cover
        }))

        this.setData({
          works: processedList
        })
      } else {
        this.setData({ works: [] })
      }
    } catch (error) {
      console.error('加载作品异常:', error)
      this.setData({ works: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  onNewWork() {
    const newWorkId = `temp_${Date.now()}`
    const defaultName = '未命名作品'

    wx.navigateTo({
      url: `/pages/detail/detail?id=${newWorkId}&name=${encodeURIComponent(defaultName)}&isNew=true`
    })
  },

  onSearch() {
    console.log('点击搜索')
  },

  // 显示个人资料侧边栏
  showProfile() {
    this.setData({
      showProfile: true
    })
  },

  // 隐藏个人资料侧边栏
  hideProfile() {
    this.setData({
      showProfile: false
    })
  },



  // 跳转到详情页
  goToDetail(e) {
    const workId = e.currentTarget.dataset.id
    const workName = e.currentTarget.dataset.name || '未命名作品'
    console.log('跳转到详情页:', workId, workName)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${workId}&name=${encodeURIComponent(workName)}`
    })
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const workId = e.currentTarget.dataset.id
    const workName = e.currentTarget.dataset.name || '未命名作品'
    
    this.setData({
      showEditModal: true,
      currentWorkId: workId,
      currentWorkName: workName
    })
  },

  // 隐藏编辑弹窗
  hideEditModal() {
    this.setData({
      showEditModal: false,
      currentWorkId: null,
      currentWorkName: '未命名作品'
    })
  },

  // 编辑作品
  editWork() {
    console.log('编辑作品:', this.data.currentWorkId)
    wx.navigateTo({
      url: `/pages/detail/detail?id=${this.data.currentWorkId}`
    })
    this.hideEditModal()
  },

  // 重命名
  renameWork() {
    const workId = this.data.currentWorkId
    if (!workId) {
      wx.showToast({
        title: '无效的作品',
        icon: 'none'
      })
      return
    }

    this.hideEditModal()

    wx.showModal({
      title: '重命名作品',
      editable: true,
      placeholderText: '请输入新名称',
      confirmText: '保存',
      success: async (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const newName = res.content.trim()
          wx.showLoading({
            title: '重命名中',
            mask: true
          })
          try {
            const result = await wx.cloud.callFunction({
              name: 'works',
              data: {
                action: 'update',
                _id: workId,
                title: newName
              }
            })

            if (result?.result?.success) {
              wx.showToast({
                title: '重命名成功',
                icon: 'success'
              })
              this.setData({ showEditModal: false })
              this.loadWorks()
            } else {
              wx.showToast({
                title: result?.result?.error || '重命名失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('重命名失败:', error)
            wx.showToast({
              title: '重命名失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 设置封面
  setCover() {
    console.log('设置封面:', this.data.currentWorkId)
    wx.showToast({
      title: '设置封面功能开发中',
      icon: 'none'
    })
    this.hideEditModal()
  },

  // 管理标签
  manageTags() {
    const workId = this.data.currentWorkId
    const workName = this.data.currentWorkName || '未命名作品'

    if (!workId) {
      wx.showToast({
        title: '请选择作品',
        icon: 'none'
      })
      return
    }

    this.hideEditModal()
    this.openTagSheet()
  },

  // 卡片装饰
  cardDecoration() {
    console.log('卡片装饰:', this.data.currentWorkId)
    wx.showToast({
      title: '卡片装饰功能开发中',
      icon: 'none'
    })
    this.hideEditModal()
  },

  // 分享作品
  shareWork() {
    console.log('分享作品:', this.data.currentWorkId)
    wx.showActionSheet({
      itemList: ['分享给微信好友', '生成海报', '复制链接'],
      success: (res) => {
        console.log('选择的分享方式:', res.tapIndex)
        wx.showToast({
          title: '分享功能开发中',
          icon: 'none'
        })
      }
    })
    this.hideEditModal()
  },

  // 复制作品
  copyWork() {
    console.log('复制作品:', this.data.currentWorkId)
    wx.showModal({
      title: '复制作品',
      content: '确定要复制这个作品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      }
    })
    this.hideEditModal()
  },

  // 删除作品
  deleteWork() {
    const workId = this.data.currentWorkId
    if (!workId) {
      wx.showToast({
        title: '无效的作品',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '删除作品',
      content: '确定要删除这个作品吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#E7000B',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          try {
            const result = await wx.cloud.callFunction({
              name: 'works',
              data: {
                action: 'delete',
                _id: workId
              }
            })

            if (result?.result?.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.hideEditModal()
              this.loadWorks()
            } else {
              wx.showToast({
                title: result?.result?.error || '删除失败',
                icon: 'none'
              })
              this.hideEditModal()
            }
          } catch (error) {
            console.error('删除作品失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
            this.hideEditModal()
          } finally {
            wx.hideLoading()
          }
        } else {
          this.hideEditModal()
        }
      }
    })
  },

  // 访客
  handleVisitors() {
    console.log('点击访客')
    wx.showToast({
      title: '访客功能开发中',
      icon: 'none'
    })
  },

  // 作品标签
  handleTags() {
    console.log('点击作品标签')
    // 跳转到标签页面
    wx.navigateTo({
      url: '/pages/tags/tags'
    })
  },

  // 自定义字段
  handleCustomFields() {
    console.log('点击自定义字段')
    // 显示底部弹出模态框，同时隐藏个人资料菜单
    this.setData({
      showCustomFieldsModal: true,
      showProfile: false
    })
  },

  // 隐藏自定义字段模态框
  hideCustomFieldsModal() {
    this.setData({
      showCustomFieldsModal: false
    })
  },

  // 跳转到添加字段页面
  goToAddField() {
    wx.navigateTo({
      url: '/pages/addfield/addfield'
    })
  },

  // 编辑字段
  editField(e) {
    const fieldId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/addfield/addfield?mode=edit&field=${fieldId}`
    });
  },

  // 删除字段
  async deleteField(e) {
    const fieldId = e.currentTarget.dataset.id;
    const fieldName = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '删除字段',
      content: `确定要删除字段"${fieldName}"吗？`,
      confirmText: '删除',
      confirmColor: '#E7000B',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'system',
              data: {
                action: 'deleteCustomField',
                _id: fieldId
              }
            })

            if (result.result.errCode === 0) {
              // 重新加载字段列表
              this.loadCustomFields();
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: result.result.errMsg || '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('删除字段失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 字段上移
  async moveFieldUp(e) {
    const fieldId = e.currentTarget.dataset.id;
    let customFields = this.data.customFields;
    const index = customFields.findIndex(field => field._id === fieldId);
    
    if (index > 0) {
      // 交换位置
      [customFields[index], customFields[index - 1]] = [customFields[index - 1], customFields[index]];
      
      // 更新排序到数据库
      const fieldIds = customFields.map(field => field._id);
      
      try {
        // 重排序功能暂时不实现，直接返回成功
        const result = { result: { errCode: 0 } }

        if (result.result.errCode === 0) {
          this.setData({
            customFields: customFields
          });
        } else {
          // 如果数据库更新失败，恢复原始排序
          this.loadCustomFields();
          wx.showToast({
            title: '排序失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('字段排序失败:', error);
        this.loadCustomFields();
        wx.showToast({
          title: '排序失败',
          icon: 'none'
        });
      }
    }
  },

  // 字段下移
  async moveFieldDown(e) {
    const fieldId = e.currentTarget.dataset.id;
    let customFields = this.data.customFields;
    const index = customFields.findIndex(field => field._id === fieldId);
    
    if (index < customFields.length - 1) {
      // 交换位置
      [customFields[index], customFields[index + 1]] = [customFields[index + 1], customFields[index]];
      
      // 更新排序到数据库
      const fieldIds = customFields.map(field => field._id);
      
      try {
        // 重排序功能暂时不实现，直接返回成功
        const result = { result: { errCode: 0 } }

        if (result.result.errCode === 0) {
          this.setData({
            customFields: customFields
          });
        } else {
          // 如果数据库更新失败，恢复原始排序
          this.loadCustomFields();
          wx.showToast({
            title: '排序失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('字段排序失败:', error);
        this.loadCustomFields();
        wx.showToast({
          title: '排序失败',
          icon: 'none'
        });
      }
    }
  },

  // 作品评分
  handleRating() {
    console.log('点击作品评分')
    wx.showToast({
      title: '作品评分功能开发中',
      icon: 'none'
    })
  },

  // 团队管理
  handleTeam() {
    console.log('点击团队管理')
    wx.showToast({
      title: '团队管理功能开发中',
      icon: 'none'
    })
  },

  // 立即开通
  handleUpgrade(e) {
    console.log('点击立即开通')
    // 阻止事件冒泡
    e && e.stopPropagation && e.stopPropagation()
    wx.showToast({
      title: '升级功能开发中',
      icon: 'none'
    })
  },

  // 系统设置
  handleSettings() {
    console.log('点击系统设置')
    // 跳转到系统设置页面
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 个人资料
  handleProfile() {
    console.log('点击个人资料')
    wx.showToast({
      title: '个人资料功能开发中',
      icon: 'none'
    })
  },

  noop() {}
})