import test from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { startDesktopRuntime } from '../desktop/runtime.mjs'
import { prepareDevFixtures } from '../desktop/dev-fixtures.mjs'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'musicbox-desktop-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  return directory
}

test('packaged runtime serves production assets, rejects foreign origins, and closes its listener', async t => {
  const directory = await fixture(t)
  const runtime = await startDesktopRuntime({ projectDir, dataDir: path.join(directory, 'data') })
  t.after(runtime.close)
  assert.equal((await fetch(runtime.url)).status, 200)
  assert.match(await (await fetch(runtime.url)).text(), /<html/)
  const library = await (await fetch(`${runtime.url}api/library`)).json()
  assert.deepEqual(library.roots, [])
  assert.deepEqual(library.albums, [])
  assert.equal((await fetch(`${runtime.url}api/config`, { headers: { Origin: 'https://example.com' } })).status, 403)
  const foreignHostStatus = await new Promise((resolve, reject) => {
    http.get(`${runtime.url}api/config`, { headers: { Host: 'example.com' } }, response => { response.resume(); resolve(response.statusCode) }).once('error', reject)
  })
  assert.equal(foreignHostStatus, 403)
  await runtime.close()
  assert.equal(runtime.server.listening, false)
  await assert.rejects(fetch(runtime.url))
})

test('development Vite and real music API share one origin with only silent fixture data', async t => {
  const directory = await fixture(t)
  const music = await prepareDevFixtures(path.join(directory, 'fixtures'))
  const runtime = await startDesktopRuntime({ projectDir, dataDir: path.join(directory, 'data'), dev: true, defaultRoots: [music] })
  t.after(runtime.close)
  await runtime.store.scan()
  const html = await (await fetch(runtime.url)).text()
  assert.match(html, /\/@vite\/client/)
  assert.match(await (await fetch(`${runtime.url}src/main.ts`)).text(), /music-app/)
  const library = await (await fetch(`${runtime.url}api/library`)).json()
  assert.equal(library.albums.length, 3)
  assert.equal(library.albums.flatMap(album => album.tracks).length, 6)
  assert.deepEqual(library.roots.map(root => root.path), [music])
  const track = library.albums[0].tracks[0]
  const response = await fetch(`${runtime.url}api/audio/${track.id}`, { headers: { Range: 'bytes=0-43' } })
  assert.equal(response.status, 206)
  assert.equal((await response.arrayBuffer()).byteLength, 44)
  const origin = new URL(runtime.url).origin
  const write = await fetch(`${runtime.url}api/config`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ onlineEnabled: false }) })
  assert.equal(write.status, 200)
  assert.equal((await fetch(`${runtime.url}api/config`, { headers: { Origin: 'http://127.0.0.1:1' } })).status, 403)
  assert.equal((await fetch(`${runtime.url}api/not-a-route`)).status, 404)
  const wav = await fs.readFile(path.join(music, 'Test Album 1', '01 Test Track 1.wav'))
  const start = wav.indexOf(Buffer.from('data')) + 8
  assert.ok(wav.subarray(start).every(byte => byte === 0), 'Synthetic PCM must remain silent')
  const original = Buffer.from(wav)
  await prepareDevFixtures(music)
  assert.deepEqual(await fs.readFile(path.join(music, 'Test Album 1', '01 Test Track 1.wav')), original)
  const client = await (await fetch(`${runtime.url}@vite/client`)).text()
  const token = /const wsToken = "([^"]+)"/.exec(client)?.[1]
  assert.ok(token, 'Vite HMR token must be available to the actual client')
  const socket = new WebSocket(`${runtime.url.replace('http:', 'ws:')}?token=${token}`, 'vite-hmr')
  t.after(() => socket.close())
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  let timer
  try {
    await Promise.race([runtime.close(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('HMR socket kept the desktop service alive')), 3000) })])
  } finally { clearTimeout(timer) }
  assert.equal(runtime.server.listening, false)
})

test('desktop preserves a chosen origin and refuses to take over an occupied port', async t => {
  const directory = await fixture(t)
  const dataDir = path.join(directory, 'data')
  const first = await startDesktopRuntime({ projectDir, dataDir })
  t.after(first.close)
  const port = first.server.address().port
  const url = first.url
  await first.close()
  const second = await startDesktopRuntime({ projectDir, dataDir, port })
  t.after(second.close)
  assert.equal(second.url, url)
  await assert.rejects(startDesktopRuntime({ projectDir, dataDir: path.join(directory, 'other'), port }), { code: 'EADDRINUSE' })
  assert.equal((await fetch(`${url}api/health`)).status, 200)
})

test('both Windows launchers work from an unrelated cwd with Chinese, spaces and shell metacharacters', { skip: process.platform !== 'win32' }, async t => {
  const directory = await fixture(t)
  const project = path.join(directory, '中文 & 空格 $() 工程')
  await fs.mkdir(path.join(project, 'scripts'), { recursive: true })
  await fs.writeFile(path.join(project, 'scripts/desktop.mjs'), 'console.log(JSON.stringify({cwd:process.cwd(),mode:process.argv[2]}))')
  for (const [launcher, mode] of [['启动开发测试.cmd', 'dev'], ['构建正式安装包.cmd', 'pack']]) {
    const file = path.join(project, launcher)
    await fs.copyFile(path.join(projectDir, launcher), file)
    const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `""${file}""`], { cwd: os.tmpdir(), encoding: 'utf8', windowsHide: true, windowsVerbatimArguments: true, timeout: 5000 })
    assert.equal(result.status, 0, result.stderr || result.stdout)
    const recorded = JSON.parse(result.stdout.split(/\r?\n/).find(line => line.startsWith('{')))
    assert.equal(recorded.cwd, project)
    assert.equal(recorded.mode, mode)
  }
})
