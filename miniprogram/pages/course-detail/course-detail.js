// pages/course-detail/course-detail.js
// 课程详情页
Page({
  data: {
    courseId: '',
    course: null,
    loading: true,
    dayNames: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    weekTypeNames: { all: '每周', odd: '单周', even: '双周' }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ courseId: options.id })
      this.loadCourseDetail()
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadCourseDetail() {
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'courseOperations',
        data: {
          action: 'getDetail',
          courseId: this.data.courseId
        }
      })
      
      if (res.result.success) {
        this.setData({ 
          course: res.result.data,
          loading: false 
        })
      } else {
        wx.showToast({ title: res.result.message || '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('加载课程详情失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  onEdit() {
    wx.navigateTo({
      url: `/pages/course-edit/course-edit?id=${this.data.courseId}`
    })
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这门课程吗？删除后无法恢复。',
      confirmColor: '#F56C6C',
      success: async (res) => {
        if (res.confirm) {
          await this.doDelete()
        }
      }
    })
  },

  async doDelete() {
    wx.showLoading({ title: '删除中' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'courseOperations',
        data: {
          action: 'delete',
          courseId: this.data.courseId
        }
      })
      
      wx.hideLoading()
      
      if (res.result.success) {
        wx.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({ title: res.result.message || '删除失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('删除课程失败:', err)
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  }
})
