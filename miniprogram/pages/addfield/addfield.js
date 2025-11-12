// 新增字段页面逻辑
Page({
  data: {
    fieldName: '',
    selectedIcon: '',
    selectedColor: '',
    selectedColorObj: {},
    isEditMode: false,
    editFieldId: '',
    
    // 图标列表（已统一为 TDesign 名称）
    iconList: [
      'user-1',
      'building-1', 
      'money',
      'file-1',
      'chat',
      'star',
      'tag',
      'heart'
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
  async loadFieldData(fieldId) {
    const customFields = wx.getStorageSync('customFields') || [];
    let field = customFields.find(f => f._id === fieldId || f.id === fieldId);

    if (!field) {
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
          field = (result.result.data.list || []).find(item => item._id === fieldId)
        }
      } catch (error) {
        console.error('加载字段详情失败:', error)
      }
    }

    if (field) {
      const colorObj = this.data.colorList.find(c => c.name === field.color) || field.colorObj || this.data.colorList[0]
      const normalizedColorObj = {
        ...colorObj,
        name: colorObj.name || field.color || this.data.colorList[0].name
      }
      this.setData({
        fieldName: field.name,
        selectedIcon: field.icon || this.data.iconList[0],
        selectedColor: normalizedColorObj.name,
        selectedColorObj: normalizedColorObj
      })
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
  async saveField() {
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

    const colorObj = {
      ...this.data.selectedColorObj,
      name: this.data.selectedColor
    }

    const payload = {
      name: this.data.fieldName,
      type: 'text',
      options: [],
      required: false,
      description: '',
      icon: this.data.selectedIcon,
      color: this.data.selectedColor,
      colorObj
    }

    wx.showLoading({
      title: this.data.isEditMode ? '保存中' : '创建中',
      mask: true
    })

    try {
      let result
      if (this.data.isEditMode) {
        result = await wx.cloud.callFunction({
          name: 'system',
          data: {
            action: 'updateCustomField',
            _id: this.data.editFieldId,
            ...payload
          }
        })
      } else {
        const currentFields = wx.getStorageSync('customFields') || []
        payload.sortOrder = currentFields.length
        result = await wx.cloud.callFunction({
          name: 'system',
          data: {
            action: 'createCustomField',
            ...payload,
            sortOrder: payload.sortOrder
          }
        })
      }

      if (result?.result?.success) {
        wx.showToast({
          title: this.data.isEditMode ? '修改成功' : '添加成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 800)
      } else {
        wx.showToast({
          title: result?.result?.error || '操作失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存字段失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
});