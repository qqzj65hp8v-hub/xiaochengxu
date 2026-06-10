// pages/week-select/week-select.js
// 周次选择页
Page({
  data: {
    weeks: [],
    currentWeekId: '',
    loading: true,
    showAddModal: false,
    newWeekNumber: 1,
    newWeekName: ''
  },

  onLoad() {
    this.loadWeeks()
  },

  onShow() {
    this.loadWeeks()
  },

  async loadWeeks() {
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'weekOperations',
        data: { action: 'getList' }
      })
      
      if (res.result.success) {
        const weeks = res.result.data
        const currentWeek = weeks.find(w => w.isCurrent)
        this.setData({ 
          weeks, 
          currentWeekId: currentWeek ? currentWeek._id : '',
          loading: false 
        })
      } else {
        wx.showToast({ title: res.result.message || '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('加载周次失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  async onSelectWeek(e) {
    const { id } = e.currentTarget.dataset
    
    if (id === this.data.currentWeekId) {
      wx.switchTab({ url: '/pages/index/index' })
      return
    }

    wx.showLoading({ title: '切换中' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'weekOperations',
        data: { action: 'setCurrent', weekId: id }
      })
      
      wx.hideLoading()
      
      if (res.result.success) {
        this.setData({ currentWeekId: id })
        wx.showToast({ title: '切换成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      } else {
        wx.showToast({ title: res.result.message || '切换失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('切换周次失败:', err)
      wx.showToast({ title: '切换失败', icon: 'none' })
    }
  },

  onShowAddModal() {
    const nextWeekNum = this.data.weeks.length > 0 
      ? Math.max(...this.data.weeks.map(w => w.weekNumber)) + 1 
      : 1
    
    this.setData({ 
      showAddModal: true,
      newWeekNumber: nextWeekNum,
      newWeekName: `第${nextWeekNum}周`
    })
  },

  onHideAddModal() {
    this.setData({ showAddModal: false })
  },

  onWeekNameInput(e) {
    this.setData({ newWeekName: e.detail.value })
  },

  async onAddWeek() {
    if (!this.data.newWeekNumber || this.data.newWeekNumber < 1) {
      wx.showToast({ title: '周次序号无效', icon: 'none' })
      return
    }

    wx.showLoading({ title: '添加中' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'weekOperations',
        data: {
          action: 'add',
          weekData: {
            weekNumber: this.data.newWeekNumber,
            weekName: this.data.newWeekName || `第${this.data.newWeekNumber}周`
          }
        }
      })
      
      wx.hideLoading()
      
      if (res.result.success) {
        wx.showToast({ title: '添加成功', icon: 'success' })
        this.setData({ showAddModal: false })
        this.loadWeeks()
      } else {
        wx.showToast({ title: res.result.message || '添加失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('添加周次失败:', err)
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  async onDeleteWeek(e) {
    const { id, name } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${name}"吗？`,
      confirmColor: '#F56C6C',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' })
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'weekOperations',
              data: { action: 'delete', weekId: id }
            })
            
            wx.hideLoading()
            
            if (result.result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadWeeks()
            } else {
              wx.showToast({ title: result.result.message || '删除失败', icon: 'none' })
            }
          } catch (err) {
            wx.hideLoading()
            console.error('删除周次失败:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadWeeks().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
