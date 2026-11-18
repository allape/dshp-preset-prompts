# Prompt 预设 / Prompt Presets

For fast-input when typing prompt in DSH Web.

## Creatation Prompts

Censored for secrets.

```txt
创建一个带左侧栏入口的 DSH 插件：主要功能是 prompt 预设
1、prompt 预设将包含名称（input.text，最长 64 个字符）、prompt 内容（textarea，rows=10）
2、侧边栏点击后将展示 prompt 预设管理列表，将包含新增、修改、删除、排序的功能
3、安装该插件后，将在 dsh 的 prompt 输入框的上方展示 prompt 预设列表，样式为圆润边角的按钮、像tag一样；点击其后将在最后的光标处插入预设的 prompt 内容，并在聚焦输入框后、将光标定位到插入预设内容的最后处
4、适配 dsh 页面样式、适配 dsh 的 light/dark theme 设置
5、i18n，中文和英文即可；需适配 dsh 的语言设置

如果执行需要进行网络下载的命令时，使用以下网络代理环境变量
export http_proxy="http://***:***"
export https_proxy="http://***:***"
export no_proxy="localhost,127.0.0.1,::1,192.168.0.0/16,.deepseek.com,.***.cc"
```

## Features

- **Sidebar enrty**：Place to manage prompt presets.
- **Fast Input**：Prompt Presets will display on the top of prompt text field.

## Data Storage

```js
window.localStorage.getItem("dsh.prompt-presets.v1")
```

## Installation

From source

```bash
git clone --depth 1 https://github.com/allape/dshp-preset-prompts
dsh plugin --profile web add "$(pwd)/dshp-preset-prompts"
```

Or install it in DSH Plugins.

## Structure

| File | Desc. |
| --- | --- |
| `index.js` | Bundle entry. |
| `client.js` | UIs. |
| `cordis.patch.yml` | `prompt-presets` registering. |
| `locale/en.json`, `locale/zh.json` | Plugin Manager manifests. |
| `icon.svg` | Icon. |
