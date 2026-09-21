# CodeArts Code Index Comparison (Kafka 3.9.0, manual walkthrough)

> Language: **English** ｜ [简体中文](README.zh-CN.md)
>
> Video (7 min 13 s, 1920×1200, ~104 MB, click to download):
> [codebases_demo.mp4](https://github.com/hhuang37/codearts-agent-demos/releases/download/v0.1.0/codebases_demo.mp4)

## 1. Download a suitable project — in this case the open-source Apache Kafka repository

- Pick version 3.9.0. Download link: https://github.com/apache/kafka/releases/tag/3.9.0

  ![Kafka 3.9.0 release page and download link](images/image.png)

- Extract it locally:

  ![The extracted kafka-3.9.0 directory](images/image-1.png)

## 2. Open CodeArts Agent, select the Kafka path as the project, and check that the local index toggle is off

![CodeArts Agent with the kafka-3.9.0 workspace open, Local Index off, Cloud Index showing No index](images/image-2.png)

## 3. Open the right-hand sidebar, sign in, pick a model, and enter the prompt:

```
Where is the authentication module of this project? Analyze it.
```

Wait for the run to finish and check the result.

![With the index off, the model spawns an explore SubAgent to read project files](images/image-3.png)

As the screenshot shows, it starts a SubAgent to read the project's files.

Recorded run time: 10 min 46 s:

![Answer with the index off; the UI shows Completed 10min 46s](images/image-4.png)

## 4. Turn the index on and wait for it to be built

![Cloud Index build at 100% in CodeArts Agent](images/image-5.png)

![The kafka-3.9.0 repo being parsed under Repository Index in the CodeArts console](images/image-6.png)

## 5. Once the index is ready, ask again with the same prompt and watch the result

```
Where is the authentication module of this project? Analyze it.
```

Note: a plain question does not always trigger an index lookup. When that happens, adjust the prompt slightly:

```
Where is the authentication module of this project? Analyze it. Use CodeSemanticSearch first.
```

Normally you will see CodeSemanticSearch called at the very start of the thinking process, instead of an explore SubAgent reading project files:

![CodeBase: CodeSemanticSearch called at the start of thinking (Thinking 22s), instead of an explore SubAgent reading project files](images/image-7.png)

Wait for the run to finish and check the result.

![Answer with the index on; the UI shows Completed 1min 41s and the answer cites CodeSemanticSearch](images/image-8.png)

## Results

| Index | Path actually taken | Time |
| --- | --- | --- |
| Off | explore SubAgent reads project files one by one | 10 min 46 s |
| On | CodeSemanticSearch semantic retrieval at the start of thinking | 1 min 41 s |

Same question. With the index on, the run took about 1/6.4 of the time (646 s → 101 s).
