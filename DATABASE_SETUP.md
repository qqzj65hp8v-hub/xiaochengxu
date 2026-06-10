# 每周课程表小程序 - 数据库与云函数配置指南

## 一、云环境配置

云环境 ID 已配置为：`cloud1-d2gt3p6bub1490d87`

配置位置：`miniprogram/app.js` 第 8 行

---

## 二、数据库集合配置

### 步骤 1：打开云开发控制台

1. 在微信开发者工具中，点击顶部工具栏的「云开发」按钮
2. 进入云开发控制台后，点击左侧「数据库」

### 步骤 2：创建集合

需要创建以下两个集合：

#### 集合 1：`courses`（课程记录）

1. 点击「添加集合」按钮
2. 输入集合名称：`courses`
3. 点击确定

**字段说明：**

| 字段名 | 类型 | 说明 |
|-------|------|------|
| _openid | string | 用户标识，自动注入 |
| courseName | string | 课程名称 |
| teacher | string | 任课教师 |
| location | string | 上课地点 |
| dayOfWeek | number | 星期几（1-7） |
| startSlot | number | 开始节次 |
| endSlot | number | 结束节次 |
| weekType | string | 周类型：all/odd/even |
| weekNumbers | array | 具体周次数组 |
| color | string | 课程颜色 |
| remark | string | 备注 |
| createTime | date | 创建时间 |
| updateTime | date | 更新时间 |

#### 集合 2：`weeks`（周次配置）

1. 点击「添加集合」按钮
2. 输入集合名称：`weeks`
3. 点击确定

**字段说明：**

| 字段名 | 类型 | 说明 |
|-------|------|------|
| _openid | string | 用户标识，自动注入 |
| weekName | string | 周次名称 |
| weekNumber | number | 周次序号 |
| startDate | date | 开始日期 |
| isCurrent | boolean | 是否当前周 |
| createTime | date | 创建时间 |

### 步骤 3：配置集合权限

对两个集合执行以下操作：

1. 点击集合名称进入详情
2. 点击「权限设置」标签
3. 选择「自定义安全规则」
4. 输入以下规则：

```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

5. 点击保存

> 此规则确保用户只能读写自己的数据，实现数据隔离。

### 步骤 4：创建索引（可选但推荐）

#### courses 集合索引：

| 索引名称 | 索引字段 | 排序 |
|---------|---------|------|
| openid_day_idx | _openid (升序), dayOfWeek (升序) | - |
| openid_update_idx | _openid (升序), updateTime (降序) | - |

#### weeks 集合索引：

| 索引名称 | 索引字段 | 排序 |
|---------|---------|------|
| openid_weeknum_idx | _openid (升序), weekNumber (升序) | - |
| openid_current_idx | _openid (升序), isCurrent (降序) | - |

---

## 三、云函数部署

### 步骤 1：部署云函数

在微信开发者工具中：

1. 展开 `cloudfunctions` 目录
2. 右键点击 `courseOperations` 文件夹
3. 选择「创建并部署：云端安装依赖」
4. 等待部署完成

5. 右键点击 `weekOperations` 文件夹
6. 选择「创建并部署：云端安装依赖」
7. 等待部署完成

### 步骤 2：验证部署

1. 在云开发控制台，点击左侧「云函数」
2. 应该能看到 `courseOperations` 和 `weekOperations` 两个云函数
3. 状态显示为「已部署」

---

## 四、测试运行

### 步骤 1：编译预览

1. 点击微信开发者工具顶部的「编译」按钮
2. 在模拟器中预览小程序

### 步骤 2：测试功能

1. **测试添加周次**：点击底部「周次」标签 → 点击「+ 添加周次」
2. **测试添加课程**：点击首页右上角「+ 添加」→ 填写课程信息 → 点击「添加课程」
3. **测试查看课程**：点击课程卡片查看详情
4. **测试编辑课程**：在课程详情页点击「编辑课程」
5. **测试删除课程**：在课程详情页点击「删除课程」

---

**配置完成后，即可开始使用课程表小程序！**
