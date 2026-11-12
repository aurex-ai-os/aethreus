import { execFile, execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { get } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const DEFAULT_OMNIROUTE_PORT = 20128

export interface OmniRouteCommandTarget {
  command: string
  args: string[]
}

/** Check if OmniRoute server is responding on the specified port. */
export function isOmniRouteResponding(
  port = DEFAULT_OMNIROUTE_PORT,
  timeoutMs = 1200,
): Promise<boolean> {
  return new Promise((resolve) => {
    const req = get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(true)
      res.resume()
    })
    req.on('error', () => resolve(false))
    req.setTimeout(timeoutMs, () => {
      req.destroy()
      resolve(false)
    })
  })
}

function findNodeExecutable(): string {
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
      join(process.env.LOCALAPPDATA || '', 'Programs', 'node', 'node.exe'),
    ]
    for (const c of candidates) {
      if (existsSync(c)) return c
    }
    return 'node.exe'
  }
  return 'node'
}

/** Locate the omniroute CLI executable on the system. */
export function resolveOmniRouteCommand(): OmniRouteCommandTarget | null {
  const nodeExe = findNodeExecutable()
  const appData = process.env.APPDATA || ''
  const npmGlobalMjs = join(appData, 'npm', 'node_modules', 'omniroute', 'bin', 'omniroute.mjs')

  // 1. Direct path to global npm omniroute.mjs
  if (existsSync(npmGlobalMjs)) {
    return { command: nodeExe, args: [npmGlobalMjs] }
  }

  // 2. Global npm .cmd on Windows
  const npmGlobalCmd = join(appData, 'npm', 'omniroute.cmd')
  if (existsSync(npmGlobalCmd)) {
    return { command: npmGlobalCmd, args: [] }
  }

  // 3. User home .npm-global (macOS / Linux)
  const homeNpmMjs = join(homedir(), '.npm-global', 'lib', 'node_modules', 'omniroute', 'bin', 'omniroute.mjs')
  if (existsSync(homeNpmMjs)) {
    return { command: nodeExe, args: [homeNpmMjs] }
  }

  // 4. Fallback to command on PATH
  return { command: 'omniroute', args: [] }
}

/** Ensure omniroute is installed, attempting npm install -g if missing. */
export async function ensureOmniRouteInstalled(): Promise<boolean> {
  const appData = process.env.APPDATA || ''
  const npmGlobalMjs = join(appData, 'npm', 'node_modules', 'omniroute', 'bin', 'omniroute.mjs')
  if (existsSync(npmGlobalMjs)) {
    return true
  }

  return new Promise((resolve) => {
    execFile(
      process.platform === 'win32' ? 'cmd.exe' : 'sh',
      process.platform === 'win32' ? ['/c', 'npm install -g omniroute --loglevel=error'] : ['-c', 'npm install -g omniroute --loglevel=error'],
      { timeout: 60_000 },
      (error) => {
        if (error) {
          console.warn('[omniroute] auto-install failed:', error.message)
          resolve(false)
        } else {
          console.log('[omniroute] auto-installed successfully')
          resolve(true)
        }
      },
    )
  })
}

/**
 * Start the OmniRoute server in the background if not already active.
 * Waits until the server responds on localhost or times out.
 */
export async function startOmniRouteServer(
  port = DEFAULT_OMNIROUTE_PORT,
  maxWaitMs = 15_000,
): Promise<boolean> {
  if (await isOmniRouteResponding(port)) {
    console.log(`[omniroute] already running on port ${port}`)
    return true
  }

  let target = resolveOmniRouteCommand()
  const works = await testOmniRouteCommand(target)
  if (!works) {
    console.log('[omniroute] not detected on system, checking installation...')
    const installed = await ensureOmniRouteInstalled()
    if (!installed) {
      console.warn('[omniroute] installation not available, skipping startup')
      return false
    }
    target = resolveOmniRouteCommand()
  }

  console.log(`[omniroute] starting server on port ${port}...`)
  try {
    const launchArgs = [...(target?.args || []), 'serve', '--daemon', '--port', String(port), '--no-open', '--no-tray']
    const child = spawn(target?.command || 'omniroute', launchArgs, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      shell: false,
    })
    child.unref()
  } catch (err) {
    console.warn('[omniroute] failed to spawn server:', err)
  }

  // Poll until ready
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 400))
    if (await isOmniRouteResponding(port)) {
      console.log(`[omniroute] server is ready on port ${port}`)
      return true
    }
  }

  console.warn(`[omniroute] server did not respond within ${maxWaitMs}ms`)
  return false
}

/** Stop the OmniRoute server cleanly. */
export async function stopOmniRouteServer(port = DEFAULT_OMNIROUTE_PORT): Promise<void> {
  console.log(`[omniroute] stopping server on port ${port}...`)
  const target = resolveOmniRouteCommand()
  if (target) {
    try {
      execFileSync(
        target.command,
        [...(target.args || []), 'stop', '--port', String(port)],
        { timeout: 5000, stdio: 'ignore', windowsHide: true, shell: false },
      )
      console.log('[omniroute] stop command completed')
      return
    } catch {
      // Fallback to port-based process termination on Windows
      if (process.platform === 'win32') {
        try {
          execFileSync('powershell.exe', [
            '-NoProfile',
            '-Command',
            `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`,
          ], { timeout: 5000, stdio: 'ignore', windowsHide: true })
        } catch {}
      }
    }
  }
}

function testOmniRouteCommand(target: OmniRouteCommandTarget | null): Promise<boolean> {
  if (!target) return Promise.resolve(false)
  return new Promise((resolve) => {
    execFile(
      target.command,
      [...(target.args || []), '--version'],
      { timeout: 3000, windowsHide: true, shell: false },
      (error) => {
        resolve(!error)
      },
    )
  })
}
