---
title: 第一个项目：Tiny-GPT day2
date: 2026-08-31 10:00:00
tags:
  - Tiny-GPT
categories:
  - 大模型项目
toc_number: false
mathjax: true
published: true
---
# 1. Day 2 学习内容

今天结合 GPT-1 与 GPT-2 论文继续学习 Decoder-only Transformer。GPT-2 延续了自回归语言模型的预训练目标，并重点展示了模型在不进行特定任务微调时的零样本能力；在网络结构上采用 Decoder-only 架构，并将 LayerNorm 放在注意力层和 MLP 之前，即 Pre-Norm。

GPT-2 Small 的词表大小为 50,257，上下文长度为 1,024，隐藏维度为 768，由 12 层 Transformer Block 和 12 个注意力头组成，所有 Block 之后还有一次最终 LayerNorm。

下图展示了 GPT-2 的整体数据流：Token Embedding 与 Position Embedding 相加后，依次经过多层掩码自注意力和前馈网络，最后输出下一个 Token 的预测分数。

![GPT-2 Decoder-only Transformer 架构](/img/blog/projects/gpt2/01-gpt2-transformer-architecture.png)

Transformer 的基础原理已经在[《02 Transformer 算法》](/2026/08/23/blog/大模型llm/02%20Transformer算法/)中整理，这里主要参考 GPT-2 和 Andrej Karpathy 的实现方式，完成适合本机 RTX 5060 8 GB 显存的轻量版本。

今天的代码对应总体规划中的多头因果注意力、Transformer Block 和完整 Tiny-GPT 主体结构。

# 2. 代码实现

当前模型配置为 4 层 Transformer Block、4 个注意力头、256 维 Embedding 和 256 个 Token 的上下文长度。代码依次实现配置类、多头因果注意力、MLP、Pre-Norm Block，以及完整 Tiny-GPT 的前向传播和交叉熵损失。

`model.py`：

```python
import torch
from torch import nn
import math
from dataclasses import dataclass
import torch.nn.functional as F
from pathlib import Path


@dataclass
class GPTConfig:
    block_size: int = 256
    vocab_size: int = 73
    n_layer: int = 4
    n_head: int = 4
    n_embd: int = 256
    dropout: float = 0.1


# 拿到处理好的文件
TINY_GPT_DIR = Path(__file__).parent
SRC_DIR = TINY_GPT_DIR.parent
ROOT_DIR = SRC_DIR.parent

FILE_PATH = ROOT_DIR / "data" / "processed" / "alice.txt"
OUT_PATH = ROOT_DIR / "tokenizer.json"

# 设备检测：CPU 或者 GPU
device = "cpu"
if torch.cuda.is_available():
    device = "cuda"


# 实现多头掩码注意力机制
class CausalMaskedAttention(nn.Module):
    def __init__(self, config):
        super().__init__()

        # 将 [B, T, C] 变成 [B, T, 3C]，拆分为 Q、K、V
        self.c_attn = nn.Linear(config.n_embd, 3 * config.n_embd)

        # 在最后输出之前经过线性层拼接多头
        self.c_proj = nn.Linear(config.n_embd, config.n_embd)

        # Dropout
        self.attn_dropout = nn.Dropout(config.dropout)
        self.out_dropout = nn.Dropout(config.dropout)

        # 在 forward 中使用
        self.n_embd = config.n_embd
        self.n_head = config.n_head

    def forward(self, x):
        # 读取 B、T、C
        B, T, C = x.size()

        # 定义 Q、K、V，便于拆分
        qkv = self.c_attn(x)
        q, k, v = qkv.split(self.n_embd, dim=-1)

        # 拆分为多头并转换：[B, T, C] -> [B, T, H, D] -> [B, H, T, D]
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)

        # 缩放点积注意力：[B, H, T, D] @ [B, H, D, T] = [B, H, T, T]
        scores = torch.matmul(q, k.transpose(-1, -2)) / math.sqrt(
            C // self.n_head
        )

        # 制作下三角掩码，并扩展为 [1, 1, T, T] 与 scores 广播
        mask = torch.tril(torch.ones(T, T, device=x.device)).view(1, 1, T, T)
        scores = scores.masked_fill(mask == 0, float("-inf"))

        # Softmax
        weights = torch.softmax(scores, dim=-1)
        weights = self.attn_dropout(weights)

        # 乘以 V
        output = torch.matmul(weights, v)

        # 转置回 [B, H, T, D] -> [B, T, H, D] -> [B, T, C]
        output = output.transpose(1, 2).contiguous().view(B, T, C)

        # 经过最后一个线性层
        y = self.c_proj(output)
        y = self.out_dropout(y)
        return y


# 实现 MLP
class MLP(nn.Module):
    def __init__(self, config):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(config.n_embd, 4 * config.n_embd),
            nn.GELU(approximate="tanh"),
            nn.Linear(4 * config.n_embd, config.n_embd),
            nn.Dropout(config.dropout),
        )

    def forward(self, x):
        return self.network(x)


# 每一层 Block，也就是 Decoder
class Block(nn.Module):
    def __init__(self, config):
        super().__init__()

        self.ln_1 = nn.LayerNorm(config.n_embd)
        self.attn = CausalMaskedAttention(config)
        self.ln_2 = nn.LayerNorm(config.n_embd)
        self.mlp = MLP(config)

    def forward(self, x):
        # GPT-2 架构采用 Pre-Norm 形式
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x


# Tiny-GPT 完整结构
class Tiny_GPT(nn.Module):
    def __init__(self, config):
        super().__init__()

        self.transformer = nn.ModuleDict(
            dict(
                wte=nn.Embedding(config.vocab_size, config.n_embd),
                wpe=nn.Embedding(config.block_size, config.n_embd),
                h=nn.ModuleList(
                    [Block(config) for _ in range(config.n_layer)]
                ),
                ln_f=nn.LayerNorm(config.n_embd),
            )
        )
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size)

    def forward(self, x, target=None):
        B, T = x.size()

        # 进行字符编码
        token_embd = self.transformer.wte(x)

        # 进行位置编码
        pos = torch.arange(0, T, dtype=torch.long, device=x.device)
        pos_embd = self.transformer.wpe(pos)

        # 相加得到 Block 的输入 x
        x = token_embd + pos_embd

        # 进行 Block 中的运算，每一层执行一次
        for layer in self.transformer.h:
            x = layer(x)

        # 最终 LayerNorm
        x = self.transformer.ln_f(x)

        # LM Head
        logits = self.lm_head(x)

        # 如果 target 不是 None，就计算 loss
        loss = None
        if target is not None:
            loss = F.cross_entropy(
                logits.reshape(-1, logits.size(-1)),
                target.reshape(-1),
            )

        return logits, loss
```

# 3. 重点知识

## 3.1 Dropout 的位置

当前实现主要在两个位置使用 Dropout：

1. **注意力权重**：Softmax 得到 `weights` 后、与 `V` 相乘前执行，避免模型过度依赖少数 Token 之间的注意力连接。
2. **子层输出**：多头注意力输出投影和 MLP 输出之后执行，降低相邻子层之间形成高度耦合依赖的风险。

## 3.2 交叉熵损失的输入形状

`F.cross_entropy` 要求预测值最后一维表示类别，因此需要先将 Batch 和时间维度合并：

- 预测分数：`logits.reshape(-1, logits.size(-1))`，形状为 `[B × T, vocab_size]`。
- 正确答案：`target.reshape(-1)`，形状为 `[B × T]`。

这样，每一个时间位置都会作为一个独立的下一个 Token 分类样本参与损失计算。
