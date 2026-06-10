// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  try {
    switch (action) {
      case 'add':
        return await addCourse(event, openid)
      case 'update':
        return await updateCourse(event, openid)
      case 'delete':
        return await deleteCourse(event, openid)
      case 'getList':
        return await getCourseList(event, openid)
      case 'getDetail':
        return await getCourseDetail(event, openid)
      default:
        return { success: false, message: '未知的操作类型' }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { success: false, message: err.message || '服务器错误' }
  }
}

// 新增课程
async function addCourse(event, openid) {
  const { courseData } = event
  
  if (!courseData.courseName) {
    return { success: false, message: '课程名称不能为空' }
  }
  if (!courseData.dayOfWeek || courseData.dayOfWeek < 1 || courseData.dayOfWeek > 7) {
    return { success: false, message: '请选择正确的星期' }
  }
  if (!courseData.startSlot || !courseData.endSlot) {
    return { success: false, message: '请选择上课节次' }
  }
  if (courseData.startSlot > courseData.endSlot) {
    return { success: false, message: '开始节次不能大于结束节次' }
  }

  const now = db.serverDate()
  const data = {
    _openid: openid,
    courseName: courseData.courseName,
    teacher: courseData.teacher || '',
    location: courseData.location || '',
    dayOfWeek: courseData.dayOfWeek,
    startSlot: courseData.startSlot,
    endSlot: courseData.endSlot,
    weekType: courseData.weekType || 'all',
    weekNumbers: courseData.weekNumbers || [],
    color: courseData.color || '#4A90D9',
    remark: courseData.remark || '',
    createTime: now,
    updateTime: now
  }

  const result = await db.collection('courses').add({ data })
  return { success: true, data: { _id: result._id } }
}

// 更新课程
async function updateCourse(event, openid) {
  const { courseId, courseData } = event
  
  if (!courseId) {
    return { success: false, message: '课程ID不能为空' }
  }

  const courseDoc = await db.collection('courses').doc(courseId).get()
  if (!courseDoc.data || courseDoc.data._openid !== openid) {
    return { success: false, message: '无权限修改此课程' }
  }

  const now = db.serverDate()
  const updateData = {
    courseName: courseData.courseName,
    teacher: courseData.teacher || '',
    location: courseData.location || '',
    dayOfWeek: courseData.dayOfWeek,
    startSlot: courseData.startSlot,
    endSlot: courseData.endSlot,
    weekType: courseData.weekType || 'all',
    weekNumbers: courseData.weekNumbers || [],
    color: courseData.color || '#4A90D9',
    remark: courseData.remark || '',
    updateTime: now
  }

  await db.collection('courses').doc(courseId).update({ data: updateData })
  return { success: true }
}

// 删除课程
async function deleteCourse(event, openid) {
  const { courseId } = event
  
  if (!courseId) {
    return { success: false, message: '课程ID不能为空' }
  }

  const courseDoc = await db.collection('courses').doc(courseId).get()
  if (!courseDoc.data || courseDoc.data._openid !== openid) {
    return { success: false, message: '无权限删除此课程' }
  }

  await db.collection('courses').doc(courseId).remove()
  return { success: true }
}

// 获取课程列表
async function getCourseList(event, openid) {
  const { dayOfWeek, weekNumber } = event
  
  let query = db.collection('courses').where({ _openid: openid })
  
  if (dayOfWeek) {
    query = query.where({ dayOfWeek: parseInt(dayOfWeek) })
  }

  const result = await query.orderBy('dayOfWeek', 'asc').orderBy('startSlot', 'asc').get()
  
  let courses = result.data

  if (weekNumber) {
    const weekNum = parseInt(weekNumber)
    courses = courses.filter(course => {
      if (!course.weekNumbers || course.weekNumbers.length === 0) {
        if (course.weekType === 'odd') return weekNum % 2 === 1
        if (course.weekType === 'even') return weekNum % 2 === 0
        return true
      }
      return course.weekNumbers.includes(weekNum)
    })
  }

  return { success: true, data: courses }
}

// 获取课程详情
async function getCourseDetail(event, openid) {
  const { courseId } = event
  
  if (!courseId) {
    return { success: false, message: '课程ID不能为空' }
  }

  const result = await db.collection('courses').doc(courseId).get()
  
  if (!result.data || result.data._openid !== openid) {
    return { success: false, message: '课程不存在或无权限查看' }
  }

  return { success: true, data: result.data }
}
