---
title: 变量、数据类型与字符串
date: 2026-07-15 09:10:00
updated: 2026-07-15 09:10:00
permalink: python-basics/variables-data-types-and-strings/
description: 学习 Python 变量、常见数据类型、类型转换与字符串处理的基础知识。
tags:
  - Python
categories:
  - Python
---
返回：[Python 基础学习索引](/python-basics/index/)　下一篇：[列表、字典、集合与元组](/python-basics/lists-dictionaries-sets-and-tuples/)

## 1. 变量

变量是数据的名字，`=` 表示把右侧的值赋给左侧变量。

```python
name = "张三"
age = 20
height = 1.75
is_student = True
```

推荐使用小写字母和下划线命名：

```python
user_name = "张三"
total_score = 95
```

## 2. 基本数据类型

| 类型 | 含义 | 示例 |
|---|---|---|
| `int` | 整数 | `20` |
| `float` | 小数 | `1.75` |
| `str` | 字符串 | `"Python"` |
| `bool` | 布尔值 | `True`、`False` |

使用 `type()` 查看类型：

```python
age = 20
height = 1.75
print(type(age))
print(type(height))
```

## 3. 类型转换

`input()` 得到的内容永远是字符串。做数学运算前需要转换：

```python
age = int(input("请输入年龄："))
print(age + 1)
```

常见转换：

```python
int("20")
float("3.14")
str(100)
bool(1)
```

`int("二十")` 会触发 `ValueError`，因为字符串不是合法数字。

## 4. 字符串操作

```python
text = "python llm rag"

print(len(text))       # 长度
print(text[0])         # 第一个字符
print(text[-1])        # 最后一个字符
print(text[0:6])       # 切片 python
print(text.replace("rag", "agent"))
print(text.split())    # ['python', 'llm', 'rag']
```

字符串不能原地修改，`replace()`、`strip()` 等方法返回新字符串：

```python
text = "  python  "
cleaned_text = text.strip()
```

判断关键词：

```python
text = "我正在学习 Python"
print("Python" in text)  # True
```

格式化输出优先使用 f-string：

```python
name = "张三"
age = 20
print(f"我叫{name}，今年{age}岁")
```

## 5. `split()` 和 `join()`

```python
text = "Python   LLM\nRAG"
words = text.split()
cleaned_text = " ".join(words)
```

结果为：

```text
Python LLM RAG
```

`split()` 把字符串拆成列表，`join()` 把多个字符串连接起来。

## 常见错误

```python
" ".json(text.split())
```

字符串没有 `json()` 方法，正确方法是：

```python
" ".join(text.split())
```

## 自测

1. 为什么 `input()` 得到的年龄不能直接加 `1`？
2. `=` 和 `==` 有什么区别？
3. 写一行代码，把多余空白统一为一个空格。

