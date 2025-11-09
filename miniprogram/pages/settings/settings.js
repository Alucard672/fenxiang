// 偏好设置页面逻辑
Page({
  data: {
    // 设置数据
    settings: {
      // 访客提醒规则
      newVisitorAlert: false,
      
      // 访客登录方式
      noApplication: false,
      noPhoneAuth: false,
      
      // 访客浏览权限
      showEXIF: true,
      showSameTagWorks: true,
      
      // 访客保存权限
      watermarkSmall: true,
      noWatermarkSmall: false,
      noWatermarkOriginal: false,
      
      // 水印展示范围
      watermarkCover: true,
      watermarkDetail: true,
      watermarkPreview: true,
      watermarkPoster: true
    },
    
    // 排序选项
    homeSortOrderOptions: [
      { value: 'earliest', text: '最早加入主页的在前' },
      { value: 'latest', text: '最新加入主页的在前' },
      { value: 'nameAsc', text: '按名称升序排列' },
      { value: 'nameDesc', text: '按名称降序排列' }
    ],
    
    workSortOrderOptions: [
      { value: 'earliest', text: '最早加入作品的在前' },
      { value: 'latest', text: '最新加入作品的在前' },
      { value: 'nameAsc', text: '按名称升序排列' },
      { value: 'nameDesc', text: '按名称降序排列' }
    ],
    
    // 显示样式选项
    homeDisplayStyleOptions: [
      { value: 'single', text: '单列' },
      { value: 'double', text: '双列' },
      { value: 'masonry', text: '瀑布流' }
    ],
    
    workDisplayStyleOptions: [
      { value: 'single', text: '单列' },
      { value: 'double', text: '双列（竖齐排列）' },
      { value: 'doubleHorizontal', text: '双列（横齐排列）' },
      { value: 'masonry', text: '瀑布流' }
    ],
    
    // 当前选中的值
    homeSortOrderIndex: 0,
    workSortOrderIndex: 0,
    homeDisplayStyleIndex: 1, // 默认双列
    workDisplayStyleIndex: 1, // 默认双列（竖齐排列）
    
    // 显示文本
    homeSortOrderText: '最早加入主页的在前',
    workSortOrderText: '最早加入作品的在前',
    homeDisplayStyleText: '双列',
    workDisplayStyleText: '双列（竖齐排列）'
  },

  onLoad() {
    // 加载保存的设置
    this.loadSettings();
  },

  // 加载设置
  loadSettings() {
    try {
      const savedSettings = wx.getStorageSync('user_settings');
      if (savedSettings) {
        this.setData({
          settings: {
            ...this.data.settings,
            ...savedSettings.settings
          },
          homeSortOrderIndex: savedSettings.homeSortOrderIndex || 0,
          workSortOrderIndex: savedSettings.workSortOrderIndex || 0,
          homeDisplayStyleIndex: savedSettings.homeDisplayStyleIndex || 1,
          workDisplayStyleIndex: savedSettings.workDisplayStyleIndex || 1
        });
        this.updateDisplayText();
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  },

  // 保存设置
  saveSettings() {
    try {
      const settingsData = {
        settings: this.data.settings,
        homeSortOrderIndex: this.data.homeSortOrderIndex,
        workSortOrderIndex: this.data.workSortOrderIndex,
        homeDisplayStyleIndex: this.data.homeDisplayStyleIndex,
        workDisplayStyleIndex: this.data.workDisplayStyleIndex
      };
      wx.setStorageSync('user_settings', settingsData);
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error',
        duration: 1500
      });
    }
  },

  // 更新显示文本
  updateDisplayText() {
    this.setData({
      homeSortOrderText: this.data.homeSortOrderOptions[this.data.homeSortOrderIndex].text,
      workSortOrderText: this.data.workSortOrderOptions[this.data.workSortOrderIndex].text,
      homeDisplayStyleText: this.data.homeDisplayStyleOptions[this.data.homeDisplayStyleIndex].text,
      workDisplayStyleText: this.data.workDisplayStyleOptions[this.data.workDisplayStyleIndex].text
    });
  },

  // 返回上一页
  goBack() {
    this.saveSettings();
    wx.navigateBack({
      delta: 1
    });
  },

  // 访客提醒规则开关
  onNewVisitorAlertChange(e) {
    this.setData({
      'settings.newVisitorAlert': e.detail.value
    });
  },

  // 访客登录方式开关
  onNoApplicationChange(e) {
    this.setData({
      'settings.noApplication': e.detail.value
    });
  },

  onNoPhoneAuthChange(e) {
    this.setData({
      'settings.noPhoneAuth': e.detail.value
    });
  },

  // 访客浏览权限开关
  onShowEXIFChange(e) {
    this.setData({
      'settings.showEXIF': e.detail.value
    });
  },

  onShowSameTagWorksChange(e) {
    this.setData({
      'settings.showSameTagWorks': e.detail.value
    });
  },

  // 访客保存权限开关
  onWatermarkSmallChange(e) {
    this.setData({
      'settings.watermarkSmall': e.detail.value
    });
  },

  onNoWatermarkSmallChange(e) {
    this.setData({
      'settings.noWatermarkSmall': e.detail.value
    });
  },

  onNoWatermarkOriginalChange(e) {
    this.setData({
      'settings.noWatermarkOriginal': e.detail.value
    });
  },

  // 水印展示范围开关
  onWatermarkCoverChange(e) {
    this.setData({
      'settings.watermarkCover': e.detail.value
    });
  },

  onWatermarkDetailChange(e) {
    this.setData({
      'settings.watermarkDetail': e.detail.value
    });
  },

  onWatermarkPreviewChange(e) {
    this.setData({
      'settings.watermarkPreview': e.detail.value
    });
  },

  onWatermarkPosterChange(e) {
    this.setData({
      'settings.watermarkPoster': e.detail.value
    });
  },

  // 编辑作品标签
  editWorkTags() {
    wx.showToast({
      title: '跳转到编辑作品标签',
      icon: 'none',
      duration: 1500
    });
    // 这里可以跳转到编辑作品标签页面
    // wx.navigateTo({
    //   url: '/pages/edittags/edittags'
    // });
  },

  // 设置水印样式
  setWatermarkStyle() {
    wx.showToast({
      title: '跳转到水印样式设置',
      icon: 'none',
      duration: 1500
    });
    // 这里可以跳转到水印样式设置页面
    // wx.navigateTo({
    //   url: '/pages/watermark/watermark'
    // });
  },

  // 查看示例
  viewCoverExample() {
    this.showExample('作品封面图');
  },

  viewDetailExample() {
    this.showExample('作品详情图');
  },

  viewPreviewExample() {
    this.showExample('作品预览图');
  },

  viewPosterExample() {
    this.showExample('作品海报图');
  },

  showExample(type) {
    wx.showModal({
      title: type + '示例',
      content: '这里将显示' + type + '的水印效果示例',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 修改主页排序方式
  changeHomeSortOrder() {
    const options = this.data.homeSortOrderOptions.map(option => option.text);
    wx.showActionSheet({
      itemList: options,
      success: (res) => {
        this.setData({
          homeSortOrderIndex: res.tapIndex
        });
        this.updateDisplayText();
      }
    });
  },

  // 修改作品排序方式
  changeWorkSortOrder() {
    const options = this.data.workSortOrderOptions.map(option => option.text);
    wx.showActionSheet({
      itemList: options,
      success: (res) => {
        this.setData({
          workSortOrderIndex: res.tapIndex
        });
        this.updateDisplayText();
      }
    });
  },

  // 修改主页显示样式
  changeHomeDisplayStyle() {
    const options = this.data.homeDisplayStyleOptions.map(option => option.text);
    wx.showActionSheet({
      itemList: options,
      success: (res) => {
        this.setData({
          homeDisplayStyleIndex: res.tapIndex
        });
        this.updateDisplayText();
      }
    });
  },

  // 修改作品显示样式
  changeWorkDisplayStyle() {
    const options = this.data.workDisplayStyleOptions.map(option => option.text);
    wx.showActionSheet({
      itemList: options,
      success: (res) => {
        this.setData({
          workDisplayStyleIndex: res.tapIndex
        });
        this.updateDisplayText();
      }
    });
  },

  // 页面卸载时保存设置
  onUnload() {
    this.saveSettings();
  }
});