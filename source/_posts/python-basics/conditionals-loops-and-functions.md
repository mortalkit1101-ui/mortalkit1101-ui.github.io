---
title: 条件判断、循环与函数
date: 2026-07-15 09:30:00
updated: 2026-07-15 09:30:00
permalink: python-basics/conditionals-loops-and-functions/
description: 通过条件、循环和函数组织 Python 程序，并理解模块化代码的基本方法。
tags:
  - Python
categories:
  - Python
---
上一篇：[列表、字典、集合与元组](/python-basics/lists-dictionaries-sets-and-tuples/)　下一篇：[文件、JSON、CSV 与异常处理](/python-basics/files-json-csv-and-exceptions/)

## 1. 条件判断

```python
score = 85

if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

逻辑运算：

```python
if age >= 18 and score >= 80:
    print("两个条件都满足")

if age < 18 or score >= 80:
    print("至少满足一个条件")

if not is_deleted:
    print("数据可用")
```

空字符串、空列表、空字典、空集合、`0` 和 `None` 在判断中都相当于 `False`。

## 2. `for` 循环

```python
names = ["张三", "李四", "王五"]

for index, name in enumerate(names):
    print(index, name)
```

`enumerate()` 同时提供索引和值。生成整数序列使用 `range()`：

```python
for number in range(1, 6):
    print(number)
```

## 3. `while`、`break` 和 `continue`

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

`break` 结束整个循环，`continue` 跳过本轮：

```python
for number in [3, -1, 8, -5, 10]:
    if number < 0:
        continue
    print(number)
```

## 4. 列表推导式

```python
numbers = [1, 2, 3, 4, 5]
squares = [number ** 2 for number in numbers]
even_numbers = [number for number in numbers if number % 2 == 0]
```

逻辑复杂时应使用普通循环，避免为了简短而降低可读性。

## 5. 函数

函数把一个明确任务封装起来，通过参数接收数据，通过 `return` 返回结果。

```python
def add(a, b):
    result = a + b
    return result

total = add(2, 3)
```

默认参数：

```python
def greet(name, message="你好"):
    return f"{message}，{name}"
```

一个函数最好只负责一件事。例如文本项目拆成：

```python
def read_text(file_path):
    pass

def clean_text(text):
    pass

def count_words(words):
    pass

def save_json(data, file_path):
    pass
```

## 6. 模块

一个 `.py` 文件就是一个模块：

```python
from file_utils import read_text, save_json
from text_utils import clean_text, count_words
```

`main.py` 负责组合这些函数。常见入口写法：

```python
if __name__ == "__main__":
    main()
```

这样直接运行文件时会调用 `main()`，被其他程序导入时不会自动执行。

## 常见错误

- 缩进错误：Python 使用缩进表示代码块，通常使用 4 个空格。
- `while` 条件永远为真：忘记更新变量会形成死循环。
- 文件没有保存就运行：导入的模块可能仍是磁盘上的空文件。
- 函数只打印但没有 `return`：调用结果会是 `None`。

## 自测

1. `break` 和 `continue` 分别影响什么？
2. `return` 与 `print()` 有什么区别？
3. 为什么文本项目要拆成多个函数和模块？

