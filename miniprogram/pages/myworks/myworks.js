Page({
  data: {
    showEditModal: false,
    currentWorkName: '未命名作品',
    currentWorkId: null,
    showProfile: false,
    userInfo: {
      name: '云作品小萌新',
      title: '个人信息'
    },
    showCustomFieldsModal: false,
    customFields: [
      {
        id: '1',
        name: '客户',
        icon: '11',
        color: 'orange',
        colorObj: {
          background: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
          text: '#92400E'
        }
      },
      {
        id: '2',
        name: '行业',
        icon: '15',
        color: 'green',
        colorObj: {
          background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
          text: '#065F46'
        }
      },
      {
        id: '3',
        name: '金额',
        icon: '19',
        color: 'yellow',
        colorObj: {
          background: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
          text: '#78350F'
        }
      },
      {
        id: '4',
        name: '描述',
        icon: '23',
        color: 'purple',
        colorObj: {
          background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
          text: '#5B21B6'
        }
      },
      {
        id: '5',
        name: '备注',
        icon: '27',
        color: 'blue',
        colorObj: {
          background: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
          text: '#1E3A8A'
        }
      },
      {
        id: '5',
        name: '备注',
        icon: '27',
        color: 'blue',
        colorObj: {
          background: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
          text: '#1E3A8A'
        }
      }
    ]
  },

  onLoad() {
    // 页面加载完成
  },

  onNewWork() {
    // 生成新作品ID（使用时间戳）
    const newWorkId = Date.now().toString()
    const newWorkName = '未命名作品'
    
    console.log('创建新作品:', newWorkId, newWorkName)
    
    // 直接跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?id=${newWorkId}&name=${encodeURIComponent(newWorkName)}&isNew=true`
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
    console.log('删除作品:', this.data.currentWorkId)
    wx.showModal({
      title: '删除作品',
      content: '确定要删除这个作品吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#E7000B',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
    this.hideEditModal()
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
  deleteField(e) {
    const fieldId = e.currentTarget.dataset.id;
    const fieldName = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '删除字段',
      content: `确定要删除字段"${fieldName}"吗？`,
      confirmText: '删除',
      confirmColor: '#E7000B',
      success: (res) => {
        if (res.confirm) {
          let customFields = this.data.customFields;
          customFields = customFields.filter(field => field.id !== fieldId);
          
          this.setData({
            customFields: customFields
          });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 字段上移
  moveFieldUp(e) {
    const fieldId = e.currentTarget.dataset.id;
    let customFields = this.data.customFields;
    const index = customFields.findIndex(field => field.id === fieldId);
    
    if (index > 0) {
      // 交换位置
      [customFields[index], customFields[index - 1]] = [customFields[index - 1], customFields[index]];
      
      this.setData({
        customFields: customFields
      });
    }
  },

  // 字段下移
  moveFieldDown(e) {
    const fieldId = e.currentTarget.dataset.id;
    let customFields = this.data.customFields;
    const index = customFields.findIndex(field => field.id === fieldId);
    
    if (index < customFields.length - 1) {
      // 交换位置
      [customFields[index], customFields[index + 1]] = [customFields[index + 1], customFields[index]];
      
      this.setData({
        customFields: customFields
      });
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