import path from 'node:path'
import { createMusicServer } from '../scripts/music-server.mjs'

// Vite and the API share one origin, including the existing Host/Origin checks.
export async function startDesktopRuntime({ projectDir, dataDir, dev = false, defaultRoots = [], port = 0 }) {
  let vite
  const { server, store } = await createMusicServer({
    dataDir,
    distDir: path.join(projectDir, 'dist'),
    defaultRoots,
    autoScan: !dev,
    frontend: dev ? (request, response) => vite.middlewares(request, response, () => {
      response.writeHead(404)
      response.end('Not found')
    }) : undefined,
  })
  let closing
  const close = () => closing ??= (async () => {
    // Close upgraded HMR sockets before awaiting the HTTP listener shutdown.
    await vite?.close()
    await new Promise(resolve => {
      server.close(resolve)
      server.closeAllConnections()
    })
  })()
  try {
    if (dev) {
      const { createServer } = await import('vite')
      vite = await createServer({
        root: projectDir,
        configFile: false,
        server: { middlewareMode: true, hmr: { server }, watch: { ignored: ['**/.tools/**', '**/release/**'] } },
        appType: 'spa',
      })
      // A moved workspace must not reuse the former fixture folder from config.
      await store.updateConfig({ roots: defaultRoots })
      await store.scan()
    }
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, '127.0.0.1', () => {
        server.off('error', reject)
        resolve()
      })
    })
    return { server, store, url: `http://127.0.0.1:${server.address().port}/`, close }
  } catch (error) {
    await close()
    throw error
  }
}
