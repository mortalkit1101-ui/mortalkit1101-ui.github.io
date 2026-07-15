---
title: 列表、字典、集合与元组
date: 2026-07-15 09:20:00
updated: 2026-07-15 09:20:00
permalink: python-basics/lists-dictionaries-sets-and-tuples/
description: 掌握 Python 列表、字典、集合和元组的特点、操作方法与适用场景。
tags:
  - Python
categories:
  - Python
---
上一篇：[变量、数据类型与字符串](/python-basics/variables-data-types-and-strings/)　下一篇：[条件判断、循环与函数](/python-basics/conditionals-loops-and-functions/)

## 1. 列表 `list`

列表保存有顺序、可以修改的一组数据。

```python
scores = [80, 92, 75, 88]

print(scores[0])
print(scores[-1])
print(scores[1:3])

scores.append(100)
scores.remove(75)
last = scores.pop()
```

常用统计与排序：

```python
print(len(scores))
print(max(scores))
print(min(scores))
print(sum(scores) / len(scores))

scores.sort()
scores.sort(reverse=True)
new_scores = sorted(scores)
```

`sort()` 修改原列表；`sorted()` 返回新列表。

## 2. 字典 `dict`

字典使用“键：值”保存有明确字段的数据。

```python
student = {
    "name": "张三",
    "age": 20,
    "score": 92
}

student["score"] = 100
student["major"] = "通信工程"
student.pop("age")
```

键可能不存在时使用 `get()`：

```python
print(student.get("phone", "没有手机号"))
```

遍历键和值：

```python
for key, value in student.items():
    print(key, value)
```

### 动态统计词频

```python
words = ["python", "llm", "python", "rag"]
word_count = {}

for word in words:
    word_count[word] = word_count.get(word, 0) + 1
```

这比提前写死单词名称更通用，文章中新出现的单词也能自动统计。

## 3. 集合 `set`

集合用于去重和集合运算，元素没有固定顺序。

```python
words = ["python", "llm", "python", "rag"]
unique_words = set(words)
print(len(unique_words))
```

```python
a = {"python", "rag", "llm"}
b = {"python", "docker"}

print(a & b)  # 交集
print(a | b)  # 并集
print(a - b)  # 差集
```

## 4. 元组 `tuple`

元组有顺序，但创建后不能修改。

```python
position = (126.5, 30.2)
print(position[0])
```

函数可以使用元组形式返回多个值：

```python
def get_min_max(numbers):
    return min(numbers), max(numbers)

lowest, highest = get_min_max([3, 8, 1, 9])
```

## 5. 选择方法

| 需求 | 数据结构 |
|---|---|
| 保存有顺序且需要修改的数据 | 列表 |
| 保存字段和对应值 | 字典 |
| 去重或进行集合运算 | 集合 |
| 保存不应该修改的数据 | 元组 |

## 常见错误

- 使用不存在的字典键：优先考虑 `get()`。
- 认为集合有固定顺序：不要依赖集合的显示顺序。
- 混淆 `sort()` 与 `sorted()`：前者修改原列表，后者返回新列表。

## 自测

1. 如何求列表中不同元素的数量？
2. 如何让字典中某个单词的计数自动加一？
3. 学生信息为什么更适合字典而不是集合？

