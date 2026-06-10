# 每周课程表小程序

一款简洁的微信小程序课程表应用，帮助你轻松管理每周课程安排。

## 功能特性

- 周视图课程表展示
- 添加/编辑/删除课程
- 按周切换查看不同周课程
- 支持单双周区分
- 课程颜色自定义
- 数据云端同步

## 技术栈

- 微信小程序框架
- 云开发（云函数 + 数据库）
- WXML/WXSS/JavaScript

## 项目结构

```
├── cloudfunctions/      # 云函数
│   ├── courseOperations/  # 课程操作
│   └── weekOperations/    # 周次操作
├── miniprogram/        # 小程序前端
│   ├── pages/          # 页面
│   │   ├── index/        # 首页（课程表）
│   │   ├── course-edit/  # 课程编辑
│   │   ├── course-detail/# 课程详情
│   │   ├── week-select/  # 周次选择
│   │   └── settings/     # 设置
│   ├── app.js           # 小程序入口
│   └── app.json         # 全局配置
└── project.config.json   # 项目配置
```

## 使用说明

1. 在微信开发者工具中打开项目
2. 配置云开发环境（参考 DATABASE_SETUP.md）
3. 部署云函数
4. 创建数据库集合并配置权限
5. 编译运行

## 云环境配置

云环境 ID：`cloud1-d2gt3p6bub1490d87`

详见 [DATABASE_SETUP.md](DATABASE_SETUP.md)
