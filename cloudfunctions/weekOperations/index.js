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
        return await addWeek(event, openid)
      case 'update':
        return await updateWeek(event, openid)
      case 'delete':
        return await deleteWeek(event, openid)
      case 'getList':
        return await getWeekList(openid)
      case 'setCurrent':
        return await setCurrentWeek(event, openid)
      case 'getCurrent':
        return await getCurrentWeek(openid)
      default:
        return { success: false, message: '未知的操作类型' }
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    return { success: false, message: err.message || '服务器错误' }
  }
}

// 新增周次
async function addWeek(event, openid) {
  const { weekData } = event
  
  if (!weekData.weekNumber || weekData.weekNumber < 1) {
    return { success: false, message: '周次序号必须大于0' }
  }

  const existResult = await db.collection('weeks').where({
    _openid: openid,
    weekNumber: weekData.weekNumber
  }).get()

  if (existResult.data.length > 0) {
    return { success: false, message: '该周次已存在' }
  }

  const now = db.serverDate()
  const data = {
    _openid: openid,
    weekName: weekData.weekName || `第${weekData.weekNumber}周`,
    weekNumber: weekData.weekNumber,
    startDate: weekData.startDate || null,
    isCurrent: weekData.isCurrent || false,
    createTime: now
  }

  const result = await db.collection('weeks').add({ data })
  return { success: true, data: { _id: result._id } }
}

// 更新周次
async function updateWeek(event, openid) {
  const { weekId, weekData } = event
  
  if (!weekId) {
    return { success: false, message: '周次ID不能为空' }
  }

  const weekDoc = await db.collection('weeks').doc(weekId).get()
  if (!weekDoc.data || weekDoc.data._openid !== openid) {
    return { success: false, message: '无权限修改此周次' }
  }

  const updateData = {
    weekName: weekData.weekName,
    startDate: weekData.startDate || null
  }

  await db.collection('weeks').doc(weekId).update({ data: updateData })
  return { success: true }
}

// 删除周次
async function deleteWeek(event, openid) {
  const { weekId } = event
  
  if (!weekId) {
    return { success: false, message: '周次ID不能为空' }
  }

  const weekDoc = await db.collection('weeks').doc(weekId).get()
  if (!weekDoc.data || weekDoc.data._openid !== openid) {
    return { success: false, message: '无权限删除此周次' }
  }

  await db.collection('weeks').doc(weekId).remove()
  return { success: true }
}

// 获取周次列表
async function getWeekList(openid) {
  const result = await db.collection('weeks')
    .where({ _openid: openid })
    .orderBy('weekNumber', 'asc')
    .get()

  return { success: true, data: result.data }
}

// 设置当前周
async function setCurrentWeek(event, openid) {
  const { weekId } = event
  
  if (!weekId) {
    return { success: false, message: '周次ID不能为空' }
  }

  const weekDoc = await db.collection('weeks').doc(weekId).get()
  if (!weekDoc.data || weekDoc.data._openid !== openid) {
    return { success: false, message: '无权限设置此周次' }
  }

  await db.collection('weeks').where({ _openid: openid }).update({
    data: { isCurrent: false }
  })

  await db.collection('weeks').doc(weekId).update({
    data: { isCurrent: true }
  })

  return { success: true }
}

// 获取当前周
async function getCurrentWeek(openid) {
  const result = await db.collection('weeks')
    .where({
      _openid: openid,
      isCurrent: true
    })
    .get()

  if (result.data.length === 0) {
    return { success: true, data: null }
  }

  return { success: true, data: result.data[0] }
}
