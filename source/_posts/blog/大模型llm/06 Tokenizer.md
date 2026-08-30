---
title: 06 Tokenizer
date: 2026-08-30 10:00:00
tags:
  - Tokenizer
categories:
  - 大模型 LLM
toc_number: false
mathjax: true
published: true
---
主要目的是在transfermer的input embeding之前，将文本信息转变为input向量。主要有以下几种方式。（英文多采用BPE算法，双语采用SentencePiece算法）
# 1.分词粒度
## 1.1Word-based
将文本划分为一个个词。
```text
"Don't you love 🤗 Transformers? We sure do."
↓
1. 不拆分标点
["Don't", "you", "love", "🤗", "Transformers?", "We", "sure", "do."]
↓
2. 拆分标点
["Don", "'", "t", "you", "love", "🤗", "Transformers", "?", "We", "sure", "do", "."]
```
优点：按照单个词分开符合人的直觉
缺点：
- 相同意思的词被分为不同token： dog，dogs
- 词表非常大（可以限制词表大小，但是这样做也会对模型的学习带来限制）
- 可能经常出现位置词UNKNOWN

## 2. Character-based
将文本划分为一个个字符
```text
"What is your name?"

↓

["W", "h", "a", "t", "i", "s", "y", "o", "u", "r", "n", "a", "m", "e", "?"]
```
优点：
- 可以表示任意的英文文本
- 对英文来说不需要过大的词表
缺点：
- 单个字符的信息量很低，模型性能很差（没有单词那种信息携带）
- 中文也需要很大的词表
- 相对于 word-based 来说，容易产生更长的token序列。（d_model维度）

## 3. Subword-based
对于常用词不应该切分，不常用的可以用词群来表示。
```text
dog
↓
[D, O, G]  xxx (不进行拆分)

dogs
↓
dog + s

tokenization
↓
token + ization

BERT分词方式：
tokenization
↓
token + ##ization （使用 ## 来表示这是词的后缀）
```

| Subword 分词方法 | 典型模型 |
|---|---|
| BPE / BBPE | GPT、GPT-2、GPT-J、GPT-Neo、RoBERTa、BART、LLaMA、ChatGLM-6B、Baichuan |
| WordPiece | BERT、DistilBERT、MobileBERT |
| Unigram | ALBERT、T5、mBART、XLNet |
# 2. 四种常用的Subword-based
## 2.1 Byte-Pair Encoding(BPE)
主要包括两部分：”词频统计“ 和 ”词表合并“

![BPE 从语料词频构建基础词表并完成第一次合并](/img/blog/llm/06-tokenizer/01-bpe-initial-vocabulary-and-first-merge.png)

![BPE 根据相邻 token 频率完成第二次合并](/img/blog/llm/06-tokenizer/02-bpe-second-merge.png)

![BPE 根据相邻 token 频率完成第三次合并](/img/blog/llm/06-tokenizer/03-bpe-third-merge.png)

![BPE 停止合并并得到最终词表](/img/blog/llm/06-tokenizer/04-bpe-final-vocabulary.png)

缺点：
- 包含所有可能的基本字符表可能会很大
- 对于unicode字符都视为基本字符（中文）

因此产生 Byte-level BPE：
> 将两个byte视为基本token，两个字节合并即可以表示Unicode
## 2.2 WordPiece
大体与BPE类似，
- 除第一个字母外，都会添加 ## 作为前缀（BERT）word => [w,##o,##r,##d]
- 使用概率大小对token进行合并，公式如下：
$$
\text{pair得分}
=
\frac{\text{pair出现的次数}}
{\text{token1出现的次数}\times\text{token2出现的次数}}
$$
- 该算法优先考虑单个token在词表中不太频繁的pair进行合并（token1和token2不频繁，但是pair很频繁，因此合并起来非常有用）
![WordPiece 统计 token 与 pair 频率并计算合并得分](/img/blog/llm/06-tokenizer/05-wordpiece-pair-scoring.png)

## 2.3Unigram
经常和 SentencePiece中使用
![Unigram 从大词表开始逐步删减 token](/img/blog/llm/06-tokenizer/06-unigram-vocabulary-pruning.png)

那么如何删减token？
先尝试删掉一个token，并且计算对应的 unigram loss，删除 p% 使得loss增加最少的token
先计算什么都不删除的loss，之后进行删除
![Unigram 第一次迭代：尝试删除 token 并比较 loss](/img/blog/llm/06-tokenizer/07-unigram-first-pruning-iteration.png)

![Unigram 第二次迭代：继续计算删除 token 后的 loss](/img/blog/llm/06-tokenizer/08-unigram-second-pruning-iteration.png)

为每个单词的每一种划分是非常耗时的，采用更高效的维特比(Viterbi)算法

## 2.4 SentencePiece
BPE，WordPiece，Unigram的缺点：
- 并非所有语言都使用空格来分割单词
- 可以使用特定语言的 pre-tokenizer 分词，但是不通用
因此 SentencePiece
- 将输入视为输入字节流（包括空格）
- 然后 Byte-level BPE 或者 unigram 算法构建适当的词汇表

SentencePiece的特点包括：
- 纯数据驱动：直接从句子中训练分词和去分词模型，不需要预先分词；
- 语言无关：将句子视为Unicode字符序列，不依赖于特定语言的逻辑；
- 多种子词算法：支持BPE和Unigram算法；
- 快速且轻量：分割速度快，内存占用小；
- 自包含：使用相同的模型文件可以获得相同的分词/去分词结果；
- 直接生成词汇ID：管理词汇到ID的映射，可以直接从原始句子生成词汇ID序列；
- 基于NFKC的规范化：执行基于NFKC的文本规范化

# 3. 总结
| Tokenization method | Advantages | Disadvantages |
|---|---|---|
| BPE | Allows for a large vocabulary size；Handles rare and out-of-vocabulary words well；Efficiently tokenizes subwords | May result in many subwords for a single word；Not ideal for languages without clear word boundaries |
| WordPiece | Allows for a large vocabulary size；Handles rare and out-of-vocabulary words well；Efficiently tokenizes subwords | May result in many subwords for a single word；Not ideal for languages without clear word boundaries |
| Unigram | Efficiently tokenizes subwords；Scales well for large vocabularies | May produce many subwords for a single word；Not ideal for languages without clear word boundaries |
| SentencePiece with Unigram | Can handle languages without clear word boundaries；Efficiently tokenizes subwords | May produce many subwords for a single word |
| SentencePiece with BPE | Can handle languages without clear word boundaries；Efficiently tokenizes subwords | May result in many subwords for a single word |
| Byte-level BPE | Can handle any character without out-of-vocabulary tokens；Efficiently tokenizes subwords | May result in many subwords for a single word |
| Word-level Tokenization | Simple to implement；Fewer subwords per word than other methods | May not handle rare or out-of-vocabulary words well；Not efficient for large vocabularies |
| Character-level Tokenization | Handles any word or character；Efficient for small vocabularies | May produce too many subwords for a single word；Not efficient for large vocabularies |
