# 目录整理记录 · 2026-11-08

用户要求根目录实际整洁，主工程不包含非必要 Markdown 或非运行图片素材。此次将工程集中至 `project/`，历史资料集中至 `archive/upstream/`，安装包统一至工作区 `release/`，根目录仅保留两个常用入口与必要项目说明、许可和 Git 配置。

`archive/upstream/` 保留原有目录层次与历史文件名，包含上游完整 README、设计／开发说明、历史验收记录和截图、建模源文件及旧工具。历史文档中的旧路径描述原布局；当前操作以工作区 README 为准。本目录不作为运行依赖，不进入 Windows 安装包。

封面生成器实际由界面导入，移入 `project/src/cover-generator.mjs`；专辑介绍规范实际以文本导入供任务导出，移入 `project/content/album-introductions-agent.md`。两者均保留来源并更新引用。主工程中的上游署名、版权与第三方许可继续保留。

浏览器版的默认数据仍指向工作区外原来的 `music-data-v3`，不迁移或读取私人曲库。开发状态仅调整目录前缀；正式已安装程序的数据路径不变。

## 实际验证结果

- `npm --prefix project run build`、完整 `check:v061`、`check:desktop` 与目录检查通过。两个根目录启动脚本已测试从其他工作目录启动，并覆盖中文、空格和 Shell 特殊字符路径。
- `project/` 仅保留 5 个必要 Markdown：README.md、NOTICE.md、README.original.md、运行时专辑介绍规范，以及 OpenCC 第三方许可。66 个非运行资料文件归档在 `archive/`，主工程源码清单为 280 个文件。新增检查拒绝非必要 Markdown、未列入清单的图片和建模文件重返主工程。
- 实际 Electron 开发窗口验证晨雾／月影、搜索不自动播放、静音合成 WAV 播放、原创同步歌词、竖屏、CSS 热更新、关闭退出和重新打开后的偏好保留。修正迁移后开发配置引用旧样本路径的问题，启动时只使用当前工程生成的独立样本。
- 使用完整构建入口重新生成工作区 `release/MusicBox-0.6.1-Windows-x64-Setup.exe`。实际运行包内 exe，验证正式空库、隔离渲染、关闭停止服务与重启后的偏好保存。两轮最终窗口验收脚本异常和外部请求均为零。
- 检查实际 `app.asar`：1192 个条目，不包含归档资料、历史截图、建模工程、开发数据或主工程源码；保留生产资源、实际运行代码及许可。对应 SHA-256 已更新到 `release/SHA256SUMS.txt`。
- Git 跟踪全部迁移，原历史可追溯；356 个版本文件中未混入 `.tools/`、`node_modules/`、`dist/`、`release/` 或私人曲库。所有必要许可与上游源文件保留。

窗口验收仍使用 SwiftShader、合成静音 WAV 和隔离配置，不读取私人曲库；未执行系统安装／升级／卸载、真实设备试听、硬件性能认证或在线歌词供应商查询。安装包保持未签名和默认 Electron 图标，没有外部 Release 发布。

本次日志与窗口结果保存在 `project/.tools/logs/` 和 `project/.tools/desktop-verification/`，不进入 Git。
