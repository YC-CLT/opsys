# Changelog

## 2026-10-19 — Plan vs Actual 差距修复

### feat(frontend): RootProvider — 全局 Context 集中化

- `components/RootProvider.tsx` — 集中包装 ModeProvider + AuthProvider + AudioProvider
- `app/layout.tsx` — 简化为单 RootProvider 嵌套，减少 Provider 层级

### feat(frontend): AudioProvider — 全局音频上下文

- `components/AudioProvider.tsx` — Context Provider：BGM/SFX 开关、音量滑块、playBGM/playSFX
- 替代页面级 `hooks/useAudio.ts`，支持 SettingsPanel 任意位置控制

### feat(frontend): SettingsPanel — 音乐设置面板

- `components/SettingsPanel.tsx` — 右上角齿轮入口 + 弹出面板
- Framer Motion 弹簧动画面板：BGM 开关、SFX 开关、音量滑块
- 状态持久化 localStorage（bgm/sfx/volume）

### feat(frontend): useTouchHold — 触摸长按检测

- `hooks/useTouchHold.ts` — 200ms 阈值长按检测，触发 `navigator.vibrate(10)` 触觉反馈
- 返回值：`{ onTouchStart, onTouchEnd, onTouchMove, isHolding }`

### refactor(frontend): Teacher Dashboard 拆分为子组件

- `components/teacher/OverviewCards.tsx` — 4 张统计卡片（学生数/正确率/关卡/题目）
- `components/teacher/LevelSummary.tsx` — 关卡总览列表
- `components/teacher/StudentList.tsx` — 学生列表 + 答题统计
- `components/teacher/QuestionStats.tsx` — 题目掌握统计列表
- `app/teacher/page.tsx` — 重构为薄编排器（240 行 → 139 行）

### chore: 更新 Changelog 层级

- CHANGELOG 移至外仓根目录，与 AGENTS.md 同级
- 展开覆盖全部 23 条历史提交，按阶段分组

---

## 2026-10-19 — 构建修复

### fix(frontend): resolve 5 R3F/Next.js TS build errors

- **StarMap** — `<bufferAttribute>` 在 R3F v9 需 `args` prop。改为 `useMemo` 内命令式创建 `THREE.BufferGeometry` / `THREE.Line`，通过 `<primitive>` 渲染
- **ConceptScene** — JSX `<line>` 与原生 SVG `<line>` 命名冲突，TS 拒绝 `geometry` prop。改为 `THREE.Line` + `<primitive>`
- **QuizPage** — `useParams()` 在 Client Component 中阻塞 Next.js 静态预渲染。拆分为 `QuizPageContent` + `<Suspense>` 边界
- **deps** — `frontend/package.json` 添加 `@types/three`

### fix: add @types/node to root + tsconfig for hash-answers script

- workspace 根 `package.json` 添加 `@types/node: ^20`
- 新增 `opsys/scripts/tsconfig.json` 含 `"types": ["node"]`
- 解决 `hash-answers.ts` 中 `crypto`/`fs`/`path`/`process` 类型报错

### chore: clean up .gitignore + fix docker-compose context path

- 外仓 `.gitignore` — 补 `node_modules`/`.next/`/`*.db` 模式
- 项目 `.gitignore` — 删冗余条目（外仓已覆盖），补 `db-shm`/`db-wal`
- `docker-compose.yml` — 修复 context 路径拼写错误

### docs: add CHANGELOG + update AGENTS.md with R3F/Next.js lessons

- 外仓新增 `CHANGELOG.md`
- `AGENTS.md` 追加 4 条坑点：R3F bufferAttribute、R3F line/SVG 冲突、Next.js useParams Suspense、three.js 自带类型

---

## 2026-10-18~19 — 初始实现 (Task 1-10)

### docs: add OS Challenge agent notes

- 创建 `AGENTS.md`：环境、关键文件、常量、规则、工作流、OS Challenge 项目坑点

### feat: localStorage progress storage + static export config + .env.static

- `frontend/lib/storage.ts` — localStorage 进度/会话/设置封装
- `frontend/next.config.ts` — 条件 `output: "export"` 当 `NEXT_PUBLIC_MODE === "static"`
- `frontend/.env.static` — 静态模式环境配置

### feat: ConceptScene 3D animations + hash-answers script + static quiz engine

