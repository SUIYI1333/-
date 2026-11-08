# 音乐盒

基于 [RonaldDeng / Rhine-Music-Demo](https://github.com/RonaldDeng/Rhine-Music-Demo) V0.6.1 的本地 Windows 桌面开发，原版界面来自 [LBEILC / RhineLabUI](https://github.com/LBEILC/RhineLabUI)。[自己的代码仓库](https://github.com/SUIYI1333/-)使用 `main` 分支，保留上游历史与署名。

## 常用入口

| 文件 | 用途 |
| --- | --- |
| **[启动开发测试.cmd](启动开发测试.cmd)** | 打开 Electron 测试窗口，前端修改自动刷新；使用独立静音样本，不自动读取私人曲库。 |
| **[构建正式安装包.cmd](构建正式安装包.cmd)** | 从本地源码重新构建、检查并生成 Windows x64 安装 exe，输出到 `release/`。 |
| `release/MusicBox-0.6.1-Windows-x64-Setup.exe` | 当前本机生成的安装程序；未签名，不提供在线自动更新。 |

开发需要 Node.js ≥ 22.12.0。首次启动和首次打包需联网准备依赖；安装后的程序自带运行时。开发默认静音，修改桌面主进程或本机服务后需要重新启动测试窗口。

## 工程目录必须保持干净整洁

**根目录只保留两个常用入口、项目说明、开发约定与许可；工程文件集中在 `project/`，非运行资料集中在 `archive/`，构建产物集中在 `release/`。每次改动结束必须检查归位，禁止向根目录堆放临时文件或源码版本副本。**

| 目录 | 内容 |
| --- | --- |
| `project/` | 唯一主工程：界面、本机服务、桌面入口、运行资源、配置和检查脚本。 |
| `archive/` | 上游完整说明、历史验收报告与截图、建模源文件、研究参考和旧辅助工具。保留来源与维护资料，不进入主工程或 Windows exe。 |
| `release/` | 本机构建的安装包和包内运行目录，不提交 Git。 |

主工程只保留必要 Markdown：简短开发入口说明、版权／上游署名、运行时导出的专辑介绍规范，以及第三方许可。宣传截图、历史文档、参考图片和建模工程不放进 `project/`；`project/public/` 只存放实际运行使用的图片、字体、模型、音效、原版共享档案及必要许可。

开发数据、截图、日志和工具缓存放 `project/.tools/`，依赖放 `project/node_modules/`，前端构建放 `project/dist/`，均不提交、不作为源文件备份。正式桌面数据放 `%APPDATA%\MusicBox\`。歌曲、私人封面、索引、令牌及个人配置不得进入仓库。

## 开发与版本记录

在工作区根目录可以执行：

```powershell
npm --prefix project ci
npm --prefix project run dev
npm --prefix project run build
npm --prefix project run check:v061
npm --prefix project run check:desktop
npm --prefix project run dist:win
```

日常以功能为单位保存 Git 提交，再推送到自己的 `origin`。原作者远程保留为 `upstream`，不向它推送；不为每次改动新建仓库或复制工程。目录迁移使用 Git 跟踪，历史仍可追溯。

当前 Windows 包使用浏览器音频输出，FFmpeg / ffprobe 为可选外部依赖，未捆绑到安装包。构建通过不等于所有显卡、音频设备或安装升级流程均已认证。历史验证范围见 [桌面验收记录](archive/upstream/docs/REVIEW-WINDOWS-DESKTOP.md)，本次整理记录见 [目录整理记录](archive/WORKSPACE-REVIEW.md)。

代码与资源权利边界见 [LICENSE](LICENSE)、[NOTICE.md](NOTICE.md) 和 [上游说明](archive/upstream/README.md)。MIT 代码许可不覆盖全部字体、图像、标志、音效和歌词；必要的第三方许可保留。
