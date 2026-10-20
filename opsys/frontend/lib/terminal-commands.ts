export interface TerminalResult {
  outputLines: string[]
  action?: 'navigate' | 'login' | 'logout' | 'close' | 'clear'
  actionPayload?: string
}

export interface CommandContext {
  mode: string | null
  isLoggedIn: boolean
  userName?: string
  studentId?: string
  progress?: number[]
  unlockedLevels?: number[]
}

const LEVEL_NAMES: Record<number, string> = {
  1: '第一章·引论',
  2: '发展历程',
  3: '基本特性',
  4: '运行环境',
  5: '体系结构',
  6: '系统调用',
}

const HELP_TEXT = [
  'Available commands:',
  '  help          — show this help',
  '  ls            — list available levels',
  '  cd level<N>   — enter a level (1-6)',
  '  clear         — clear terminal screen',
  '  whoami        — show current user info',
  '  login <id> <name>  — login as student',
  '  logout        — logout current user',
  '  progress      — show quiz progress',
  '  exit          — close terminal overlay',
]

export function executeCommand(input: string, context: CommandContext): TerminalResult {
  const trimmed = input.trim()
  if (!trimmed) return { outputLines: [] }

  const lower = trimmed.toLowerCase()

  if (lower === 'help') {
    return { outputLines: HELP_TEXT }
  }

  if (lower === 'ls') {
    const lines = ['Available levels:']
    for (let i = 1; i <= 6; i++) {
      const completed = context.progress?.includes(i)
      const unlocked = context.unlockedLevels?.includes(i) || i === 1
      let status = ''
      if (completed) status = ' [COMPLETED]'
      else if (!unlocked) status = ' [LOCKED]'
      lines.push(`  level${i}  —  ${LEVEL_NAMES[i]}${status}`)
    }
    return { outputLines: lines }
  }

  if (lower === 'clear') {
    return { outputLines: [], action: 'clear' }
  }

  if (lower === 'whoami') {
    if (context.isLoggedIn && context.userName && context.studentId) {
      return { outputLines: [`uid=${context.studentId} name=${context.userName}`] }
    }
    return { outputLines: ['os-challenge@kernel (not logged in)'] }
  }

  if (lower === 'progress') {
    if (!context.isLoggedIn) {
      return { outputLines: ['progress: not logged in — use login <id> <name> first'] }
    }
    const completed = context.progress?.length || 0
    return { outputLines: [`Quiz progress: ${completed}/6 levels completed`] }
  }

  if (lower === 'exit') {
    return { outputLines: ['Closing terminal...'], action: 'close' }
  }

  if (/^cd level[1-6]$/.test(lower)) {
    const level = parseInt(lower.replace('cd level', ''))
    const unlocked = context.unlockedLevels?.includes(level) || level === 1
    if (!unlocked) {
      return { outputLines: [`cd: level${level}: permission denied — 关卡未解锁`] }
    }
    return {
      outputLines: [`Entering ${LEVEL_NAMES[level]}...`],
      action: 'navigate',
      actionPayload: `/student/level/${level}`,
    }
  }

  if (lower === 'login' || lower.startsWith('login ')) {
    if (lower === 'login') {
      return { outputLines: ['Usage: login <studentId> <name>'] }
    }
    const parts = trimmed.split(/\s+/)
    if (parts.length < 3) {
      return { outputLines: ['Usage: login <studentId> <name>'] }
    }
    const id = parts[1]
    const name = parts.slice(2).join(' ')
    if (!/^\d{12}$/.test(id)) {
      return { outputLines: ['login: studentId must be 12 digits'] }
    }
    if (name.length > 50) {
      return { outputLines: ['login: name too long (max 50 chars)'] }
    }
    return {
      outputLines: [`Authenticating ${id} ${name}...`],
      action: 'login',
      actionPayload: JSON.stringify({ studentId: id, name }),
    }
  }

  if (lower === 'logout') {
    if (!context.isLoggedIn) {
      return { outputLines: ['logout: not logged in'] }
    }
    return {
      outputLines: ['logged out.'],
      action: 'logout',
    }
  }

  if (/^logout\s+--force$/i.test(trimmed)) {
    return {
      outputLines: ['logged out (forced).'],
      action: 'logout',
    }
  }

  return { outputLines: [`bash: ${trimmed.split(' ')[0]}: command not found`] }
}