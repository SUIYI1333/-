# Rhine Music · 开发与发布约定

## 本地 Windows 工作区补充

- 根目录整洁是必须遵守的长期约定，详见 README.md。根目录仅保留两个常用启动／构建入口、README.md、AGENTS.md、LICENSE、NOTICE.md 与隐藏 Git 配置；仅允许 project/、archive/、release/ 三个可见目录。不创建源码版本副本充当备份。
- 主工程位于 project/，下文原版源码相对路径以它为基准；历史 DESIGN.md 与 docs/ 位于 archive/upstream/。非必要 Markdown、历史图片、建模源文件及研究材料不得放进主工程。project/public/ 只保留运行使用资源与许可，运行导出的专辑介绍规范位于 project/content/album-introductions-agent.md。原版来源和必要建模源文件归档保留，不删除。
- 临时材料归入 project/.tools/，构建归入 project/dist/，依赖归入 project/node_modules/，Windows 安装包归入工作区 release/。运行 npm 命令须以 project/ 为工作目录，或在工作区根目录使用 npm --prefix project。
- 当前用户授权整理本地工作区、保存本地 Git 提交、建立 Electron 开发测试入口及 Windows exe 本地打包入口。GitHub 仓库连接需使用用户提供的地址；不向 upstream 推送，不自动发布 Release。
- 此 Windows 桌面工作是用户自己的本地衍生开发，以下原作者 macOS 发布授权不延伸为本衍生版本的外部发布授权。保留原作者的来源、许可和历史。
- 桌面开发数据与正式数据隔离，自动验收使用静音合成样本；每次完成改动运行 npm run check:workspace、相关检查和规定构建。桌面改动另运行 npm run check:desktop。

## 当前版本

- V0.6.1 基于本地 V0.6.0b 整理，V0.6.0b 的起点为本地 V0.5.0；旧版本目录保留，不回写。已搁置和冻结实验不自动继承。
- 维护者于 2026-10-24 明确授权本次 V0.6.1 主线提交、v0.6.1 标签、GitHub Release 与 macOS 源码附件发布。后续版本需单独授权。
- 本版移除个人布局实验、光效／动效调试器和运行时调试入口，保留确认后的默认布局、灯光和正常用户设置。不要将本地试调参数恢复到产品中。
- 当前设计以 DESIGN.md 与生产源码为准；歌词接口和权利边界见 docs/LYRICS.md，发布检查见 docs/REVIEW-V0.6.1.md。

## 数据与分发

- 音乐服务只监听 127.0.0.1，保留目录边界及 Origin / Host 校验；音乐文件与标签只读。
- 浏览器版默认数据目录保留在工作区旁 music-data-v3，可用 MUSIC_DATA_DIR 覆盖；正式桌面数据为系统应用数据目录，开发测试为 project/.tools/dev/。开发验证使用隔离合成样本；未经用户明确授权不读取私人曲库，也不自动向外部平台检索其内容。
- 运行时歌词优先本地同步 LRC／内嵌歌词，缺失时按当前曲目自动在线查询，只发送必要元数据，不上传音频或批量抓取。保留来源链接及开源服务与歌词内容版权的区别。
- 专辑介绍采用 docs/album-introductions/agent.md 规范；用户导出任务后自行提供给 AI。结果通过本机接口预览、核对与备份后导入，不直接改数据库，不覆盖未获允许替换的内容。
- 不提交歌曲、私人封面、索引、配置、令牌、本机路径、缓存、日志、AI 任务／结果导出、私人宣传片或研究素材。
- 发行包是 macOS 源码包，排除 node_modules、dist、.tools 与本地验证产物。实际清单由 scripts/distribution-files.json 管理，打包前后核对内容、中文文件名和启动器执行权限。
- 保留 LICENSE、NOTICE.md、README.original.md、第三方许可和必要建模源文件。MIT 代码许可不覆盖所有图像、字体、标志、声音及歌词；原版 ?original=1 的共享资源必须保留。

## 产品和验证

- 保留晨雾／月影、横竖屏／超宽屏、减少动态效果、统一动效时钟、三档歌曲衔接、浏览器／CoreAudio 输出和每列浏览记忆。搜索定位不自动播放。
- 歌词字体与字号独立于主界面和专辑资料；歌词模式隐藏右上控件，左上入口／Esc 返回资料。横屏资料布局采用已确认值，竖屏沿用既有布局。
- Node.js 最低 22.12.0；使用 npm ci 安装锁定依赖，运行 npm run build、npm run check:v061 及涉及改动的检查。
- 视觉改动须在真实浏览器检查相关页面、主题、横竖屏和展开状态；构建通过不替代界面验收。实测范围与未覆盖项准确记录。
- 真实音频设备自动验证使用零音量；没有真实格式样本时明确跳过，不将模拟测试写成真实设备认证。
- 保留上游作者、历史贡献和 Git 历史。主线维护 macOS，其他平台见 docs/COMMUNITY-VERSIONS.md；不接收 PR，反馈方式见 CONTRIBUTING.md。
