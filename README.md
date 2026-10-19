# OS Challenge — 操作系统知识闯关学习系统

基于汤小丹《操作系统原理》第 1 章的 3D 交互式学习网站。学生通过星图关卡地图、3D 概念动画和答题闯关自主学习，老师通过仪表盘查看班级掌握情况。

## 项目结构

```
opsys/
├── data/                    # 题库源文件 (28题)
├── docs/                    # 设计文档
├── opsys/
│   ├── frontend/            # Next.js 16 + React 19 + Three.js
│   ├── backend/             # Hono + SQLite
│   ├── scripts/             # 辅助脚本
│   └── Dockerfile.*         # 容器构建
└── docker-compose.yml       # 一键部署
```

## 三种运行模式

### 模式一：静态演示（无需后端）

适合 GitHub Pages 或个人快速预览，所有数据存 localStorage。

```bash
# 1. 进入源码目录
cd opsys/opsys

# 2. 安装依赖（仅首次）
pnpm install

# 3. 构建静态文件
cd frontend
cp .env.static .env.local
pnpm build
# 产物在 out/ 目录，用任意静态服务器托管即可

# 4. 本地预览（任选一种）
python -m http.server 8080 -d out
# 或 pnpm exec serve out
```

> 静态模式下答案哈希存储，学生登录信息仅存本地，刷新不丢失。

### 模式二：本机开发（前后端分离）

完整功能，适合本地开发和调试。

```bash
cd opsys/opsys
pnpm install

# 同时启动前后端
pnpm dev
# 后端 → http://localhost:3000
# 前端 → http://localhost:3001
```

或分别启动：

```bash
pnpm dev:backend   # 后端 http://localhost:3000
pnpm dev:frontend  # 前端 http://localhost:3001
```

**环境变量（可选）：**

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `JWT_SECRET` | `dev-secret-change-me` | JWT 签名密钥 |
| `TEACHER_PASSWORD_HASH` | `admin123` 的 SHA-256 | 老师登录密码 |
| `DB_PATH` | `opsys.db` | SQLite 数据库路径 |
| `FRONTEND_URL` | `http://localhost:3001` | CORS 允许的前端地址 |

### 模式三：Docker 部署

```bash
cd opsys
docker compose up -d
# 前端 → http://localhost:3000
# 后端 → http://localhost:4000
```

## 使用指南

### 学生端

1. 打开网站，点击 **「学生入口」**
2. 输入 **12 位学号** + **姓名**，点击登录
3. 进入星图关卡地图：
   - 已完成关卡显示 **绿色光晕 + ✓**
   - 当前关卡显示 **金色脉冲**
   - 未解锁关卡为灰色
4. 点击关卡进入答题页面，观看 3D 概念动画后逐题作答
5. 通过星图右下角的 **伪终端** 也可输入命令导航：

| 命令 | 作用 |
|------|------|
| `ls` | 列出 6 关目录 |
| `cd level<N>` | 跳转第 N 关 |
| `whoami` | 查看当前进度 |
| `clear` | 清屏 |
| `help` | 显示帮助 |

### 教师端

1. 点击 **「教师入口」**，输入密码登录（默认 `admin123`）
2. 仪表盘包含：
   - **概览卡片**：总学生数、平均完成关卡、全班正确率、最薄弱关卡
   - **关卡汇总**：6 关分别的正确率
   - **学生排行榜**：按正确率排名，点击可查看答题详情
   - **题目统计**：每道题的正确率，薄弱题红色高亮

### 看板娘 & 音乐

- 左下角**看板娘**常驻，支持拖拽
- 右上角**齿轮图标**打开音乐设置面板：
  - 5 首 BGM 可切换
  - 音量滑块
  - 静音开关

## 技术栈

| 层 | 选型 |
|----|------|
| 前端框架 | Next.js 16 + React 19 |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 动画 | Framer Motion |
| 样式 | Tailwind CSS 4 |
| 后端框架 | Hono |
| 数据库 | better-sqlite3 |
| 认证 | JWT |
| 包管理 | pnpm |
| 部署 | Docker + GitHub Actions |

## 安全设计

- 答案不传前端（服务器模式后端判分，仅返回正确/错误）
- 静态模式答案 SHA-256 + 盐值哈希，不可逆
- 学号格式后端二次校验（12 位数字）
- SQL 参数化查询防注入
- 输入 HTML 转义防 XSS
- 教师密码 5 次失败锁定 1 分钟
- 同一题重复提交返回 409（防重答刷分）

## 脚本

```bash
# 从 quiz-bank.json 生成静态模式哈希题库
cd opsys/opsys
pnpm exec tsx scripts/hash-answers.ts
# 输出 → frontend/public/data/questions.json
```