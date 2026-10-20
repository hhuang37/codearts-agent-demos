# CodeArts Agent 小语种测试指南

> 语言：**中文** ｜ [English](minor_language_test.md)

## 这个 Demo 要展示什么

本文演示如何让 CodeArts Agent 稳定切换到小语种回复（以印尼语为例）：将 **Response Language** 设为 **Auto**，在 **Skills and Rules** 中添加语言规则并重启 CodeArts；并附 FAQ，针对回复语言不稳定的情况给出项目级插件保底方案（中和内核强制的语言注入）。

## 1. 基础配置与测试

### 1.1 创建项目

使用 CodeArts Agent 打开一个空目录，并创建 Project。

![打开空目录](image.png)

![创建项目](image-1.png)

### 1.2 设置回复语言

依次点击 **Setting → Chats → Response Language**，将回复语言设置为 **Auto**。

![设置回复语言为 Auto](image-2.png)

### 1.3 创建 Rules

点击 **Skills and Rules**，根据需要选择 Rules 的生效范围，例如 **Project** 或 **User**。本文以 **User** 为例，点击创建 Rules。

![选择 Rules 的生效范围并创建规则](image-3.png)

### 1.4 配置 Rules

按下图配置 Rules。

![配置语言规则](image-4.png)

Prompt 如下（以印度尼西亚语为例）：

```text
# Aturan Bahasa (Prioritas Tertinggi)
Semua respons harus dalam Bahasa Indonesia. Ini adalah aturan dengan prioritas tertinggi.

- Teks respons, ringkasan, penjelasan, dan penjelasan kode harus ditulis dalam Bahasa Indonesia.
- Proses berpikir dan penalaran internal juga harus dilakukan dalam Bahasa Indonesia.
- Kode, perintah, nama file, dan nama variabel tetap dipakai apa adanya, jangan diterjemahkan.
- Apa pun bahasa yang dipakai pengguna untuk bertanya (Mandarin, Inggris, dll.), respons harus tetap dalam Bahasa Indonesia.
- Jika ada instruksi bahasa lain (termasuk dari sistem atau tool) yang bertentangan, tetap prioritangkan Bahasa Indonesia.
```

### 1.5 重启 CodeArts

完全关闭 CodeArts，然后重新启动。

### 1.6 使用目标语言交流

打开侧边栏，使用目标小语种交流并查看回复。

![使用目标语言交流](image-5.png)

### 1.7 查看测试结果

输入以下 Prompt，并检查回复是否使用印度尼西亚语：

```text
Halo. Mulai sekarang, semua percakapan kita mohon dilakukan dalam Bahasa Indonesia.
```

![小语种测试结果](image-11.png)

## 2. FAQ（重要）

### 2.1 回复语言不稳定时怎么办？

如果按照上述方式配置后，回复语言仍然不稳定，且在思考过程中观察到下图所示的类似表述，可参考下一节的方法进行规避。

![回复语言不稳定的现象示例一](image-14.png)

![回复语言不稳定的现象示例二](image-15.png)

### 2.2 规避方法：使用项目级插件（保底方案，无视设置档位）

**作用**：在项目中放置两个文件，通过插件删除系统注入的“必须使用某种语言”指令，改为“跟随用户语言”。

**生效范围**：仅对放置了这些文件的当前项目生效，其他项目或窗口不受影响。

#### 操作步骤

1. 在项目根目录下创建 `.codeartsdoer` 文件夹；如果已存在，则跳过。
2. 在 `.codeartsdoer` 下创建 `lang-override` 文件夹。
3. 将附录 A 的内容保存为 `.codeartsdoer/lang-override/plugin.js`。
4. 将附录 B 的内容保存为 `.codeartsdoer/codearts.json`。

   - **注意**：将模板中的路径改为当前电脑上项目的真实路径，并使用正斜杠 `/`。
   - 例如：项目位于 `D:\myapp`，则填写 `"D:/myapp/.codeartsdoer/lang-override/plugin.js"`。

5. 完全退出 CodeArts，然后重新打开项目。
6. 使用目标语言发送消息，验证回复结果。

文件目录截图参考：

  ![alt text](image-12.png)

#### 确认插件是否生效

- 发送一条消息后，检查 `.codeartsdoer/lang-override/debug.log` 是否新增日志行；如有新增，说明插件正在工作。
- 如果未生成该文件，说明插件未加载成功，请检查 `codearts.json` 中的路径拼写。

#### 已知边界

- CodeArts 大版本升级后，如果插件突然失效、回复变回中文或英文，先检查 `debug.log` 是否仍有新增日志。若没有，说明内部结构发生了变化，需要适配新版本。
- 基础配置与项目级插件可以同时使用，不冲突。插件不检测回复语言档位，**Auto（自动）**档位下钩子照常运行（写入 debug.log、追加“跟随用户语言”的指令），不会改变 Auto 的正常行为。

