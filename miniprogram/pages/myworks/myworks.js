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
    customFields: []
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
          icon: field.icon || 'client-icon',
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

          const tags = fieldArray
            .filter(item => {
              if (!item) return false
              const value = item.value
              return value !== undefined && value !== null && String(value).trim() !== ''
            })
            .slice(0, 3)
            .map(item => ({
              name: item.value || item.name,
              background: item.colorObj?.background || '#F3F4F6',
              color: item.colorObj?.text || '#1F2937'
            }))

          return {
            _id: work._id,
            name: work.title || work.name || '',
            cover: work.cover || '',
            imageCount: Array.isArray(work.images) ? work.images.length : 0,
            tags
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
    console.log('重命名作品:', this.data.currentWorkId)
    wx.showModal({
      title: '重命名作品',
      editable: true,
      placeholderText: '请输入新名称',
      success: (res) => {
        if (res.confirm && res.content) {
          console.log('新名称:', res.content)
          wx.showToast({
            title: '重命名成功',
            icon: 'success'
          })
        }
      }
    })
    this.hideEditModal()
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
    console.log('管理标签:', this.data.currentWorkId)
    wx.showToast({
      title: '标签管理功能开发中',
      icon: 'none'
    })
    this.hideEditModal()
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
  }
})