# 主工程

此目录只保留运行、开发、构建和检查必需的文件。常用双击入口与完整目录约定见 [工作区说明](../README.md)。

- `src/`：界面源码，包含实际使用的封面生成器。
- `desktop/`：Electron 入口、开发运行管理和打包配置。
- `scripts/`：本机服务、构建及检查。
- `public/`：实际运行资源与第三方许可。
- `content/`：原版档案数据与运行时导出的专辑介绍规范。
- `native/`：现有跨平台本机服务所引用的 macOS 音频桥源码。
- `node_modules/`、`dist/`、`.tools/`：可生成的依赖、前端构建和本机开发状态，均不提交。

在此目录执行 `npm run dev` 或 `npm run dist:win`；Windows 安装包统一输出到工作区 `release/`。历史说明、验收截图、建模源文件和旧工具保存在工作区 `archive/`。

保留 LICENSE、NOTICE.md、README.original.md 及运行资源自带的第三方许可。`npm run check:workspace` 检查主工程 Markdown、资源清单及工作区边界。
