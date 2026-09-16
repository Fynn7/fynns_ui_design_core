@AGENTS.md

## Claude Code 专属

<!--
上面那一行是全部的诀窍：Claude Code 只读 CLAUDE.md，不读 AGENTS.md。
@path 语法在会话启动时展开导入，支持相对/绝对路径，Windows 可用（符号链接需要管理员权限，所以别用 symlink）。
首次遇到外部 import 会弹一次批准对话框，同意一次即可。

⚠️ @import 递归最多 4 跳。AGENTS.md 里指向深文档一律用普通 markdown 链接，不要用 @，
   否则整棵文档树会被拉进常驻上下文，正好抵消了分层的意义。

下面写只对 Claude Code 生效的补充，例如：
-->

- 改 `src/<敏感目录>/` 下的文件时先进 plan mode。
- 本仓不启用 auto-memory 写入；项目知识一律改 `AGENTS.md`。
