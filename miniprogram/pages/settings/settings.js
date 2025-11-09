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
    
    // 弹窗状态
    showCustomFieldsModal: false,
    
    // 自定义字段列表
    customFields: [],
    
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
    
    // 加载自定义字段
    this.loadCustomFields();
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

  // 打开自定义字段管理
  openCustomFields() {
    this.setData({
      showCustomFieldsModal: true
    });
  },

  // 关闭自定义字段弹窗
  closeCustomFields() {
    this.setData({
      showCustomFieldsModal: false
    });
  },

  // 添加新字段
  addNewField() {
    wx.navigateTo({
      url: '/pages/addfield/addfield'
    });
  },

  // 编辑字段
  editField(e) {
    const field = e.currentTarget.dataset.field;
    wx.navigateTo({
      url: `/pages/addfield/addfield?field=${field}&mode=edit`
    });
  },

  // 删除字段
  deleteField(e) {
    const field = e.currentTarget.dataset.field;
    wx.showModal({
      title: '删除字段',
      content: '确定要删除这个字段吗？删除后相关数据将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          // 获取现有字段
          let customFields = wx.getStorageSync('customFields') || [];
          
          // 删除指定字段
          customFields = customFields.filter(f => f.id !== field);
          
          // 保存到本地存储
          wx.setStorageSync('customFields', customFields);
          
          // 重新加载字段列表
          this.loadCustomFields();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 加载自定义字段
  loadCustomFields() {
    // 获取保存的字段顺序
    const fieldOrder = wx.getStorageSync('fieldOrder') || [];
    
    // 默认字段
    const defaultFields = [
      {
        id: 'client',
        name: '客户',
        icon: 'client-icon',
        color: 'orange',
        colorObj: {
          background: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
          text: '#92400E'
        },
        isDefault: true
      },
      {
        id: 'industry',
        name: '行业',
        icon: 'industry-icon',
        color: 'green',
        colorObj: {
          background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
          text: '#065F46'
        },
        isDefault: true
      },
      {
        id: 'amount',
        name: '金额',
        icon: 'amount-icon',
        color: 'yellow',
        colorObj: {
          background: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
          text: '#78350F'
        },
        isDefault: true
      },
      {
        id: 'description',
        name: '描述',
        icon: 'description-icon',
        color: 'purple',
        colorObj: {
          background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
          text: '#5B21B6'
        },
        isDefault: true
      },
      {
        id: 'remark',
        name: '备注',
        icon: 'remark-icon',
        color: 'blue',
        colorObj: {
          background: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
          text: '#1E3A8A'
        },
        isDefault: true
      }
    ];

    // 获取自定义字段
    const customFields = wx.getStorageSync('customFields') || [];
    
    // 合并默认字段和自定义字段
    let allFields = [...defaultFields, ...customFields];
    
    // 根据保存的顺序重新排列
    if (fieldOrder.length > 0) {
      allFields.sort((a, b) => {
        const aIndex = fieldOrder.indexOf(a.id);
        const bIndex = fieldOrder.indexOf(b.id);
        
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return aIndex - bIndex;
      });
    }
    
    this.setData({
      customFields: allFields
    });
  },

  // 上移字段
  moveFieldUp(e) {
    const index = e.currentTarget.dataset.index;
    if (index <= 0) return;
    
    const customFields = [...this.data.customFields];
    const field = customFields[index];
    
    // 交换位置
    customFields[index] = customFields[index - 1];
    customFields[index - 1] = field;
    
    this.setData({
      customFields: customFields
    });
    
    // 保存新的顺序
    this.saveFieldOrder(customFields);
  },

  // 下移字段
  moveFieldDown(e) {
    const index = e.currentTarget.dataset.index;
    if (index >= this.data.customFields.length - 1) return;
    
    const customFields = [...this.data.customFields];
    const field = customFields[index];
    
    // 交换位置
    customFields[index] = customFields[index + 1];
    customFields[index + 1] = field;
    
    this.setData({
      customFields: customFields
    });
    
    // 保存新的顺序
    this.saveFieldOrder(customFields);
  },

  // 保存字段顺序
  saveFieldOrder(fields) {
    const fieldOrder = fields.map(field => field.id);
    wx.setStorageSync('fieldOrder', fieldOrder);
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

  // 主页排序选择
  onHomeSortOrderChange(e) {
    this.setData({
      homeSortOrderIndex: e.detail.value
    });
    this.updateDisplayText();
  },

  // 作品排序选择
  onWorkSortOrderChange(e) {
    this.setData({
      workSortOrderIndex: e.detail.value
    });
    this.updateDisplayText();
  },

  // 主页显示样式选择
  onHomeDisplayStyleChange(e) {
    this.setData({
      homeDisplayStyleIndex: e.detail.value
    });
    this.updateDisplayText();
  },

  // 作品显示样式选择
  onWorkDisplayStyleChange(e) {
    this.setData({
      workDisplayStyleIndex: e.detail.value
    });
    this.updateDisplayText();
  }
});