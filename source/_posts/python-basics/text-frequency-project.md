---
title: 文本词频统计项目实战
date: 2026-07-15 09:50:00
updated: 2026-07-15 09:50:00
permalink: python-basics/text-frequency-project/
description: 用一个完整项目串联文本清洗、词频统计、文件读写和 JSON 结果输出。
tags:
  - Python
categories:
  - Python
---
上一篇：[文件、JSON、CSV 与异常处理](/python-basics/files-json-csv-and-exceptions/)　返回：[Python 基础学习索引](/python-basics/index/)

## 1. 项目目标

读取 `article.txt`，清理多余空白，统计总词数、不同词数、最高频词及每个词的出现次数，最后保存为 JSON。

项目位置：

```text
F:\AAAAA\python\text-analyzer\
```

## 2. 项目结构

```text
text-analyzer/
├── data/
│   └── article.txt
├── output/
│   └── result.json
├── main.py
├── file_utils.py
└── text_utils.py
```

| 文件 | 职责 |
|---|---|
| `main.py` | 组织读取、清洗、统计和保存流程 |
| `file_utils.py` | 读取文本、创建输出目录、保存 JSON |
| `text_utils.py` | 清洗文本、统计词频 |
| `article.txt` | 输入数据 |
| `result.json` | 输出结果 |

## 3. 数据流

```text
article.txt
  → read_text()
  → clean_text()
  → split()
  → count_words()
  → result 字典
  → save_json()
  → result.json
```

## 4. 文本工具

```python
def clean_text(text):
    cleaned_text = " ".join(text.split())
    return cleaned_text


def count_words(words):
    word_count = {}

    for word in words:
        current_count = word_count.get(word, 0)
        word_count[word] = current_count + 1

    return word_count
```

`text.split()` 把字符串切成单词列表，`" ".join(...)` 用一个空格重新连接。`dict.get(word, 0)` 让第一次出现的单词从 `0` 开始计数。

## 5. 文件工具

```python
import json
from pathlib import Path


def read_text(file_path):
    path = Path(file_path)
    with open(path, "r", encoding="utf-8") as file:
        return file.read()


def save_json(data, file_path):
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
```

## 6. 主流程

```python
from pathlib import Path

from file_utils import read_text, save_json
from text_utils import clean_text, count_words

BASE_DIR = Path(__file__).resolve().parent
INPUT_PATH = BASE_DIR / "data" / "article.txt"
OUTPUT_PATH = BASE_DIR / "output" / "result.json"


def main():
    content = read_text(INPUT_PATH)
    cleaned_text = clean_text(content)
    words = cleaned_text.split()
    word_count = count_words(words)

    top_word = max(
        word_count,
        key=lambda word: word_count[word]
    ) if word_count else None

    result = {
        "total_words": len(words),
        "unique_words": len(word_count),
        "top_word": top_word,
        "word_count": word_count
    }

    save_json(result, OUTPUT_PATH)


if __name__ == "__main__":
    main()
```

`max()` 默认遍历字典的键，`key=lambda word: word_count[word]` 表示根据每个键对应的次数比较。

## 7. 当前输入和正确结果

输入：

```text
Python LLM RAG
Python RAG
Python Agent
LLM Agent Python
```

输出：

```json
{
  "total_words": 10,
  "unique_words": 4,
  "top_word": "Python",
  "word_count": {
    "Python": 4,
    "LLM": 2,
    "RAG": 2,
    "Agent": 2
  }
}
```

## 8. 实际遇到的错误

### 模块没有保存

`text_utils.py` 在编辑器里写了代码，但磁盘文件仍为 0 字节，导入时出现：

```text
ImportError: cannot import name 'clean_text'
```

运行前按 `Ctrl + S`，确保标签旁的未保存白点消失。

### 把 `join` 写成 `json`

错误：

```python
" ".json(text.split())
```

正确：

```python
" ".join(text.split())
```

### `split()` 传入文件对象

错误：

```python
content.split(file)
```

`split()` 的分隔符必须是字符串或不传。正确写法：

```python
content.split()
```

### 路径依赖终端位置

错误路径 `text-analyzer/data/article.txt` 会随着终端位置变化。使用 `BASE_DIR` 从 `main.py` 自身定位。

### 计数变量未初始化

直接执行 `dict_words += 1` 会触发 `NameError`。更简单的写法是：

```python
unique_words = len(word_count)
```

### 词频键写死

只统计 `Python`、`LLM`、`RAG`、`Agent` 会漏掉新单词。应遍历所有单词动态更新字典。

## 9. 独立复现与验收

1. 自己建立项目目录和三个 Python 文件。
2. 不看原代码写出 `read_text()`、`clean_text()`、`count_words()`、`save_json()`。
3. 运行 `python main.py`。
4. 检查 JSON 是否为总词数 `10`、不同词数 `4`、最高频词 `Python`。
5. 在输入中增加 `Docker`，确认程序能自动统计新单词。

能够解释每个函数的输入、输出和职责，并独立排查路径与导入错误，即完成本阶段。
