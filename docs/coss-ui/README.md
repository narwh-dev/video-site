# coss ui（本地文档）

**coss ui** 是一套为 React 应用设计的、美观、可访问、可组合的组件库。基于 [Base UI](https://base-ui.com/) 构建，使用 [Tailwind CSS](https://tailwindcss.com/) 样式化，采用「复制、粘贴、自有」的组件分发模式。

> 本目录为 [coss.com/ui](https://coss.com/ui/) 官方文档的本地化副本（下载于 2026-08-05），用于离线查阅。原文版权归 coss ui 项目所有。

## 概览

- [Introduction](docs/index.md) — 简介
- [Get Started](docs/get-started.md) — 快速上手
- [Roadmap](docs/roadmap.md) — 路线图
- [Radix / shadcn 迁移指南](https://coss.com/ui/docs/radix-shadcn-migration) — 官方页面（本地副本尚未发布，指向在线文档）

## 组件（Components）

| 组件 | 说明 | 组件 | 说明 |
| --- | --- | --- | --- |
| [Accordion](docs/components/accordion.md) | 可折叠面板 | [Menu](docs/components/menu.md) | 按需展开的操作/选项列表 |
| [Alert](docs/components/alert.md) | 重要信息提示框 | [Meter](docs/components/meter.md) | 已知范围内的数值可视化 |
| [Alert Dialog](docs/components/alert-dialog.md) | 打断流程的确认模态框 | [Number Field](docs/components/number-field.md) | 带增减控件的数字输入 |
| [Autocomplete](docs/components/autocomplete.md) | 输入联想建议 | [OTP Field](docs/components/otp-field.md) | 一次性密码分段输入 |
| [Avatar](docs/components/avatar.md) | 用户/实体头像 | [Pagination](docs/components/pagination.md) | 分页导航 |
| [Badge](docs/components/badge.md) | 状态徽标/标签 | [Popover](docs/components/popover.md) | 触发元素旁的浮层 |
| [Breadcrumb](docs/components/breadcrumb.md) | 层级路径导航 | [Preview Card](docs/components/preview-card.md) | 链接内容的富预览卡片 |
| [Button](docs/components/button.md) | 按钮 | [Progress](docs/components/progress.md) | 任务完成度指示 |
| [Calendar](docs/components/calendar.md) | 日期选择器 | [Radio Group](docs/components/radio-group.md) | 互斥单选组 |
| [Card](docs/components/card.md) | 内容容器 | [Scroll Area](docs/components/scroll-area.md) | 自定义滚动条容器 |
| [Checkbox](docs/components/checkbox.md) | 复选开关 | [Select](docs/components/select.md) | 下拉选择 |
| [Checkbox Group](docs/components/checkbox-group.md) | 复选框组 | [Separator](docs/components/separator.md) | 视觉分隔线 |
| [Collapsible](docs/components/collapsible.md) | 内容折叠切换 | [Sheet](docs/components/sheet.md) | 侧边抽屉（基于 dialog） |
| [Combobox](docs/components/combobox.md) | 输入+列表组合选择 | [Sidebar](docs/components/sidebar.md) | 可折叠侧边导航（官方页 404，暂缺） |
| [Command](docs/components/command.md) | 命令面板 | [Skeleton](docs/components/skeleton.md) | 加载占位 |
| [Context Menu](docs/components/context-menu.md) | 右键/长按菜单 | [Slider](docs/components/slider.md) | 连续范围拖动选择 |
| [Date Picker](docs/components/date-picker.md) | 日期选择组件 | [Spinner](docs/components/spinner.md) | 加载指示器 |
| [Dialog](docs/components/dialog.md) | 模态对话框 | [Switch](docs/components/switch.md) | 二态开关 |
| [Drawer](docs/components/drawer.md) | 边缘滑入面板（支持手势/吸附点/嵌套） | [Table](docs/components/table.md) | 结构化数据表格 |
| [Empty](docs/components/empty.md) | 空状态容器 | [Tabs](docs/components/tabs.md) | 视图切换导航 |
| [Field](docs/components/field.md) | 表单字段包装（标签+校验） | [Textarea](docs/components/textarea.md) | 多行文本输入 |
| [Fieldset](docs/components/fieldset.md) | 字段分组 | [Toast](docs/components/toast.md) | 自动消失的临时通知 |
| [Form](docs/components/form.md) | 完整表单实现（校验+提交） | [Toggle](docs/components/toggle.md) | 双状态切换按钮 |
| [Frame](docs/components/frame.md) | 框架内容容器 | [Toggle Group](docs/components/toggle-group.md) | 切换按钮组 |
| [Group](docs/components/group.md) | 内容分组容器 | [Toolbar](docs/components/toolbar.md) | 相关操作分组容器 |
| [Input](docs/components/input.md) | 原生输入框 | [Tooltip](docs/components/tooltip.md) | 悬停/聚焦提示 |
| [Input Group](docs/components/input-group.md) | 带附加元素的输入组 | [Kbd](docs/components/kbd.md) | 键盘按键展示 |
| [Label](docs/components/label.md) | 可访问的控件标签 | | |

## Hooks

- [useMediaQuery](docs/hooks/use-media-query.md) — 响应式媒体查询 hook（支持 Tailwind 风格断点语法）
- [useCopyToClipboard](docs/hooks/use-copy-to-clipboard.md) — 复制到剪贴板，带临时「已复制」状态

## 备注

- 官方 `llms.txt` 清单：见 [llms.txt](llms.txt)。
- 未本地化的外链页面：Radix/shadcn 迁移指南、Styling 指南、Agent Skills、Changelog、Particles、Origin UI（官方站点尚未发布对应 `.md` 文件，本地副本保留为外链）。
