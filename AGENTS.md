# AGENTS.md

## 环境

- Python 3.11，uv 管理依赖
- config.py 集中配置所有常量，pyproject.toml 管理依赖
- **命令**：用 `cmd-exec-mcp`

## 关键文件

## 关键常量

## 规则

- **monkeypatch 必须用 `import config` + `config.X`**：`from config import X` 创建本地副本，monkeypatch 无法穿透；executor 同理 patch `executors.模块名.X`
- **executor 签名变更需全链同步**：方法签名变，main.py 工具、测试、同接口其他 executor 都改
- **config 重命名全量 grep**：常量改名/移除后搜索所有引用
- **跨 Task 依赖等待**：并行派发时先检查上游产物是否存在

## 查文献指南

## 工具

- MCP详见 `mcp_tools_summary.csv`
- 部分工具有相应的skill
- `Read` 无法访问 `D:\Temp`，MCP 长输出需 `Copy-Item` 到项目根目录，正则替换 `\\n` 为 `\n`
- **Edit `replace_all` 错误**：`replace_all=True` 无法使用。优先用 PowerShell `Select-String` + 正则做精确替换，或手动逐处 Edit
- 浏览器操控用 `chrome-devtools-edge`（Edge CDP），**禁止用 `cua-driver` 操控浏览器**
- **WebFetch 无法使用**：用 `wet-mcp extract`

## 工作流

0. 读AGENTS.md
1. 构想：调用 brainstorming → 产出 `docs/superpowers/specs/<date>-design.md`
2. 计划：调用 writing-plans → 产出 `docs/superpowers/plans/<date>-plan.md`
3. 发派：调用 dispatching-parallel-agents 产出给n号机（目前只有1，2号机）的提示词 `docs/superpowers/subprompts/<date>-plan-subprompt-n.md` ，用于手动发派（当前环境是win且不支持子代理，无法自动 dispatch），创建`docs/superpowers/subprompts/<date>-plan-process.md` 用于记录进度，防止冲突
4. 实施：调用 executing-plans
   - 先隔离，使用git创建新的dev分支（1号机）或者进入已有分支（2号机）  
   - 遇到 bug 自动触发 systematic-debugging（先找根因再修）
   - 写代码自动触发 test-driven-development（先写测试再实现）
5. 验证：调用 verification-before-completion → 跑验证命令确认完成
6. 记录：调用 writing-agents → 写CHANGELOG.md + 经验教训到AGENTS.md
7. 提交：调用 finishing-a-development-branch → 分组提交

## OS Challenge 项目 — 经验/坑点

- **Hono 后端需要 @hono/node-server 适配器**：`pnpm add @hono/node-server`，启动用 `serve({ fetch: app.fetch, port })`
- **better-sqlite3 / esbuild 构建脚本批准**：需 `pnpm approve-builds better-sqlite3 esbuild`
- **JSX 只能在 .tsx 文件**：hooks 组件文件必须用 `.tsx` 扩展名
- **端口冲突处理**：`netstat -ano | findstr :3000` → `taskkill /PID xxx /F`
- **匹配题 answer_json 与 content.pairs**：match 题 answer 就是 left→right 映射，前端可直接从 pairs 推算用于视觉反馈
- **Tool use**: `cmd-exec-mcp` 的正确工具是 `execute_local`（非 `cmd-executor`）

## 经验/坑点

- **R3F v9 `<bufferAttribute>` 需 `args`**：R3F v9 的 `bufferAttribute` 强制要求 `args` prop。避免用声明式，改用 `useMemo` 内 `new THREE.BufferGeometry()` + `setAttribute()`，然后直接传 `geometry={geo}` 或 `<primitive object={}>`。
- **R3F `<line>` 与 SVG `<line>` 冲突**：JSX 中 `<line>` 被 TypeScript 解析为 SVG 元素，不接受 `geometry` prop。必须预先创建 `THREE.Line` 对象，用 `<primitive object={lineObj} />` 渲染。
- **Next.js Client Component `useParams()` 需 `<Suspense>`**：在 `'use client'` 组件中直接使用 `useParams()` 会阻塞 `next build` 的静态预渲染。拆分为内层组件 + 外层 `<Suspense>` 包裹。
- **three.js 内置类型**：three@0.137 起自带 `.d.ts`，无需单独安装 `@types/three`。
- **全局 AudioProvider vs 页面 useAudio**：音频控制需全局可达（SettingsPanel 在 RootLayout 层），用 Context Provider 而非页面级 hook。AudioProvider 集中管理 BGM/SFX 开关 + 音量状态。
- **Provider 嵌套优化**：多个 Context Provider 应抽取为 RootProvider 集中包装，避免 layout.tsx 出现深层嵌套。
- **Teacher Dashboard 组件拆分**：页组件保持薄编排器角色，Tab内容拆为独立组件（OverviewCards/LevelSummary/StudentList/QuestionStats），每个处理自己的 Framer Motion 动画。