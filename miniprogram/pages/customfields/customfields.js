Page({
  data: {
    customFields: [],
    showAddModal: false
  },

  onLoad() {
    this.loadCustomFields();
  },

  onShow() {
    // 每次显示页面时重新加载数据（从添加页面返回时）
    this.loadCustomFields();
  },

  // 加载自定义字段
  loadCustomFields() {
    const customFields = wx.getStorageSync('customFields') || [];
    this.setData({
      customFields: customFields
    });
  },

  // 显示添加字段弹窗
  showAddField() {
    this.setData({
      showAddModal: true
    });
  },

  // 隐藏添加字段弹窗
  hideAddModal() {
    this.setData({
      showAddModal: false
    });
  },

  // 跳转到添加字段页面
  goToAddField() {
    wx.navigateTo({
      url: '/pages/addfield/addfield'
    });
    this.hideAddModal();
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
          let customFields = wx.getStorageSync('customFields') || [];
          customFields = customFields.filter(field => field.id !== fieldId);
          wx.setStorageSync('customFields', customFields);
          
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
    let customFields = wx.getStorageSync('customFields') || [];
    const index = customFields.findIndex(field => field.id === fieldId);
    
    if (index > 0) {
      // 交换位置
      [customFields[index], customFields[index - 1]] = [customFields[index - 1], customFields[index]];
      wx.setStorageSync('customFields', customFields);
      
      this.setData({
        customFields: customFields
      });
    }
  },

  // 字段下移
  moveFieldDown(e) {
    const fieldId = e.currentTarget.dataset.id;
    let customFields = wx.getStorageSync('customFields') || [];
    const index = customFields.findIndex(field => field.id === fieldId);
    
    if (index < customFields.length - 1) {
      // 交换位置
      [customFields[index], customFields[index + 1]] = [customFields[index + 1], customFields[index]];
      wx.setStorageSync('customFields', customFields);
      
      this.setData({
        customFields: customFields
      });
    }
  }
});