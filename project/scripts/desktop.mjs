import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dependenciesReady, npmInvocation } from './launch-music.mjs'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mode = process.argv[2]
const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd: projectDir, stdio: 'inherit', windowsHide: true, shell: false, ...options })
  child.once('error', reject)
  child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${path.basename(command)} exited: ${signal || code}`)))
  const stop = () => child.kill('SIGTERM')
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
  child.once('exit', () => { process.off('SIGINT', stop); process.off('SIGTERM', stop) })
})
const npm = async args => {
  const invocation = await npmInvocation(args)
  await run(invocation.command, invocation.args)
}

try {
  if (!['dev', 'pack', 'preview'].includes(mode)) throw new Error('Usage: node scripts/desktop.mjs dev|pack|preview')
  const [major, minor] = process.versions.node.split('.').map(Number)
  if (major < 22 || major === 22 && minor < 12) throw new Error('Node.js 22.12 or newer is required.')
  if (mode === 'pack' && process.platform !== 'win32') throw new Error('Build the Windows installer on Windows.')
  if (!await dependenciesReady(projectDir)) await npm(['ci'])
  // Electron 45 exposes an explicit installer instead of an npm postinstall.
  if (!await fs.access(path.join(projectDir, 'node_modules/electron/path.txt')).then(() => true, () => false)) {
    const installEnv = { ...process.env }
    delete installEnv.ELECTRON_SKIP_BINARY_DOWNLOAD
    await run(process.execPath, ['node_modules/electron/install.js'], { env: installEnv })
  }
  if (mode === 'pack') {
    await npm(['run', 'build'])
    await npm(['run', 'check:v061'])
    await npm(['run', 'check:desktop'])
    await run(process.execPath, ['node_modules/electron-builder/cli.js', '--config', 'desktop/electron-builder.json', '--win', '--x64', '--publish', 'never'])
    console.log(`Installer output: ${path.resolve(projectDir, '../release')}`)
  } else {
    if (mode === 'dev') await npm(['run', 'export:archives'])
    else if (!await fs.access(path.join(projectDir, 'dist/index.html')).then(() => true, () => false)) await npm(['run', 'build'])
    const { default: electron } = await import('electron')
    const env = { ...process.env }
    delete env.ELECTRON_RUN_AS_NODE
    await run(electron, [projectDir, ...(mode === 'dev' ? ['--dev'] : [])], { env })
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
