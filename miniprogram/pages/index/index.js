// index.js
// 首页 - 周视图课程表
Page({
  data: {
    currentWeek: 1,
    currentWeekName: '第1周',
    weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeSlots: [
      { label: '第1节', time: '8:00-8:45' },
      { label: '第2节', time: '8:55-9:40' },
      { label: '第3节', time: '10:00-10:45' },
      { label: '第4节', time: '10:55-11:40' },
      { label: '第5节', time: '14:00-14:45' },
      { label: '第6节', time: '14:55-15:40' },
      { label: '第7节', time: '16:00-16:45' },
      { label: '第8节', time: '16:55-17:40' },
      { label: '第9节', time: '19:00-19:45' },
      { label: '第10节', time: '19:55-20:40' }
    ],
    courses: [],
    tableData: {},
    loading: true,
    colors: ['#4A90D9', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#3498DB', '#1ABC9C']
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    this.loadCourses()
  },

  async initData() {
    await this.loadCurrentWeek()
    await this.loadCourses()
  },

  async loadCurrentWeek() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'weekOperations',
        data: { action: 'getCurrent' }
      })
      
      if (res.result.success && res.result.data) {
        this.setData({
          currentWeek: res.result.data.weekNumber,
          currentWeekName: res.result.data.weekName
        })
      }
    } catch (err) {
      console.error('获取当前周失败:', err)
    }
  },

  async loadCourses() {
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'courseOperations',
        data: {
          action: 'getList',
          weekNumber: this.data.currentWeek
        }
      })
      
      if (res.result.success) {
        const courses = res.result.data
        const tableData = this.groupCoursesByDay(courses)
        this.setData({ courses, tableData, loading: false })
      } else {
        wx.showToast({ title: res.result.message || '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('加载课程失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  groupCoursesByDay(courses) {
    const tableData = {}
    for (let i = 1; i <= 7; i++) {
      tableData[i] = []
    }
    
    courses.forEach(course => {
      if (tableData[course.dayOfWeek]) {
        tableData[course.dayOfWeek].push(course)
      }
    })
    
    for (let i = 1; i <= 7; i++) {
      tableData[i].sort((a, b) => a.startSlot - b.startSlot)
    }
    
    return tableData
  },

  goToCourseDetail(e) {
    const courseId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  },

  goToAddCourse() {
    wx.navigateTo({
      url: '/pages/course-edit/course-edit'
    })
  },

  onPullDownRefresh() {
    this.loadCourses().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onWeekChange() {
    wx.navigateTo({
      url: '/pages/week-select/week-select'
    })
  }
})
