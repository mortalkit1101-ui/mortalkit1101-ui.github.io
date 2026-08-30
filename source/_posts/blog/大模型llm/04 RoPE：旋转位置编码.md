---
title: 04 RoPE：旋转位置编码
date: 2026-08-25 10:00:00
tags:
  - RoPE
categories:
  - 大模型 LLM
toc_number: false
mathjax: true
published: true
---

RoPE（Rotary Position Embedding，旋转位置编码）的核心思想是：**根据 Token 的位置旋转 Query 和 Key，使注意力分数自然包含相对位置信息。**

# 1. 为什么需要位置编码

自注意力本身不关心 Token 的先后顺序。如果不额外加入位置信息，交换两个 Token 的位置并不会改变模型处理它们的方式。

经典 Transformer 使用加法式绝对位置编码：

$$
X_m=x_m+p_m
$$

其中，$x_m$ 是位置 $m$ 的 Token 表示，$p_m$ 是该位置对应的位置编码。随后再通过线性映射得到 Query 和 Key：

$$
q_m=W_qX_m,\qquad k_m=W_kX_m
$$

这种方式简单有效，但语义信息与位置信息会直接混合在同一个向量中；模型若要判断两个 Token 的相对距离，还需要从绝对位置表示中进一步学习。

RoPE 采用另一种思路：不把位置向量直接加到输入上，而是对线性投影后的 Query 和 Key 进行旋转。

| 方法 | 注入位置 | 主要特点 |
|---|---|---|
| 加法式位置编码 | Token 表示 | 直接加入绝对位置信息 |
| RoPE | Query 和 Key | 在注意力点积中显式体现相对位置 |

# 2. 从二维旋转理解 RoPE

二维旋转矩阵为：

$$
R(\alpha)=
\begin{pmatrix}
\cos\alpha & -\sin\alpha \\\\
\sin\alpha & \cos\alpha
\end{pmatrix}
$$

将二维向量 $x$ 乘以 $R(\alpha)$，相当于把它逆时针旋转 $\alpha$，但不会改变向量的模长：

$$
\left\|R(\alpha)x\right\|_2=\|x\|_2
$$

假设每向后移动一个位置，向量就多旋转 $\theta$。那么位置 $m$ 的 Query 和位置 $n$ 的 Key 分别旋转为：

$$
\widetilde q_m=R(m\theta)q_m,\qquad
\widetilde k_n=R(n\theta)k_n
$$

这里的旋转只改变方向，不改变 Query 和 Key 原本的模长。

# 3. 为什么能表示相对位置

旋转矩阵具有两个重要性质：

$$
R(\alpha)^\top=R(-\alpha)
$$

$$
R(\alpha)R(\beta)=R(\alpha+\beta)
$$

因此，旋转后的 Query 和 Key 进行点积时：

$$
\begin{aligned}
\widetilde q_m^\top\widetilde k_n
&=\left(R(m\theta)q_m\right)^\top
  \left(R(n\theta)k_n\right) \\\\
&=q_m^\top R(m\theta)^\top R(n\theta)k_n \\\\
&=q_m^\top R(-m\theta)R(n\theta)k_n \\\\
&=q_m^\top R((n-m)\theta)k_n
\end{aligned}
$$

最终的旋转项只与位置差 $n-m$ 有关，而不分别依赖绝对位置 $m$ 和 $n$。这正是 RoPE 能把相对位置信息注入注意力分数的原因。

需要注意的是，注意力分数仍然同时取决于 $q_m$ 和 $k_n$ 的语义内容；RoPE 只是让其中的位置部分以相对距离的形式出现。

# 4. 推广到多维向量

实际模型中，每个注意力头的维度通常远大于 2。对于偶数维向量：

$$
x=(x_0,x_1,x_2,x_3,\ldots,x_{d-2},x_{d-1})
$$

可以将相邻维度两两分组：

$$
(x_0,x_1),\ (x_2,x_3),\ \ldots,\ (x_{d-2},x_{d-1})
$$

每一组都使用二维旋转矩阵，但采用不同的角频率：

$$
\theta_i=10000^{-2i/d},\qquad
i=0,1,\ldots,\frac d2-1
$$

位置 $m$ 在第 $i$ 组维度上的旋转角为：

$$
\phi_{m,i}=m\theta_i
$$

因此，多维旋转矩阵可以简洁地写成分块对角矩阵：

$$
R_m=
\operatorname{diag}\left(
R(\phi_{m,0}),
R(\phi_{m,1}),
\ldots,
R(\phi_{m,d/2-1})
\right)
$$

**较大的频率变化更快，适合区分相近位置；较小的频率变化更慢**，可以描述更长距离的位置关系。单一频率可能出现周期重复，但多组不同频率共同作用后，每个位置会得到更丰富的旋转模式。

# 5. PyTorch 实现

对于一组二维向量：

$$
R(\phi)
\begin{pmatrix}
x_{2i} \\\\
x_{2i+1}
\end{pmatrix}
{}={}
\begin{pmatrix}
x_{2i}\cos\phi-x_{2i+1}\sin\phi \\\\
x_{2i}\sin\phi+x_{2i+1}\cos\phi
\end{pmatrix}
$$

下面的实现假设 Query 和 Key 的形状均为 `[B,H,T,D]`：

- `B`：Batch Size；
- `H`：注意力头数；
- `T`：序列长度；
- `D`：每个注意力头的维度，且必须是偶数。

```python
import torch


def apply_rope(
    q: torch.Tensor,
    k: torch.Tensor,
    base: float = 10000.0
):
    """对形状为 [B,H,T,D] 的 Query 和 Key 应用 RoPE。"""
    assert q.shape == k.shape

    dim = q.size(-1)
    seq_len = q.size(-2)
    assert dim % 2 == 0

    # 每一组二维向量使用不同的旋转频率
    inv_freq = 1.0 / (
        base ** (
            torch.arange(
                0,
                dim,
                2,
                device=q.device,
                dtype=q.dtype
            ) / dim
        )
    )

    # angles[t,i] = t * theta_i，形状为 [T,D/2]
    positions = torch.arange(
        seq_len,
        device=q.device,
        dtype=q.dtype
    )
    angles = positions[:, None] * inv_freq[None, :]

    # 增加 Batch 和 Head 维度，以便广播
    cos = angles.cos()[None, None, :, :]
    sin = angles.sin()[None, None, :, :]

    def rotate(x: torch.Tensor):
        x_even = x[..., 0::2]
        x_odd = x[..., 1::2]

        output = torch.empty_like(x)
        output[..., 0::2] = x_even * cos - x_odd * sin
        output[..., 1::2] = x_even * sin + x_odd * cos
        return output

    return rotate(q), rotate(k)
```

RoPE 一般放在线性投影和多头拆分之后、计算注意力分数之前：

```python
q, k = apply_rope(q, k)
scores = torch.matmul(q, k.transpose(-1, -2))
scores = scores / (q.size(-1) ** 0.5)
```

Value 不需要旋转，因为位置信息是通过 Query 与 Key 的点积进入注意力权重的。

# 6. 总结

RoPE 可以概括为三点：

1. 将注意力头中的维度两两分组，并把每组视为一个二维向量；
2. 根据 Token 位置和该组频率，对 Query、Key 旋转不同角度；
3. 利用旋转矩阵的性质，让注意力点积中的位置项只依赖相对距离 $n-m$。

它既保留了 Query 和 Key 的模长，又能自然地把相对位置信息融入注意力计算，因此被广泛应用在现代大语言模型中。
