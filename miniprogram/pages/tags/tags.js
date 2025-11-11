Page({
  data: {
    tags: [],
    showAddTagModal: false,
    newTagName: '',
    newTagRank: '',
    selectedColorIndex: 0,
    colorOptions: [
      {
        color: '#DC2626',
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
      },
      {
        color: '#2563EB',
        background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
      },
      {
        color: '#7C3AED',
        background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
      },
      {
        color: '#D97706',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
      },
      {
        color: '#EA580C',
        background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)'
      },
      {
        color: '#DB2777',
        background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)'
      },
      {
        color: '#059669',
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
      }
    ]
  },

  onLoad(options) {
    console.log('标签页面加载')
    this.loadTags()
  },

  onShow() {
    console.log('标签页面显示')
    this.loadTags()
  },

  // 加载标签数据
  async loadTags() {
    try {
      // 临时使用模拟数据，等待云函数部署
      if (false) { // 设置为 false 时使用模拟数据，true 时使用云函数
      const result = await wx.cloud.callFunction({
        name: 'tags',
        data: {
          action: 'list'
        }
      })

        if (result.result.errCode === 0) {
          this.setData({
            tags: result.result.tags
          })
        } else {
          console.error('加载标签失败:', result.result.errMsg)
          wx.showToast({
            title: '加载标签失败',
            icon: 'none'
          })
        }
      } else {
        // 模拟数据
        this.setData({
          tags: [
            {
              _id: '1',
              name: '网页设计',
              color: '#DC2626',
              background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
              rank: 1
            },
            {
              _id: '2',
              name: 'UI设计',
              color: '#2563EB',
              background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
              rank: 2
            },
            {
              _id: '3',
              name: '品牌设计',
              color: '#7C3AED',
              background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
              rank: 3
            },
            {
              _id: '4',
              name: '平面设计',
              color: '#D97706',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              rank: 4
            },
            {
              _id: '5',
              name: '电商设计',
              color: '#EA580C',
              background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
              rank: 5
            },
            {
              _id: '6',
              name: '海报设计',
              color: '#DB2777',
              background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
              rank: 6
            },
            {
              _id: '7',
              name: '插画',
              color: '#059669',
              background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
              rank: 7
            }
          ]
        })
      }
    } catch (error) {
      console.error('加载标签异常:', error)
      // 降级到空数组
      this.setData({
        tags: []
      })
      wx.showToast({
        title: '使用模拟数据',
        icon: 'none'
      })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 显示新增标签弹窗
  showAddTagModal() {
    this.setData({
      showAddTagModal: true,
      newTagName: '',
      newTagRank: '',
      selectedColorIndex: 0
    })
  },

  // 隐藏新增标签弹窗
  hideAddTagModal() {
    this.setData({
      showAddTagModal: false
    })
  },

  // 输入标签名称
  onTagNameInput(e) {
    this.setData({
      newTagName: e.detail.value
    })
  },

  // 输入标签排序
  onTagRankInput(e) {
    this.setData({
      newTagRank: e.detail.value
    })
  },

  // 选择颜色
  selectColor(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedColorIndex: index
    })
  },

  // 确认添加标签
  async confirmAddTag() {
    const { newTagName, newTagRank, selectedColorIndex, colorOptions } = this.data
    
    if (!newTagName.trim()) {
      wx.showToast({
        title: '请输入标签名称',
        icon: 'none'
      })
      return
    }

    if (!newTagRank.trim()) {
      wx.showToast({
        title: '请输入排序',
        icon: 'none'
      })
      return
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'tags',
        data: {
          action: 'create',
          name: newTagName,
          color: colorOptions[selectedColorIndex].color
        }
      })

      if (result.result.errCode === 0) {
        this.setData({
          showAddTagModal: false
        })
        this.loadTags() // 重新加载标签列表
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: result.result.errMsg || '添加失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('添加标签异常:', error)
      wx.showToast({
        title: '网络异常',
        icon: 'none'
      })
    }
  },

  // 添加新标签（兼容旧方法）
  addNewTag() {
    this.showAddTagModal()
  },

  // 编辑标签
  editTag(e) {
    const tagId = e.currentTarget.dataset.id
    console.log('编辑标签:', tagId)
    wx.showToast({
      title: '编辑标签功能',
      icon: 'none'
    })
    // TODO: 跳转到编辑标签页面或显示编辑标签弹窗
  },

  // 删除标签
  async deleteTag(e) {
    const tagId = e.currentTarget.dataset.id
    const tagName = e.currentTarget.dataset.name

    wx.showModal({
      title: '删除标签',
      content: `确定要删除标签"${tagName}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'tags',
              data: {
                action: 'delete',
                _id: tagId
              }
            })

            if (result.result.errCode === 0) {
              this.loadTags() // 重新加载标签列表
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } else {
              wx.showToast({
                title: result.result.errMsg || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除标签异常:', error)
            wx.showToast({
              title: '网络异常',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})