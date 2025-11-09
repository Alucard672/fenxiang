Page({
  data: {
    tags: [
      {
        id: '1',
        name: '品牌设计',
        color: '#DC2626',
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        rank: 1
      },
      {
        id: '2',
        name: '网页设计',
        color: '#2563EB',
        background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
        rank: 2
      },
      {
        id: '3',
        name: 'UI设计',
        color: '#7C3AED',
        background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
        rank: 3
      },
      {
        id: '4',
        name: '平面设计',
        color: '#D97706',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        rank: 4
      },
      {
        id: '5',
        name: 'logo设计',
        color: '#EA580C',
        background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
        rank: 5
      },
      {
        id: '6',
        name: '电商设计',
        color: '#DB2777',
        background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
        rank: 6
      },
      {
        id: '7',
        name: '海报设计',
        color: '#059669',
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        rank: 7
      }
    ]
  },

  onLoad(options) {
    console.log('标签页面加载')
  },

  onShow() {
    console.log('标签页面显示')
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 添加新标签
  addNewTag() {
    wx.showToast({
      title: '添加新标签功能',
      icon: 'none'
    })
    // TODO: 跳转到添加标签页面或显示添加标签弹窗
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
  deleteTag(e) {
    const tagId = e.currentTarget.dataset.id
    const tagName = e.currentTarget.dataset.name
    
    wx.showModal({
      title: '删除标签',
      content: `确定要删除标签"${tagName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从数据中删除标签
          const tags = this.data.tags.filter(tag => tag.id !== tagId)
          this.setData({ tags })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})