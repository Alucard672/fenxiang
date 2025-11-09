// 新增字段页面逻辑
Page({
  data: {
    fieldName: '',
    selectedIcon: '',
    selectedColor: '',
    selectedColorObj: {},
    isEditMode: false,
    editFieldId: '',
    
    // 图标列表
    iconList: [
      'client-icon',
      'industry-icon', 
      'amount-icon',
      'description-icon',
      'remark-icon',
      'star-icon',
      'tag-icon',
      'heart-icon'
    ],
    
    // 颜色列表
    colorList: [
      {
        name: 'orange',
        background: 'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
        text: '#92400E'
      },
      {
        name: 'green',
        background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
        text: '#065F46'
      },
      {
        name: 'yellow',
        background: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
        text: '#78350F'
      },
      {
        name: 'purple',
        background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
        text: '#5B21B6'
      },
      {
        name: 'blue',
        background: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
        text: '#1E3A8A'
      },
      {
        name: 'pink',
        background: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
        text: '#991B1B'
      },
      {
        name: 'red',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
        text: 'white'
      }
    ]
  },

  onLoad(options) {
    // 判断是否为编辑模式
    if (options.mode === 'edit' && options.field) {
      this.setData({
        isEditMode: true,
        editFieldId: options.field
      });
      this.loadFieldData(options.field);
    } else {
      // 设置默认值
      this.setData({
        selectedIcon: this.data.iconList[0],
        selectedColor: this.data.colorList[0].name,
        selectedColorObj: this.data.colorList[0]
      });
    }
  },

  // 加载字段数据（编辑模式）
  loadFieldData(fieldId) {
    const customFields = wx.getStorageSync('customFields') || [];
    const field = customFields.find(f => f.id === fieldId);
    
    if (field) {
      this.setData({
        fieldName: field.name,
        selectedIcon: field.icon,
        selectedColor: field.color,
        selectedColorObj: this.data.colorList.find(c => c.name === field.color)
      });
    }
  },

  // 字段名称输入
  onFieldNameInput(e) {
    this.setData({
      fieldName: e.detail.value
    });
  },

  // 选择图标
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({
      selectedIcon: icon
    });
  },

  // 选择颜色
  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color.name,
      selectedColorObj: color
    });
  },

  // 保存字段
  saveField() {
    if (!this.data.fieldName) {
      wx.showToast({
        title: '请输入字段名称',
        icon: 'none'
      });
      return;
    }

    if (!this.data.selectedIcon) {
      wx.showToast({
        title: '请选择图标',
        icon: 'none'
      });
      return;
    }

    if (!this.data.selectedColor) {
      wx.showToast({
        title: '请选择颜色',
        icon: 'none'
      });
      return;
    }

    const fieldData = {
      id: this.data.isEditMode ? this.data.editFieldId : Date.now().toString(),
      name: this.data.fieldName,
      icon: this.data.selectedIcon,
      color: this.data.selectedColor,
      colorObj: this.data.selectedColorObj,
      createTime: this.data.isEditMode ? '' : new Date().toISOString()
    };

    // 获取现有字段
    let customFields = wx.getStorageSync('customFields') || [];

    if (this.data.isEditMode) {
      // 编辑模式：更新现有字段
      const index = customFields.findIndex(f => f.id === this.data.editFieldId);
      if (index !== -1) {
        customFields[index] = fieldData;
      }
    } else {
      // 新增模式：添加新字段
      customFields.push(fieldData);
    }

    // 保存到本地存储
    wx.setStorageSync('customFields', customFields);

    wx.showToast({
      title: this.data.isEditMode ? '修改成功' : '添加成功',
      icon: 'success'
    });

    // 延迟返回
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});