- `frontend/components/visual/ConceptScene.tsx` — 6 关 3D 概念动画（分层/进化/并发/中断/结构/雷达图）
- `scripts/hash-answers.ts` — SHA-256 题库哈希生成脚本
- `frontend/lib/quiz-engine.ts` — 静态模式 Web Crypto API 判分引擎
- `frontend/public/data/questions.json` — 28 题静态题库（无明文答案）

### feat: static mode localStorage + Dockerization + CI/CD

- `frontend/lib/storage.ts` — 续：quiz 答案缓存、会话管理
- `Dockerfile.frontend` + `Dockerfile.backend` + `docker-compose.yml`
- `.github/workflows/ci.yml` — 前端构建 + 后端 TypeScript 检查

### feat(frontend): teacher dashboard — overview + students + question stats

- `app/teacher/page.tsx` — 教师仪表盘：概览卡片、学生列表、题目掌握统计

### feat(frontend): quiz page — 3 question types + result card

- `app/quiz/[level]/page.tsx` — 答题页面，三种题型切换
- `components/quiz/ChoiceQuestion.tsx` — 选择题
- `components/quiz/JudgeQuestion.tsx` — 判断题
- `components/quiz/MatchQuestion.tsx` — 匹配题（拖拽+长按）
- `components/quiz/ResultCard.tsx` — 答题反馈卡片

### feat(frontend): student dashboard — R3F star map with 6 levels

- `app/student/page.tsx` — 学生主页：3D 星图关卡选择
- `components/StarMap.tsx` — R3F 六层星图 + 粒子星空 + 连线解锁
- `components/FakeTerminal.tsx` — 伪终端装饰

### feat(frontend): login pages — student + teacher entry

- `app/page.tsx` — 入口页（角色选择）
- `app/login/student/page.tsx` — 学生登录（12 位学号 + 姓名）
- `app/login/teacher/page.tsx` — 教师登录（密码认证）

### feat(frontend): layout + mode detection + audio + kanban musume + fake terminal

- `app/layout.tsx` — 根布局，三种模式 ConditionalLayout
- `hooks/useModeDetect.tsx` — 模式检测（static/local/docker）
- `hooks/useAuth.tsx` — 用户认证状态
- `hooks/useAudio.ts` — 音频管理器（BGM + 音效）
- `components/KanbanMusume.tsx` — 看板娘（右下角常驻）
- `components/FakeTerminal.tsx` — 伪终端
- `lib/api.ts` — 后端 API 集中封装

### feat(backend): auth + quiz + teacher routes

- `src/routes/auth.ts` — POST `/api/auth/student` + `/api/auth/teacher`
- `src/routes/quiz.ts` — GET `/api/quiz/:level` + POST `/api/quiz/submit`
- `src/routes/teacher.ts` — GET `/api/teacher/overview` + `/students` + `/questions`
- `src/security.ts` — JWT 中间件、限流、学号校验、XSS 防护

### feat(backend): SQLite schema + seed from quiz-bank.json

- `src/db.ts` — better-sqlite3 初始化 + 建表（students/submissions/teacher_logins）
- `src/types.ts` — 共享类型定义
- `src/seed.ts` — 从 `data/quiz-bank.json` 导入 28 题

### scaffold: monorepo with frontend (Next.js) + backend (Hono)

- `pnpm-workspace.yaml` — frontend + backend 两 workspace
- 根 `package.json` — workspace scripts
- `backend/` — Hono + better-sqlite3 最小骨架

---

## 2026-10-18 — 准备阶段

### fix: levelId 3→6 关重新映射

- 原 3 关模型改为 6 关，对齐设计稿章节划分
- 补 Q16 进第 1 关

### feat: 初始化 Next.js 前端项目

- Next.js 16 + React 19 + Tailwind 4 + TypeScript 5 + ESLint

### docs: 需求文档与任务说明

- `docs/task.md` — 需求描述
- `docs/2026-10-18-os-chapter1-research.md` — 教学调研
- `docs/2026-10-18-os-chapter1-quiz-bank.md` — 题库设计

### feat: 添加静态媒体资源

- `assets/audio/` — BGM ×5、SUCCESS/FAIL/InitTerminal/click/SettingsUI 音效
- `assets/img/看板娘.png`

### feat: 第 1 章操作系统引论题库

- `data/quiz-bank.json` — 28 题（选择/判断/匹配）
- `data/parse_quiz.py` — JSON 解析脚本

### init

- 仓库初始化