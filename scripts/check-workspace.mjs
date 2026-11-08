import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const directories = new Set(['.git', '.github', '.tools', 'art', 'content', 'desktop', 'dist', 'docs', 'native', 'node_modules', 'public', 'reference', 'scripts', 'src', 'tools', 'release'])
const files = new Set(['.gitattributes', '.gitignore', 'AGENTS.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'DESIGN.md', 'LICENSE', 'NOTICE.md', 'README.md', 'README.original.md', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', '启动音乐播放器.cmd', '启动音乐播放器.command', '启动开发测试.cmd', '构建正式安装包.cmd'])
for (const entry of await fs.readdir(root, { withFileTypes: true })) {
  assert.ok(!entry.isSymbolicLink() && (entry.isDirectory() ? directories : files).has(entry.name), `根目录存在未归位的文件或目录：${entry.name}`)
}
const tracked = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean)
const forbidden = /^(?:node_modules|dist|release|out|coverage|\.tools|music-data[^/]*)(?:\/|$)|(?:^|\/)(?:player-service\.log|launcher\.lock|desktop-session\.json|library-index\.json|config\.json|albums-task[^/]*\.json|introductions-result[^/]*\.json)$|\.(?:exe|dll|log|tsbuildinfo)$/i
for (const file of tracked) assert.ok(!forbidden.test(file), `Git 文件边界错误：${file}`)
const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8')
assert.ok(readme.includes('工程目录必须保持干净整洁'), 'README 缺少工程整洁约定')
console.log(`Workspace passed: tidy root, ${tracked.length} source entries, generated and personal data excluded.`)
