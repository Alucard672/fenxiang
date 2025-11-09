Page({
  data: {
    showEditModal: false,
    currentWorkName: '未命名作品',
    currentWorkId: null,
    showProfile: false,
    userInfo: {
      name: '云作品小萌新',
      title: '个人信息'
    }
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
    wx.showToast({
      title: '作品标签功能开发中',
      icon: 'none'
    })
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

  // 偏好设置
  handleSettings() {
    console.log('点击偏好设置')
    // 跳转到偏好设置页面
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