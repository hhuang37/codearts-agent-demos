# CodeArts 代码索引对照实验（Kafka 3.9.0 手动实操）

> 语言：**中文** ｜ [English](README.en.md)

## 1. 下载合适的project，本次案例下载开源的apache kafka开源项目

- 选择kafka 3.9.0版本，下载链接： https://github.com/apache/kafka/releases/tag/3.9.0

  ![kafka 3.9.0 发布页与下载链接](images/image.png)

- 本地解压：

  ![本地解压后的 kafka-3.9.0 目录](images/image-1.png)

## 2. 打开codearts agent，选择kafka路径为project，检查本地索引开关是否是关闭的

![CodeArts Agent 打开 kafka-3.9.0 工作区，Local Index 开关关闭，Cloud Index 显示 No index](images/image-2.png)

## 3. 打开右侧边栏，登录账号，选择合适模型，输入prompt：

```
Where is the authentication module of this project? Analyze it.
```

等待完成，检查结果

![索引关闭时提问，模型启动 explore SubAgent 读取项目文件](images/image-3.png)

可以看到上图，会启动一个subagent去读取project的文件

测试完成记录时间 10 min 46 s：

![索引关闭时的回答，界面显示 Completed 10min 46s](images/image-4.png)

## 4. 打开索引开关，等待索引创建

![CodeArts Agent 中 Cloud Index 创建进度 100%](images/image-5.png)

![CodeArts 控制台 Repository Index 中 kafka-3.9.0 正在解析](images/image-6.png)

## 5. 等待索引创建完成之后再次提问，输入prompt，观察结果：

```
Where is the authentication module of this project? Analyze it.
```

注意：有时正常提问不一定触发索引查询，这个时候需要稍微调整一下prompt：

```
Where is the authentication module of this project? Analyze it. Use CodeSemanticSearch first.
```

正常情况下，可以看到思考过程开始就会启动CodeSemanticSearch，而不是启动explore SubAgent去读取项目文件，如下图

![思考过程一开始就调用 CodeBase: CodeSemanticSearch（Thinking 22s），而不是启动 explore SubAgent 去读取项目文件](images/image-7.png)

等待完成，检查结果

![索引开启后的回答，界面显示 Completed 1min 41s，回答引用了 CodeSemanticSearch](images/image-8.png)

## 对照结果

| 索引开关 | 实际触发的路径 | 耗时 |
| --- | --- | --- |
| 关闭 | 启动 explore SubAgent 逐个读项目文件 | 10 min 46 s |
| 开启 | 思考一开始就调用 CodeSemanticSearch 语义检索 | 1 min 41 s |

同一个问题，索引开启后耗时约为关闭时的 1/6.4（646 s → 101 s）。
