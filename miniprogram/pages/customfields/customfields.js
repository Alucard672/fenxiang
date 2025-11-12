// 移除旧图标映射，直接使用 TDesign 图标名称
Page({
  data: {
    customFields: [],
    showAddModal: false,
    loading: false,
    draggingIndex: -1,
    draggingId: ''
  },

  onLoad() {
    this.loadCustomFields()
  },

  onShow() {
    this.loadCustomFields()
  },

  async loadCustomFields() {
    this.setData({ loading: true })

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
        const list = (result.result.data.list || []).map((field, index) => ({
          _id: field._id,
          name: field.name,
          icon: field.icon || 'user-1',
          color: field.color || '',
          colorObj: field.colorObj || {},
          type: field.type || 'text',
          options: field.options || [],
          required: !!field.required,
          description: field.description || '',
          sortOrder: typeof field.sortOrder === 'number' ? field.sortOrder : index
        }))

        const sortedList = list.sort((a, b) => a.sortOrder - b.sortOrder)

        this.setData({
          customFields: sortedList
        })

        wx.setStorageSync('customFields', sortedList)
      } else {
        this.setData({ customFields: [] })
      }
    } catch (error) {
      console.error('加载自定义字段失败:', error)
      this.setData({ customFields: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  showAddField() {
    this.setData({
      showAddModal: true
    })
  },

  hideAddModal() {
    this.setData({
      showAddModal: false
    })
  },

  goToAddField() {
    wx.navigateTo({
      url: '/pages/addfield/addfield'
    })
    this.hideAddModal()
  },

  editField(e) {
    const fieldId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/addfield/addfield?mode=edit&field=${fieldId}`
    })
  },

  deleteField(e) {
    const fieldId = e.currentTarget.dataset.id
    const fieldName = e.currentTarget.dataset.name

    wx.showModal({
      title: '删除字段',
      content: `确定要删除字段"${fieldName}"吗？`,
      confirmText: '删除',
      confirmColor: '#E7000B',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '正在删除', mask: true })
            const result = await wx.cloud.callFunction({
              name: 'system',
              data: {
                action: 'deleteCustomField',
                _id: fieldId
              }
            })

            if (result?.result?.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadCustomFields()
            } else {
              wx.showToast({
                title: result?.result?.error || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除字段失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  async moveFieldUp(e) {
    const fieldId = e.currentTarget.dataset.id
    const index = this.data.customFields.findIndex(field => field._id === fieldId)

    if (index > 0) {
      const updated = [...this.data.customFields]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      await this.syncSortOrder(updated)
    }
  },

  async moveFieldDown(e) {
    const fieldId = e.currentTarget.dataset.id
    const index = this.data.customFields.findIndex(field => field._id === fieldId)

    if (index < this.data.customFields.length - 1) {
      const updated = [...this.data.customFields]
      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
      await this.syncSortOrder(updated)
    }
  },

  handleDragStart(e) {
    const index = e.currentTarget.dataset.index
    if (index === undefined) return
    const touch = e.touches?.[0] || e.changedTouches?.[0]
    this.dragStartY = touch?.clientY || 0
    this.pendingSortedList = null
    this.setData({
      draggingIndex: index,
      draggingId: this.data.customFields[index]?._id || ''
    })
  },

  handleDragMove(e) {
    if (this.data.draggingIndex === -1) return
    const touch = e.touches?.[0] || e.changedTouches?.[0]
    const currentY = touch?.clientY || 0
    const delta = currentY - (this.dragStartY || 0)
    const ITEM_HEIGHT = 96
    let updatedIndex = this.data.draggingIndex
    const list = [...this.data.customFields]
    let swapped = false

    if (delta > ITEM_HEIGHT / 2 && updatedIndex < list.length - 1) {
      ;[list[updatedIndex], list[updatedIndex + 1]] = [list[updatedIndex + 1], list[updatedIndex]]
      updatedIndex += 1
      swapped = true
      this.dragStartY = currentY
    } else if (delta < -ITEM_HEIGHT / 2 && updatedIndex > 0) {
      ;[list[updatedIndex], list[updatedIndex - 1]] = [list[updatedIndex - 1], list[updatedIndex]]
      updatedIndex -= 1
      swapped = true
      this.dragStartY = currentY
    }

    if (swapped) {
      this.pendingSortedList = list
      this.setData({
        customFields: list,
        draggingIndex: updatedIndex,
        draggingId: list[updatedIndex]?._id || ''
      })
    }
  },

  handleDragEnd() {
    if (this.data.draggingIndex === -1) return
    const list = this.pendingSortedList || this.data.customFields
    this.syncSortOrder(list)
    this.dragStartY = null
    this.pendingSortedList = null
    this.setData({
      draggingIndex: -1,
      draggingId: ''
    })
  },

  handleDragCancel() {
    this.handleDragEnd()
  },

  async syncSortOrder(list) {
    const ordered = list.map((field, index) => ({
      ...field,
      sortOrder: index
    }))

    this.setData({ customFields: ordered })
    wx.setStorageSync('customFields', ordered)

    try {
      await wx.cloud.callFunction({
        name: 'system',
        data: {
          action: 'reorderCustomFields',
          orders: ordered.map(field => ({
            _id: field._id,
            sortOrder: field.sortOrder
          }))
        }
      })
    } catch (error) {
      console.error('同步排序失败:', error)
    }
  }
})