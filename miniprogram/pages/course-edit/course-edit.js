// pages/course-edit/course-edit.js
// 课程编辑页 - 新增/编辑课程
Page({
  data: {
    isEdit: false,
    courseId: '',
    courseName: '',
    teacher: '',
    location: '',
    dayOfWeek: 1,
    startSlot: 1,
    endSlot: 1,
    weekType: 'all',
    weekNumbers: [],
    color: '#4A90D9',
    remark: '',
    dayOptions: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    dayIndex: 0,
    slotOptions: ['第1节', '第2节', '第3节', '第4节', '第5节', '第6节', '第7节', '第8节', '第9节', '第10节'],
    startSlotIndex: 0,
    endSlotIndex: 0,
    weekTypeOptions: ['每周', '单周', '双周'],
    weekTypeIndex: 0,
    colors: ['#4A90D9', '#67C23A', '#E6A23C', '#F56C6C', '#9B59B6', '#3498DB', '#1ABC9C', '#E74C3C'],
    colorIndex: 0,
    weekOptions: [],
    selectedWeeks: [],
    submitting: false
  },

  onLoad(options) {
    this.initWeekOptions()
    
    if (options.id) {
      this.setData({ isEdit: true, courseId: options.id })
      this.loadCourseDetail(options.id)
    }
  },

  initWeekOptions() {
    const weekOptions = []
    for (let i = 1; i <= 20; i++) {
      weekOptions.push({ value: i, label: `第${i}周`, checked: false })
    }
    this.setData({ weekOptions })
  },

  async loadCourseDetail(courseId) {
    wx.showLoading({ title: '加载中' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'courseOperations',
        data: { action: 'getDetail', courseId }
      })
      
      wx.hideLoading()
      
      if (res.result.success) {
        const course = res.result.data
        const colorIndex = this.data.colors.indexOf(course.color)
        
        this.setData({
          courseName: course.courseName,
          teacher: course.teacher || '',
          location: course.location || '',
          dayOfWeek: course.dayOfWeek,
          dayIndex: course.dayOfWeek - 1,
          startSlot: course.startSlot,
          endSlot: course.endSlot,
          startSlotIndex: course.startSlot - 1,
          endSlotIndex: course.endSlot - 1,
          weekType: course.weekType || 'all',
          weekTypeIndex: course.weekType === 'odd' ? 1 : (course.weekType === 'even' ? 2 : 0),
          weekNumbers: course.weekNumbers || [],
          color: course.color,
          colorIndex: colorIndex >= 0 ? colorIndex : 0,
          remark: course.remark || ''
        })

        if (course.weekNumbers && course.weekNumbers.length > 0) {
          const weekOptions = this.data.weekOptions.map(w => ({
            ...w,
            checked: course.weekNumbers.includes(w.value)
          }))
          this.setData({ weekOptions })
        }
      } else {
        wx.showToast({ title: res.result.message || '加载失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载课程详情失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail.value })
  },

  onDayChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      dayIndex: index,
      dayOfWeek: index + 1
    })
  },

  onStartSlotChange(e) {
    const index = parseInt(e.detail.value)
    const startSlot = index + 1
    let endSlot = this.data.endSlot
    
    if (startSlot > endSlot) {
      endSlot = startSlot
    }
    
    this.setData({
      startSlotIndex: index,
      startSlot,
      endSlot,
      endSlotIndex: endSlot - 1
    })
  },

  onEndSlotChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      endSlotIndex: index,
      endSlot: index + 1
    })
  },

  onWeekTypeChange(e) {
    const index = parseInt(e.detail.value)
    const weekTypes = ['all', 'odd', 'even']
    this.setData({
      weekTypeIndex: index,
      weekType: weekTypes[index]
    })
  },

  onColorSelect(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      colorIndex: index,
      color: this.data.colors[index]
    })
  },

  onWeekSelect(e) {
    const { index } = e.currentTarget.dataset
    const weekOptions = this.data.weekOptions
    weekOptions[index].checked = !weekOptions[index].checked
    
    const selectedWeeks = weekOptions.filter(w => w.checked).map(w => w.value)
    this.setData({ weekOptions, selectedWeeks })
  },

  async onSubmit() {
    if (!this.data.courseName.trim()) {
      wx.showToast({ title: '请输入课程名称', icon: 'none' })
      return
    }

    if (this.data.startSlot > this.data.endSlot) {
      wx.showToast({ title: '开始节次不能大于结束节次', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中' })

    const courseData = {
      courseName: this.data.courseName.trim(),
      teacher: this.data.teacher.trim(),
      location: this.data.location.trim(),
      dayOfWeek: this.data.dayOfWeek,
      startSlot: this.data.startSlot,
      endSlot: this.data.endSlot,
      weekType: this.data.weekType,
      weekNumbers: this.data.selectedWeeks,
      color: this.data.color,
      remark: this.data.remark.trim()
    }

    try {
      let res
      if (this.data.isEdit) {
        res = await wx.cloud.callFunction({
          name: 'courseOperations',
          data: {
            action: 'update',
            courseId: this.data.courseId,
            courseData
          }
        })
      } else {
        res = await wx.cloud.callFunction({
          name: 'courseOperations',
          data: { action: 'add', courseData }
        })
      }

      wx.hideLoading()
      this.setData({ submitting: false })

      if (res.result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({ title: res.result.message || '保存失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      this.setData({ submitting: false })
      console.error('保存课程失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
