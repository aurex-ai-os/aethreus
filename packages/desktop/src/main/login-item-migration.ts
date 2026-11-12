import type { App } from 'electron'
import { win32 } from 'node:path'

// The AppUserModelId (and therefore the Run value name) did not change with
// branding. Replace that one value in place; never enable a new startup item.
export function migrateWindowsLoginItem(
  app: Pick<App, 'isPackaged' | 'getLoginItemSettings' | 'setLoginItemSettings'>,
  appUserModelId: string,
  executablePath = process.execPath,
  platform: NodeJS.Platform = process.platform,
): boolean {
  if (platform !== 'win32' || !app.isPackaged) return false
  const exeLower = win32.basename(executablePath).toLowerCase()
  if (exeLower !== 'ekko studio.exe' && exeLower !== 'aethreus.exe') return false

  const legacyNames = ['Ekko Studio.exe', 'Hermes Studio.exe']
  const args = ['--hidden']
  for (const legacyName of legacyNames) {
    const legacyPath = win32.join(win32.dirname(executablePath), legacyName)
    const settings = app.getLoginItemSettings({ path: legacyPath, args })
    const legacyItem = settings.launchItems?.find(item => (
      item.scope === 'user' && item.name === appUserModelId &&
      win32.normalize(item.path).toLowerCase() === win32.normalize(legacyPath).toLowerCase() &&
      item.args.length === 1 && item.args[0] === '--hidden' &&
      typeof item.enabled === 'boolean'
    ))
    if (!legacyItem) continue

    app.setLoginItemSettings({
      name: appUserModelId,
      path: executablePath,
      args,
      openAtLogin: true,
      enabled: legacyItem.enabled,
    })
    return true
  }
  return false
}
