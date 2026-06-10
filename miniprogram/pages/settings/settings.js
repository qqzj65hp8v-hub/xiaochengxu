// pages/settings/settings.js
// 设置页
Page({
  data: {
    version: '1.0.0',
    courseCount: 0,
    weekCount: 0
  },

  onLoad() {
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  async loadStats() {
    try {
      const courseRes = await wx.cloud.callFunction({
        name: 'courseOperations',
        data: { action: 'getList' }
      })
      
      const weekRes = await wx.cloud.callFunction({
        name: 'weekOperations',
        data: { action: 'getList' }
      })
      
      this.setData({
        courseCount: courseRes.result.success ? courseRes.result.data.length : 0,
        weekCount: weekRes.result.success ? weekRes.result.data.length : 0
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  onClearData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有课程数据吗？此操作不可恢复！',
      confirmColor: '#F56C6C',
      success: async (res) => {
        if (res.confirm) {
          await this.doClearData()
        }
      }
    })
  },

  async doClearData() {
    wx.showLoading({ title: '清空中' })
    
    try {
      const courseRes = await wx.cloud.callFunction({
        name: 'courseOperations',
        data: { action: 'getList' }
      })
      
      if (courseRes.result.success) {
        const courses = courseRes.result.data
        for (const course of courses) {
          await wx.cloud.callFunction({
            name: 'courseOperations',
            data: { action: 'delete', courseId: course._id }
          })
        }
      }
      
      const weekRes = await wx.cloud.callFunction({
        name: 'weekOperations',
        data: { action: 'getList' }
      })
      
      if (weekRes.result.success) {
        const weeks = weekRes.result.data
        for (const week of weeks) {
          await wx.cloud.callFunction({
            name: 'weekOperations',
            data: { action: 'delete', weekId: week._id }
          })
        }
      }
      
      wx.hideLoading()
      wx.showToast({ title: '清空成功', icon: 'success' })
      this.loadStats()
    } catch (err) {
      wx.hideLoading()
      console.error('清空数据失败:', err)
      wx.showToast({ title: '清空失败', icon: 'none' })
    }
  },

  onAbout() {
    wx.showModal({
      title: '关于我的课表',
      content: '版本：' + this.data.version + '\n\n一款简洁的课程表小程序，帮助你轻松管理每周课程安排。',
      showCancel: false
    })
  }
})
