# 用 CodeArts Agent 做前端开发：预览网页并用自然语言修改样式

> 语言：**中文** ｜ [English](frontend-dev.md)
>
> 视频版（1 分 10 秒，1152×720，约 7 MB，点击为下载）：
> [frontend-demo.mp4](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.7.0/frontend-demo.mp4)

## 这个 Demo 要展示什么

演示 CodeArts Agent 的前端开发工作流：在 IDE 内预览网页、框选页面元素，再用自然语言描述改动，由 Agent 定位并修改代码。本文以修改页面标题颜色为例。

## 1. 打开前端工程

用 CodeArts Agent 打开一个前端开发工程。如果之前完成过 Agent Team 的 Demo，就已经有一个电商平台前端工程，本文直接使用它：

![在 CodeArts Agent 中打开的电商平台前端工程](image.png)

## 2. 预览网页

右键 `index.html`，点击 **Preview in Browser**，在 IDE 内打开页面预览：

![右键菜单中的 Preview in Browser](image-1.png)

![网页预览效果](image-2.png)

## 3. 切换预览设备

在预览窗口顶部的工具栏可以切换设备，查看页面在不同屏幕尺寸下的效果：

![预览工具栏中的设备选择](image-3.png)

## 4. 框选元素并用自然语言修改

点击工具栏中的 **Select Element**，在预览页面上框选想要修改的元素：

![用 Select Element 框选页面标题](image-4.png)

选中元素后会弹出输入框，输入提示词描述改动，例如把标题字体改成红色：

```text
change color to red
```

![在选中元素的输入框中输入提示词](image-5.png)

回车提交，右侧边栏会显示 Agent 的执行过程。Agent 会定位到元素对应的代码（本例中是 `#heroTitle`）并完成修改：

![Agent 在右侧边栏中完成修改](image-6.png)

## 5. 重新预览验证

重复第 2 步（右键 `index.html` > **Preview in Browser**）重新打开页面，检查修改效果：

![标题颜色已改为红色](image-7.png)

标题颜色已成功改为红色。按照同样的流程——预览页面、框选元素、用自然语言描述改动——就可以完成日常的前端开发。
