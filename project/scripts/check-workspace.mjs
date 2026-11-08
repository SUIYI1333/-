import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const workspace = path.resolve(project, '..')
const roots = {
  workspace: { directory: workspace, directories: new Set(['.git', '.github', 'project', 'archive', 'release']), files: new Set(['.gitattributes', '.gitignore', 'README.md', 'AGENTS.md', 'LICENSE', 'NOTICE.md', '启动开发测试.cmd', '构建正式安装包.cmd']) },
  project: { directory: project, directories: new Set(['.tools', 'content', 'desktop', 'dist', 'native', 'node_modules', 'public', 'scripts', 'src']), files: new Set(['.gitattributes', '.gitignore', 'LICENSE', 'NOTICE.md', 'README.md', 'README.original.md', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', '启动音乐播放器.cmd', '启动音乐播放器.command']) },
}
for (const [label, policy] of Object.entries(roots)) {
  for (const entry of await fs.readdir(policy.directory, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink() && (entry.isDirectory() ? policy.directories : policy.files).has(entry.name), `${label} 存在未归位文件：${entry.name}`)
  }
}
const allowedMarkdown = new Set(['README.md', 'README.original.md', 'NOTICE.md', 'content/album-introductions-agent.md', 'public/licenses/opencc-js-third-party.md'])
const manifest = JSON.parse(await fs.readFile(path.join(project, 'scripts/distribution-files.json'), 'utf8'))
const allowedPublic = new Set(manifest.files.filter(file => file.startsWith('public/')))
async function inspect(directory, prefix = '') {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (!prefix && ['.tools', 'dist', 'node_modules'].includes(entry.name)) continue
    assert.ok(!entry.isSymbolicLink(), `主工程不允许链接文件：${relative}`)
    if (entry.isDirectory()) await inspect(path.join(directory, entry.name), relative)
    else {
      if (/\.md$/i.test(relative)) assert.ok(allowedMarkdown.has(relative), `非必要 Markdown 应归档：${relative}`)
      if (relative.startsWith('public/')) assert.ok(allowedPublic.has(relative), `未确认的运行素材：${relative}`)
      if (/\.(?:png|jpg|jpeg|webp|gif|blend)$/i.test(relative)) assert.ok(allowedPublic.has(relative), `非运行图片或建模素材应归档：${relative}`)
    }
  }
}
await inspect(project)
const tracked = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: workspace, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean)
const forbidden = /(?:^|\/)(?:node_modules|dist|release|out|coverage|\.tools|music-data[^/]*)(?:\/|$)|(?:^|\/)(?:player-service\.log|launcher\.lock|desktop-session\.json|library-index\.json|config\.json|albums-task[^/]*\.json|introductions-result[^/]*\.json)$|\.(?:exe|dll|log|tsbuildinfo)$/i
for (const file of tracked) assert.ok(!forbidden.test(file), `Git 文件边界错误：${file}`)
assert.ok((await fs.readFile(path.join(workspace, 'README.md'), 'utf8')).includes('工程目录必须保持干净整洁'), 'README 缺少工程整洁约定')
for (const file of ['LICENSE', 'NOTICE.md']) assert.deepEqual(await fs.readFile(path.join(project, file)), await fs.readFile(path.join(workspace, file)), `工程分发许可与工作区不一致：${file}`)
console.log(`Workspace passed: compact root, essential project Markdown and runtime assets only; ${tracked.length} versioned files, generated/private data excluded.`)
