---
title: 05 Normalization（归一化）
date: 2026-08-28 10:00:00
tags:
  - Normalization
categories:
  - 大模型 LLM
toc_number: false
mathjax: true
published: true
---

归一化的核心作用是控制中间特征的数值尺度，使不同层接收到的输入分布更稳定，从而改善梯度传播和训练稳定性。区分不同归一化方法时，最重要的问题是：**均值和方差沿哪些维度计算？**

标准化常写为：

$$
\hat{x}=\frac{x-\mu}{\sqrt{\sigma^2+\epsilon}},
\qquad
y=\gamma\hat{x}+\beta
$$

其中，$\mu$ 和 $\sigma^2$ 是选定维度上的均值和方差，$\epsilon$ 防止分母为零，$\gamma$ 和 $\beta$ 是可学习的缩放与偏移参数。

假设 Transformer 中间张量的形状为 $[B,T,C]$：

- $B$：Batch Size，批次大小；
- $T$：Sequence Length，序列长度；
- $C$：Hidden Size，隐藏层维度。

# 1. BatchNorm（BN）

BatchNorm 的思路是：**对同一个特征通道，利用一个批次中的多个样本计算统计量**。

对于形状为 $[B,T,C]$ 的序列数据，具体统计范围取决于实现方式。常见做法是对每个通道 $C$，在批次维度 $B$ 以及序列位置 $T$ 上统计均值和方差。这样，同一通道中的不同样本、不同 Token 位置会共享一组统计量。

## 1.1 在序列任务中的问题

BatchNorm 在 CNN 中很常见，但通常不适合作为 Transformer 的主要归一化方式：

1. **依赖批次统计量**：Batch Size 较小时，均值和方差的估计容易波动。
2. **训练与推理行为不同**：训练时使用当前批次统计量，推理时通常使用训练阶段积累的滑动统计量。
3. **容易受到 Padding 影响**：不同序列长度不同，补齐的 `<PAD>` 可能参与统计，导致均值和方差被无意义的数值污染。
4. **混合不同位置的信息**：自然语言中不同 Token、不同位置的语义差别很大，将它们放入同一组统计量未必合理。

下图展示了一个批次中的变长序列。为了组成规则张量，短序列需要补充 `<PAD>`；如果归一化时没有正确屏蔽这些位置，Padding 就会影响批次统计量。

![批次中的变长序列与 Padding](/img/blog/llm/05-normalization/01-batchnorm-sequence-padding.png)

因此，序列模型通常更倾向于使用不依赖批次统计量的 LayerNorm 或 RMSNorm。

# 2. LayerNorm（LN）

LayerNorm 不跨样本统计，而是对**每个 Token 自己的隐藏层向量**进行归一化。

对于输入 $x\in\mathbb{R}^{B\times T\times C}$，LayerNorm 会在最后一个维度 $C$ 上计算：

$$
\mu=\frac{1}{C}\sum_{i=1}^{C}x_i,
\qquad
\sigma^2=\frac{1}{C}\sum_{i=1}^{C}(x_i-\mu)^2
$$

再得到：

$$
y_i=\gamma_i\frac{x_i-\mu}{\sqrt{\sigma^2+\epsilon}}+\beta_i
$$

也就是说，$[B,T,C]$ 中每个 $[C]$ 向量都有自己的均值和方差，不会与其他样本或其他 Token 混合。

## 2.1 优点

1. **不依赖 Batch Size**：小批次甚至单样本推理时都能稳定工作。
2. **适应变长序列**：每个 Token 独立归一化，序列长度不会改变统计方式。
3. **训练与推理一致**：不需要维护滑动均值和滑动方差。
4. **降低优化难度**：控制各层激活值的尺度，使梯度传播更稳定，并降低训练对参数初始化的敏感程度。

## 2.2 代价

LayerNorm 需要计算均值、方差，并执行中心化、缩放和偏移。对于大模型，这些逐元素操作和额外的内存访问会带来一定开销。

# 3. RMSNorm

RMSNorm 可以看作 LayerNorm 的简化版本。它不减去均值，只根据均方根（Root Mean Square）调整向量的尺度。

公式为：

$$
y=\gamma\cdot\frac{x}{\sqrt{\frac{1}{n}\sum_{i=1}^{n}x_i^2+\epsilon}}
$$

与 LayerNorm 相比，RMSNorm：

- 不计算均值，也不执行中心化；
- 计算平方值的均值，但不需要计算方差；
- 通常只保留可学习缩放参数 $\gamma$，不使用偏移参数 $\beta$；
- 计算路径更简单，因此被 LLaMA 等大语言模型广泛采用。

代码实现：

```python
import torch
from torch import nn
import math

class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-5):
        super().__init__()
        
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        x = x * torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        return self.weight * x
```

这里 `x` 的输入形状为 `[B,T,C]`：

1. `x.pow(2)` 对所有元素平方，但不会在这一步聚合维度。
2. `.mean(dim=-1, keepdim=True)` 只在最后一个维度 $C$ 上计算平方均值，结果形状为 `[B,T,1]`。
3. `keepdim=True` 保留最后一个维度，便于结果通过广播与原张量 `[B,T,C]` 相乘。
4. `torch.rsqrt(...)` 计算平方根的倒数，即 $1/\sqrt{x}$。
5. `self.weight` 就是可学习缩放参数 $\gamma$，形状为 `[C]`。

# 4. Pre-Norm 与 Post-Norm

BatchNorm、LayerNorm 和 RMSNorm 的区别在于**如何计算归一化统计量**；Pre-Norm 和 Post-Norm 讨论的是**归一化层放在残差分支的什么位置**。两者不是同一层面的分类。

设第 $l$ 层输入为 $x_l$，子层（注意力层或前馈网络）为 $F_l$。

## 4.1 Pre-Norm

Pre-Norm 先归一化，再进入子层：

$$
x_{l+1}=x_l+F_l(\operatorname{Norm}(x_l))
$$

特点：

- 残差主路径中存在从 $x_l$ 到 $x_{l+1}$ 的恒等映射，梯度可以更直接地向前传播；
- 深层网络通常更容易训练，对学习率预热和初始化的要求相对较低；
- 多层累积后，最终输出通常还会再接一次归一化；
- 每个子层只处理归一化后的输入，但残差流本身不会在每层末尾被重新归一化。

目前许多大语言模型使用 Pre-Norm，并常与 RMSNorm 组合。

## 4.2 Post-Norm

Post-Norm 先完成子层计算和残差相加，再归一化：

$$
x_{l+1}=\operatorname{Norm}\left(x_l+F_l(x_l)\right)
$$

特点：

- 每一层的输出都会经过归一化；
- 原始 Transformer 使用这种结构；
- 网络较深时，梯度必须连续穿过归一化层，训练稳定性通常不如 Pre-Norm；
- 往往更依赖合适的参数初始化、学习率预热和其他稳定训练策略。

不能简单地认为 Post-Norm 的最终效果一定更好，或者 Pre-Norm 一定更差。两者的效果还取决于模型深度、优化器、初始化方式和训练配置。




