# 本地 Windows 开发与版本管理

## 三个工作阶段

1. 双击根目录 `启动开发测试.cmd`（或 `npm run dev`），在 Electron 测试窗口验证修改。前端 TypeScript / CSS 由 Vite 热更新；本机服务和 Electron 主进程修改后重新启动。F12 打开开发工具。
2. 完成一个可说明的修改后，运行构建和对应检查，检查 Git 差异，再保存本地提交。临时截图、日志与样本放 `.tools/`，不要复制源码到“新版本”文件夹。
3. 需要安装包时双击 `构建正式安装包.cmd`（或 `npm run dist:win`）。脚本重新构建、执行 `check:v061`、`check:desktop` 和目录检查，再生成 `release/MusicBox-0.6.1-Windows-x64-Setup.exe`。版本号随 `package.json` 更新，不需要手改输出名。

首次准备需要 Node.js ≥ 22.12.0 与联网下载依赖。通过 `npm ci` 安装锁定版本；构建脚本不拉取远程源码，不执行 Git 提交，不上传产物，不执行在线更新。安装后的程序包含 Electron / Chromium / Node 运行时，使用者无需安装开发环境。

## 目录和数据

根目录仅存放必要的项目配置、项目级文档及启动入口。界面放 `src/`，桌面逻辑和打包配置放 `desktop/`，已有服务和自动化放 `scripts/`，开发文档放 `docs/`。保持上游资源和脚本路径，避免为目录美观引入无关改动。

| 路径 | 内容 | Git / 安装包 |
| --- | --- | --- |
| `.tools/dev/fixtures/` | 三张虚构专辑、六首静音 WAV、原创本地歌词 | 均排除 |
| `.tools/dev/user-data/` | 开发窗口偏好、缓存、曲库索引 | 均排除 |
| `.tools/logs/`、`.tools/archive/` | 当前日志与历史验收产物 | 均排除 |
| `.tools/cache/`、`.tools/ffmpeg/` | 本机工具下载缓存与可选解码器 | 均排除 |
| `dist/` | 可重建的前端页面、模型、字体和音效 | 不提交；经清单进入安装包 |
| `release/` | 安装 exe、便携测试目录及打包日志 | 不提交；手动选择产物分享 |
| `%APPDATA%\MusicBox\` | 正式窗口偏好、`music-data/` 索引与缓存 | 工程外；不打包、不提交 |

开发测试默认静音，仅自动生成合成样本，不读取原浏览器版数据目录，不自动寻找个人音乐目录。正式桌面模式首次为空库，用户自行添加文件夹；关闭窗口后退出整个桌面应用和本机服务。浏览器入口仍保留此前的后台服务行为，属于独立入口。

需要隔离验证正式包时，可以由验证环境设置 `MUSIC_DESKTOP_DATA_DIR` 指向专用空目录，并设置 `MUSIC_DESKTOP_MUTE=1`。正常使用无需设置这些变量。不同配置目录的实例互不共享偏好和曲库。桌面 HTTP 服务首次选择空闲端口并保存在配置目录，之后复用，以保留同源浏览器偏好；仅绑定 `127.0.0.1`。若保存端口被占用则明确报错，不结束其他程序。Vite 与 API 共用源，保留 Origin / Host 与目录边界校验。

正式安装包不附带本机 `.tools/ffmpeg/`。FFmpeg / ffprobe 是可选外部依赖，仍可通过 PATH 或 `FFMPEG_PATH` / `FFPROBE_PATH` 指定；缺失时显示实际能力并尝试 Chromium 原生格式。本阶段的“正式”指生产构建与安装流程，不代表所有编码、设备已经认证。安装包不签名，不提供在线自动更新；是否公开分发及资产授权应在发布阶段单独核对。

## GitHub 创建页面如何填写

- 所有者：自己的 GitHub 账号。
- 仓库名：英文、数字与 `-` 等合法字符，例如 `music-box`；中文产品名保留在描述和 README。
- 可见性：未准备公开时建议私有；需要公开分享时再调整。
- 添加 README：关闭。
- 添加 .gitignore：不添加，保留现有规则。
- 添加许可证：不添加新文件，保留已有 LICENSE、NOTICE、第三方许可及上游署名。

本地原始 Git 仓库最初是浅克隆，本次已补齐上游历史和已有标签，不重新初始化或强制覆盖历史。自己的新仓库应为空，原作者远程保留为 `upstream`，自己的远程使用 `origin`。

在用户确认自己的仓库地址后执行（将示例替换为实际地址）：

```powershell
git remote add origin https://github.com/YOUR_ACCOUNT/music-box.git
git push -u origin HEAD
```

当前工作分支为 `codex/windows-desktop`。首次推送可以直接将此分支设为 GitHub 默认分支；需要调整成 `main` 时先确认分支策略。不要对已有内容的远程仓库执行强制推送。

“保存改动”有两个层次：Git commit 保存到本机历史；Git push 备份到自己的 GitHub。只提交到本机无法防止硬盘丢失。每次修改先查看 `git status --short` 和 `git diff`，按功能提交明确文件；检查通过后再推送到自己的 `origin`。分支用来隔离较大的功能开发，不为每一次小改动创建新仓库。

## 验证

```powershell
npm ci
npm run build
npm run check:v061
npm run check:desktop
```

`check:desktop` 使用临时目录和静音合成 WAV 验证真实 HTTP 读写、隔离数据、开发前端与 API 同源、Host / Origin 拒绝及服务退出。`check:workspace` 检查根目录许可清单，以及 Git 中是否混入运行数据、截图、缓存或构建目录。真实界面验收结果另记在 `docs/REVIEW-WINDOWS-DESKTOP.md`，不会以构建通过代替实际运行验证。
