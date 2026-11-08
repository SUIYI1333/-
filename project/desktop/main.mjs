import { app, BrowserWindow, dialog, Menu, session, shell } from 'electron'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { startDesktopRuntime } from './runtime.mjs'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dev = !app.isPackaged && process.argv.includes('--dev')
const profile = dev ? path.join(projectDir, '.tools/dev/user-data')
  : path.resolve(process.env.MUSIC_DESKTOP_DATA_DIR || path.join(app.getPath('appData'), 'MusicBox'))
await fs.mkdir(profile, { recursive: true })
app.setName('Music Box')
app.setPath('userData', profile)
app.setPath('sessionData', path.join(profile, 'browser'))
app.setPath('crashDumps', path.join(profile, 'crashes'))
app.setAppUserModelId('local.musicbox.desktop')

let runtime
let window
let quitting = false
const hasLock = app.requestSingleInstanceLock()
if (!hasLock) app.quit()
else {
  app.on('second-instance', () => {
    if (window?.isMinimized()) window.restore()
    window?.show()
    window?.focus()
  })
  app.on('window-all-closed', () => app.quit())
  app.on('before-quit', event => {
    if (!runtime || quitting) return
    event.preventDefault()
    quitting = true
    void runtime.close().finally(() => app.quit())
  })
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.quit())
  // Electron emits ready after the ESM entry finishes evaluating.
  void app.whenReady().then(async () => {
    try {
      let defaultRoots = []
      if (dev) {
        const { prepareDevFixtures } = await import('./dev-fixtures.mjs')
        defaultRoots = [await prepareDevFixtures(path.join(projectDir, '.tools/dev/fixtures'))]
      }
      let port = 0
      const portFile = path.join(profile, 'desktop-port.json')
      try {
        const saved = JSON.parse(await fs.readFile(portFile, 'utf8'))
        if (Number.isInteger(saved.port) && saved.port >= 1024 && saved.port <= 65535) port = saved.port
      } catch (error) { if (error.code !== 'ENOENT') throw error }
      runtime = await startDesktopRuntime({ projectDir, dataDir: path.join(profile, 'music-data'), dev, defaultRoots, port })
      await fs.writeFile(portFile, JSON.stringify({ port: runtime.server.address().port }))
      Menu.setApplicationMenu(null)
      session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
      window = new BrowserWindow({
        title: dev ? 'Music Box · 开发测试' : 'Music Box',
        width: 1280,
        height: 840,
        minWidth: 360,
        minHeight: 600,
        show: false,
        backgroundColor: '#121919',
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false },
      })
      window.webContents.setAudioMuted(dev || process.env.MUSIC_DESKTOP_MUTE === '1')
      window.webContents.setWindowOpenHandler(({ url }) => {
        if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
        return { action: 'deny' }
      })
      window.webContents.on('will-navigate', (event, url) => {
        if (new URL(url).origin !== new URL(runtime.url).origin) event.preventDefault()
      })
      window.once('ready-to-show', () => window.show())
      window.on('closed', () => { window = undefined })
      if (dev) window.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'F12') {
          event.preventDefault()
          window.webContents.toggleDevTools()
        }
      })
      console.log(`Music Box ${dev ? 'development' : 'desktop'}: ${runtime.url}`)
      console.log(`Application data: ${profile}`)
      await fs.writeFile(path.join(profile, 'desktop-session.json'), JSON.stringify({ pid: process.pid, url: runtime.url, dev }, null, 2))
      await window.loadURL(runtime.url)
    } catch (error) {
      console.error(error)
      dialog.showErrorBox('Music Box 启动失败', error.code === 'EADDRINUSE' ? '本程序保存的本机端口被其他程序占用，请关闭占用程序后重试。' : error.message)
      app.quit()
    }
  })
}
