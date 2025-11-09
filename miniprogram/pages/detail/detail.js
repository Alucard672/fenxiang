// 作品详情页逻辑
Page({
  data: {
    workDetail: {
      creator: '云作品小萌新',
      client: '待点添加',
      industry: '待点添加',
      amount: '待点添加',
      description: '待点添加',
      remark: '待点添加'
    }
  },

  onLoad(options) {
    // 获取传递的作品ID
    if (options.id) {
      // 判断是否为新作品
      if (options.isNew === 'true') {
        console.log('创建新作品:', options.id, options.name)
        // 初始化新作品数据
        this.initNewWork(options.id, options.name)
      } else {
        this.loadWorkDetail(options.id);
      }
    }
  },

  // 加载作品详情
  loadWorkDetail(id) {
    // 这里可以根据ID从服务器或本地存储获取作品详情
    console.log('加载作品详情:', id);
  },

  // 初始化新作品
  initNewWork(id, name) {
    console.log('初始化新作品:', id, name);
    // 设置新作品的基本信息
    this.setData({
      workDetail: {
        ...this.data.workDetail,
        id: id,
        name: name,
        createTime: new Date().toLocaleString(),
        isNew: true
      }
    });
    
    // 显示提示
    wx.showToast({
      title: '新建作品成功',
      icon: 'success',
      duration: 1500
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 添加图片
  addImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        console.log('选择图片:', tempFilePaths);
        // 这里可以上传图片到服务器
      }
    });
  },

  // 编辑简介
  editIntro() {
    wx.showToast({
      title: '编辑功能',
      icon: 'none'
    });
  },

  // 输入处理函数
  onClientInput(e) {
    this.setData({
      'workDetail.client': e.detail.value
    });
  },

  onIndustryInput(e) {
    this.setData({
      'workDetail.industry': e.detail.value
    });
  },

  onAmountInput(e) {
    this.setData({
      'workDetail.amount': e.detail.value
    });
  },

  onDescriptionInput(e) {
    this.setData({
      'workDetail.description': e.detail.value
    });
  },

  onRemarkInput(e) {
    this.setData({
      'workDetail.remark': e.detail.value
    });
  },

  // 保存作品
  saveWork() {
    const workDetail = this.data.workDetail;
    
    if (workDetail.isNew) {
      // 新作品保存逻辑
      console.log('保存新作品:', workDetail);
      
      // 这里可以调用API保存到服务器或本地存储
      wx.setStorageSync('work_' + workDetail.id, {
        ...workDetail,
        saveTime: new Date().toLocaleString(),
        isNew: false // 标记为已保存
      });
      
      this.setData({
        'workDetail.isNew': false
      });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '作品已保存',
        icon: 'none'
      });
    }
  },

  // 分享作品
  shareWork() {
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });
      }
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '看看我的作品',
      path: '/pages/detail/detail'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '我的作品展示'
    };
  }
});