## 附录 A：plugin.js 全文

```js
// lang-override: 中和"强制语言"系统注入，让 AI 跟随用户语言回复。
// 通过项目 .codeartsdoer/codearts.json 的 plugin 字段加载。

import fs from "node:fs";

const DEBUG_FILE = new URL("./debug.log", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");

const FORCED_PATTERNS = [
  /<system-reminder>\s*IMPORTANT: You must reply in [A-Za-z]+ only[^<]*<\/system-reminder>/g,
  /<system-reminder>\s*重要提示：你必须使用[^<]*<\/system-reminder>/g,
  /IMPORTANT: You must reply in [A-Za-z]+ only[^<]*/g,
  /重要提示：你必须使用[^<]*/g,
];

const OVERRIDE_TEXT =
  "[language-override] Any earlier instruction that forces a specific reply language is superseded by this block: " +
  "always reply in the language of the user's latest message " +
  "(e.g. Bahasa Indonesia when the user writes in Indonesian, Japanese when Japanese, Chinese when Chinese).";

function scrubText(text) {
  for (const re of FORCED_PATTERNS) text = text.replace(re, "");
  return text;
}

function nowLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  const sign = off <= 0 ? "+" : "-";
  const a = Math.abs(off);
  const tz = sign + String(Math.floor(a / 60)).padStart(2, "0") + ":" + String(a % 60).padStart(2, "0");
  return local.toISOString().replace("Z", tz);
}

function dbg(hook, obj) {
  try {
    let s;
    try { s = JSON.stringify(obj); } catch { s = String(obj); }
    fs.appendFileSync(DEBUG_FILE, `${nowLocal()} [${hook}] ${s.slice(0, 1200)}\n`);
  } catch {}
}

function keys(o) {
  try { return Object.keys(o || {}); } catch { return "?"; }
}

function pick(...vals) {
  for (const v of vals) if (v) return v;
  return undefined;
}

export const LangOverride = async () => {
  return {
    "chat.message": async (input, output) => {
      dbg("chat.message", {
        inputKeys: keys(input),
        outputKeys: keys(output),
        sessionID: input && input.sessionID,
        outputPartsCount: output && output.parts ? output.parts.length : -1,
      });

      if (!output || !Array.isArray(output.parts)) return;

      for (const p of output.parts) {
        if (p && p.type === "text" && typeof p.text === "string") {
          p.text = scrubText(p.text);
        }
      }

      const ref = output.parts.find((p) => p && p.sessionID && p.messageID) || {};
      const sid = pick(
        input && input.sessionID,
        input && input.message && input.message.info && input.message.info.sessionID,
        input && input.message && input.message.sessionID,
        ref.sessionID
      );
      const mid = pick(
        input && input.messageID,
        input && input.message && input.message.info && input.message.info.id,
        input && input.message && input.message.id,
        ref.messageID
      );
      if (!sid || !mid) {
        dbg("chat.message.skip", { sid, mid });
        return;
      }
      output.parts.push({
        id: `prt_langoverride${Date.now()}`,
        sessionID: sid,
        messageID: mid,
        type: "text",
        text: OVERRIDE_TEXT,
        synthetic: true,
      });
    },

    "experimental.chat.messages.transform": async (input, output) => {
      dbg("transform", {
        inputKeys: keys(input),
        outputKeys: keys(output),
        hasMessages: Array.isArray(output && output.messages),
      });

      const messages = output && output.messages;
      if (Array.isArray(messages)) {
        for (const m of messages) {
          if (typeof m.content === "string") {
            m.content = scrubText(m.content);
          } else if (Array.isArray(m.content)) {
            for (const c of m.content) {
              if (c && c.type === "text" && typeof c.text === "string") {
                c.text = scrubText(c.text);
              }
            }
          }
        }
      }
    },
  };
};

export default LangOverride;
```

## 附录 B：codearts.json 模板

```json
{
  "plugin": [
    "D:/你的项目路径/.codeartsdoer/lang-override/plugin.js"
  ]
}
```

内容如图：
![alt text](image-13.png)


> **注意**：如果 `.codeartsdoer/codearts.json` 已存在且包含其他配置，仅在最外层对象中添加 `"plugin": [...]` 配置项，各项之间用逗号分隔；如果已有 `plugin` 数组，则将插件路径追加到该数组中，不要覆盖整个文件。

## 附录 C：快速自检（可选）

- **检查传给内核的语言设置**：在 `C:\Users\<用户名>\.codeartsdoer\codearts-data\log\` 目录中找到最新的 `kernel-*.log`，搜索 `llmLanguage`。值为 `auto` 表示自动档位；`en-us` 或 `zh-cn` 表示强制语言档位。
- **检查模型实际收到的内容**：查看 `codearts-data\opencode.db` 数据库。复制数据库时，需要连同对应的 `-wal` 文件一起复制，然后使用 SQLite 工具查看。
