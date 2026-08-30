---
title: 第一个项目：Tiny-GPT day1
date: 2026-08-28 10:00:00
tags:
  - Tiny-GPT
categories:
  - 大模型项目
toc_number: false
mathjax: true
published: true
---
# 0. 项目最终目标

计划使用本地电脑（RTX 5060、8 GB 显存）训练一个类似 GPT-2 的文本生成模型。第一版以一本英文小说作为训练数据，采用 GPT-2 的 Decoder-only 架构和字符级 Tokenizer，先跑通从数据处理到文本生成的完整流程。

# 1. Day 1 学习内容

今天主要学习了 Tokenizer 的基础知识，了解了 BPE、BBPE、WordPiece 和 SentencePiece 等常见算法。

结合 AI 辅助梳理了 Tiny-GPT 的实现步骤，并完成了数据清洗和字符级 Tokenizer。第一版暂不使用 BPE 等子词算法，计划在第二版中继续实现和对比。

## 1.1 项目文件结构

目前项目按原始数据、处理后数据、脚本、核心源码和测试内容进行组织：

![Tiny-GPT Day 1 项目目录结构](/img/blog/projects/tiny-gpt-day1/01-project-directory-structure.png)

# 2. 代码实现

## 2.1 数据清洗

`prepare_data.py` 负责读取原始语料，统一换行符与标点格式，删除控制字符，并将清洗结果写入 `data/processed/alice.txt`。

```python
from pathlib import Path
import re
import unicodedata

# 此文件所在的文件夹
ROOT_DIR = Path(__file__).parent

# 其他文件夹内的文件
file_path = ROOT_DIR.parent / "data" / "raw" / "input.txt"
output_Path = ROOT_DIR.parent / "data" / "processed" / "alice.txt"


# 数据清洗
def clean_text(text):
    # Windows 换行统一
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Unicode 规范化
    text = unicodedata.normalize("NFKC", text)

    # 标点统一
    text = text.replace("‘", "'")
    text = text.replace("’", "'")
    text = text.replace("“", '"')
    text = text.replace("”", '"')
    text = text.replace("—", "--")
    text = text.replace("…", "...")

    # Tab 转空格
    text = text.replace("\t", " ")

    # 删除控制字符，保留换行
    text = "".join(
        char
        for char in text
        if char == "\n" or unicodedata.category(char) != "Cc"
    )

    # 进行每一行的内部清洗
    lines = []

    for line in text.split("\n"):
        # 删除首尾空格
        line = line.strip()

        # 多个连续空格压缩为一个
        line = re.sub(r" +", " ", line)
        lines.append(line)

    text = "\n".join(lines)

    # 三个及以上换行压缩成两个
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text


# 将文件读取到 text 内
with open(file_path, "r", encoding="utf-8") as file:
    text = file.read()

# 清洗
output_text = clean_text(text)

# 输出文本
with open(output_Path, "w", encoding="utf-8") as file:
    file.write(output_text)

print("数据清洗完成")
```

> 说明：当前数据清洗方案主要由 AI 辅助生成，我还没有系统学习这一部分。后续会针对文本规范化、异常字符处理和清洗策略继续补充学习。

## 2.2 字符级 Tokenizer

目标是从语料库中提取完整字符集合，并实现文本编码、解码、词表保存和词表加载。

`tokenizer.py` 包含字符词表的构建逻辑，以及 Tokenizer 的持久化和加载测试。

```python
from pathlib import Path
import json

# 拿到处理好的文件
TINY_GPT_DIR = Path(__file__).parent
SRC_DIR = TINY_GPT_DIR.parent
ROOT_DIR = SRC_DIR.parent

FILE_PATH = ROOT_DIR / "data" / "processed" / "alice.txt"
OUT_PATH = ROOT_DIR / "tokenizer.json"


class Tokenizer:
    def __init__(self, text: str):
        # 删除重复字符并且固定排序
        self.chars = sorted(set(text))

        self.stoi = {
            character: token_id
            for token_id, character in enumerate(self.chars)
        }
        self.itos = {
            token_id: character
            for token_id, character in enumerate(self.chars)
        }

    def encode(self, text: str) -> list[int]:
        tokens_id = [self.stoi[char] for char in text]
        return tokens_id

    def decode(self, tokens_id: list[int]) -> str:
        string = "".join(self.itos[token_id] for token_id in tokens_id)
        return string

    @property
    def vocab_size(self) -> int:
        return len(self.stoi)

    def save(self, path):
        data = {
            "type": "character",
            "version": 1,
            "vocab": self.chars,
        }

        with open(path, "w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=2)

    @classmethod
    def load(cls, path):
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)

        # 创建一个空的对象（不运行）
        tokenizer = cls.__new__(cls)

        # 读取到的 json 只有 data["vocab"]，并没有这个类该有的属性，因此进行补充
        tokenizer.chars = data["vocab"]
        tokenizer.stoi = {
            character: token_id
            for token_id, character in enumerate(tokenizer.chars)
        }
        tokenizer.itos = {
            token_id: character
            for token_id, character in enumerate(tokenizer.chars)
        }

        return tokenizer


# 创建一个类进行保存前的编码解码
text = FILE_PATH.read_text(encoding="utf-8")
tokenizer = Tokenizer(text)
output = tokenizer.encode(text)
# print(output)

dec = tokenizer.decode(output)
# print(dec)
print("原始 Tokenizer 测试：", dec == text)

# 保存
# tokenizer.save(OUT_PATH)
# print("保存成功")

# 加载
loaded_tokenizer = tokenizer.load(OUT_PATH)
output_load = loaded_tokenizer.encode(text)
dec_load = loaded_tokenizer.decode(output_load)
print("加载后测试：", dec_load == text)
print("编码结果一致：", output_load == output)
print("词表一致：", loaded_tokenizer.chars == tokenizer.chars)

print(loaded_tokenizer.vocab_size)
```

### 2.2.1 重点知识

1. `self.chars = sorted(set(text))`
   - `set(text)` 对语料中的字符去重。
   - `sorted(...)` 固定字符顺序，从而保证字符与 ID 的映射稳定。
2. `@property`
   - 将方法以属性形式访问，因此使用 `tokenizer.vocab_size`，而不是 `tokenizer.vocab_size()`。
3. `@classmethod`
   - 定义属于类的方法，第一个参数必须是 `cls`，代表当前类本身。
4. `json.dump` 与 `json.dumps`
   - `json.dump` 将数据序列化后直接写入文件。
   - `json.dumps` 将数据序列化为字符串并返回。
5. `cls.__new__(cls)`
   - 常规实例化会依次执行 `__new__` 和 `__init__`。
   - 加载已有词表时，只需要先创建一个空对象，不希望重新根据原始文本构建词表，因此使用 `cls.__new__(cls)` 跳过 `__init__`，再根据 JSON 中的 `vocab` 手动恢复 `chars`、`stoi` 和 `itos`。

# 3. Day 2 计划

下一步计划实现 Dataset，并完成训练集与测试集的划分。
