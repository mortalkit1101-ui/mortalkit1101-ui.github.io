---
title: 文件、JSON、CSV 与异常处理
date: 2026-07-15 09:40:00
updated: 2026-07-15 09:40:00
permalink: python-basics/files-json-csv-and-exceptions/
description: 学习 Python 文件读写、JSON 与 CSV 数据处理，以及常见异常的捕获与处理。
tags:
  - Python
categories:
  - Python
---
上一篇：[条件判断、循环与函数](/python-basics/conditionals-loops-and-functions/)　下一篇：[文本词频统计项目实战](/python-basics/text-frequency-project/)

## 1. 使用 `Path` 构造路径

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
file_path = BASE_DIR / "data" / "article.txt"
```

- `__file__`：当前 Python 文件。
- `resolve()`：得到绝对路径。
- `parent`：得到所在文件夹。
- `/`：拼接路径。

这种写法不依赖终端当前目录。

## 2. 读取和写入文本

```python
with open(file_path, "r", encoding="utf-8") as file:
    content = file.read()
```

`with` 结束时自动关闭文件。按行读取：

```python
with open(file_path, "r", encoding="utf-8") as file:
    for line in file:
        line = line.strip()
        if line:
            print(line)
```

写入模式：

| 模式 | 含义 |
|---|---|
| `r` | 读取 |
| `w` | 覆盖写入 |
| `a` | 末尾追加 |
| `rb` | 二进制读取 |

## 3. JSON

JSON 适合保存字典、列表等结构化数据。

```python
import json

result = {
    "total_words": 100,
    "top_words": [{"word": "python", "count": 10}]
}

with open("result.json", "w", encoding="utf-8") as file:
    json.dump(result, file, ensure_ascii=False, indent=2)
```

- `ensure_ascii=False`：保留中文。
- `indent=2`：使用两个空格缩进。
- `json.dump()`：写入文件。
- `json.load()`：从文件读取。

## 4. CSV

CSV 适合表格数据：

```python
import csv

students = [
    {"name": "张三", "score": 92},
    {"name": "李四", "score": 100}
]

with open("students.csv", "w", encoding="utf-8-sig", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerows(students)
```

Windows Excel 打开中文 CSV 时使用 `utf-8-sig` 更稳妥。CSV 读取出的数字通常仍是字符串，需要时用 `int()` 转换。

## 5. 异常处理

```python
try:
    with open("data.txt", "r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    print("没有找到 data.txt")
except UnicodeDecodeError:
    print("文件编码不是 UTF-8")
except OSError as error:
    print(f"文件操作失败：{error}")
```

只捕获自己能够解释或处理的异常，不要直接使用空的 `except:` 隐藏真实问题。

主动抛出异常：

```python
def calculate_average(numbers):
    if not numbers:
        raise ValueError("数字列表不能为空")
    return sum(numbers) / len(numbers)
```

## 常见错误

- 相对路径错误：程序寻找的位置取决于终端当前目录。
- 输出文件夹不存在：写文件前用 `path.parent.mkdir(parents=True, exist_ok=True)`。
- 忘记编码：中文文本应显式指定 `encoding="utf-8"`。
- `w` 模式误覆盖：需要保留旧内容时使用 `a`。

## 自测

1. `json.dump()` 与 `json.load()` 分别做什么？
2. 为什么项目使用 `Path(__file__).resolve().parent`？
3. 如何在输出文件夹不存在时自动创建它？

