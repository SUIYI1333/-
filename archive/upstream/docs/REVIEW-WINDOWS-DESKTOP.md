# Windows 桌面构建验证

日期：2026-11-08。此记录针对本地 Windows 衍生工作区，不改变上游 macOS V0.6.1 发布记录。

原 Windows 浏览器适配基线在本次修改前通过 `npm run build` 与完整 `npm run check:v061`，已保存为独立本地 Git 提交。

## 通过项

- Node.js 24.16.0、Electron 45.2.3、electron-builder 26.18.0。依赖版本和锁文件固定，Electron Windows x64 二进制通过随 npm 包提供的官方 SHA-256 校验。
- `npm run build`、完整 `npm run check:v061`、`npm run check:desktop` 和 `npm run check:workspace`。Windows 安装脚本在这些检查全部通过后完成构建，产物为 `release/MusicBox-0.6.1-Windows-x64-Setup.exe`。
- 新桌面 HTTP 运行测试：生产页面、空库、合成样本索引与字节范围、配置写入、开发前端与 API 同源、陌生 Host / Origin 拒绝、服务退出。
- 实际 Electron 测试窗口：三张虚构专辑、六首静音 WAV、原创同步歌词；晨雾／月影、搜索定位不播放、静音播放、歌词和竖屏显示。向实际 CSS 追加临时验证规则后观察到热更新，随后恢复原文件，无生产调试钩子。
- 实际关闭开发窗口后进程退出、HTTP 健康接口无法连接；再次启动复用保存的源地址，localStorage 验证值和界面偏好保留。
- 实际启动 `release/win-unpacked/MusicBox.exe`：Electron 报告 `app.isPackaged=true`，加载正式页面，初始为空库，未混入开发样本；关闭退出和重启后的偏好保存通过。此过程未使用系统 Node 启动服务。
- 开发和正式窗口均确认 `nodeIntegration=false`、`contextIsolation=true`、`sandbox=true`，验收音频输出为静音。两轮窗口验收记录的脚本异常和外部请求均为零。
- 检查实际 `app.asar` 文件清单：不包含 `.git`、`.tools`、个人数据、开发样本、测试脚本、源建模工程或 Electron / Vite / electron-builder 开发依赖。保留生产资源、运行依赖及许可；安装目录另有 `licenses/`。
- Git 上游完整历史和标签已取得，本地基线提交独立保存；临时文件归位 `.tools/`，生成文件由 Git 忽略。尚未配置自己的 `origin`，没有推送或外部发布。

## 范围与限制

界面验收使用 SwiftShader 软件渲染、横屏和 390×844 窗口，测试偏好使用真实专辑列、减少动态效果与 50% 渲染比例；这些偏好只保存在开发或专用验收配置中，不改变产品默认值。本次不认证原画质硬件帧率、所有显卡、外部 DAC 或真实歌曲的设备播放。

正式 exe 使用独立验收数据目录和静音输出，没有读取个人曲库；在线歌词供应商的实时命中、第三方资料查询与 macOS CoreAudio 不在本次桌面验收范围。FFmpeg 不随安装包分发，受支持格式仍取决于可用解码器。

生成的是未签名的 Windows x64 NSIS 安装包，当前使用默认 Electron 图标；本轮直接运行并验证了包内程序，未在用户系统执行完整安装／升级／卸载流程。没有在线自动更新、代码签名或 GitHub Release 发布。

`npm audit --omit=dev` 记录的生产依赖漏洞数为零。完整开发依赖审计当时报告六项 moderate，集中于 electron-builder 的跨平台打包依赖；这些开发依赖未进入正式包，不通过强制降级打包器来修改既定版本。

截图与结果 JSON 位于 `.tools/desktop-verification/`，构建及检查日志位于 `.tools/logs/`，均不进入 Git 或安装包。早期失败验收日志仅作本地诊断，以最终通过记录为准。
