---
title: 02 Transformer算法
date: 2026-08-23 10:00:00
tags:
  - Transformer
categories:
  - 大模型 LLM
toc_number: false
mathjax: true
---

# 1. Transformer 整体架构

经典 Transformer 采用 Encoder–Decoder 架构。Encoder 负责理解输入序列，Decoder 则结合已经生成的内容与 Encoder 输出，逐个预测后续 Token。

整个模型的数据流可以概括为：

1. 输入 Token 先经过 Embedding，从离散 ID 转换为连续向量。
2. 位置编码为向量注入 Token 的先后顺序。
3. Encoder 使用多头自注意力提取输入序列的上下文表示。
4. Decoder 先通过带掩码的自注意力读取已生成内容，再通过交叉注意力读取 Encoder 输出。
5. Decoder 的结果经过线性层，得到目标词表中每个 Token 的预测分数。

![Transformer Encoder–Decoder 整体架构](/img/blog/llm/02-transformer/01-transformer-encoder-decoder-architecture.png)

后文统一使用以下符号：

| 符号 | 含义 |
|---|---|
| $B$ | Batch Size，批大小 |
| $S$ | 源序列长度，即 Encoder 的 Token 数量 |
| $T$ | 目标序列长度，即 Decoder 的 Token 数量 |
| $d_{\text{model}}$ | 每个 Token 的特征维度 |
| $h$ | 注意力头的数量 |
| $d_k$ | 每个注意力头中 Query 和 Key 的维度，通常 $d_k=d_{\text{model}}/h$ |
| $d_{ff}$ | 前馈神经网络的隐藏层维度 |
| $V$ | 词表大小 `vocab_size` |

完整模型的主要形状变化为：

$$
\text{src }[B,S]
\longrightarrow
\text{Encoder Output }[B,S,d_{\text{model}}]
$$

$$
\text{tgt }[B,T]
\longrightarrow
\text{Decoder Output }[B,T,d_{\text{model}}]
\longrightarrow
\text{logits }[B,T,V]
$$

# 2. 输入表示

## 2.1 Token Embedding

### 作用

神经网络不能直接处理 Token ID，因此首先需要用一个可训练的词嵌入矩阵，把每个离散 ID 映射为长度为 $d_{\text{model}}$ 的连续向量。

`nn.Embedding` 本质上是一次查表操作。若词表大小为 $V$，则词嵌入矩阵可以表示为：

$$
E\in\mathbb{R}^{V\times d_{\text{model}}}
$$

对于 Token 序列中的每个 ID，都从 $E$ 中取出对应的一行：

$$
X=E[\text{tokens}]
$$

原论文会将 Embedding 结果乘以 $\sqrt{d_{\text{model}}}$：

$$
X=\sqrt{d_{\text{model}}}\,E[\text{tokens}]
$$

这样可以放大 Embedding 的数值尺度，使其与后面加入的位置编码处于更合适的量级。

### 张量形状

$$
[B,T]\longrightarrow[B,T,d_{\text{model}}]
$$

其中，输入中的每一个 Token ID 都会变成一个 $d_{\text{model}}$ 维向量。

![Token ID 通过词嵌入矩阵转换为连续向量](/img/blog/llm/02-transformer/02-token-embedding-lookup.png)

### 代码实现

```python
class Embedding(nn.Module):

    def __init__(
        self,
        vocab_size: int,
        d_model: int
    ):
        super().__init__()
        self.d_model = d_model

        self.embedding = nn.Embedding(
            vocab_size,
            d_model
        )

    def forward(
        self,
        x: torch.Tensor
    ):
        output = self.embedding(x)
        output = output * math.sqrt(
            self.d_model
        )
        return output
```

## 2.2 Positional Encoding

### 作用

自注意力会同时比较序列中的所有 Token，本身并不知道谁在前、谁在后。因此需要把位置编码加到 Embedding 上，为每个 Token 注入顺序信息。

《Attention Is All You Need》使用固定的正余弦位置编码。对于位置 $pos$ 和特征维度索引 $i$：

$$
PE_{(pos,2i)}=
\sin\left(
\frac{pos}{10000^{2i/d_{\text{model}}}}
\right)
$$

$$
PE_{(pos,2i+1)}=
\cos\left(
\frac{pos}{10000^{2i/d_{\text{model}}}}
\right)
$$

- 偶数维使用正弦函数；
- 奇数维使用余弦函数；
- 不同维度对应不同频率，因此每个位置都会得到一组独特的编码。

最终输入为 Embedding 与位置编码逐元素相加：

$$
X_{\text{input}}=X_{\text{embedding}}+PE
$$

### 张量形状

提前创建的位置编码为：

$$
[\text{max\_len},d_{\text{model}}]
\longrightarrow
[1,\text{max\_len},d_{\text{model}}]
$$

实际前向传播时只取前 $T$ 个位置：

$$
[B,T,d_{\text{model}}]+[1,T,d_{\text{model}}]
\longrightarrow
[B,T,d_{\text{model}}]
$$

第一个维度会利用广播机制扩展到整个 Batch。

### 代码实现

```python
# 正余弦位置编码
class PositionEncoding(nn.Module):

    def __init__(
        self,
        d_model: int,
        max_len: int = 5000
    ):
        super().__init__()

        # 制作出位置表
        position = torch.arange(
            0,
            max_len,
            dtype=torch.float32
        )

        position = position.unsqueeze(1)

        dimension = torch.arange(
            0,
            d_model,
            2,
            dtype=torch.float32
        )

        # 计算值
        div_term = torch.exp(-(dimension / d_model) * math.log(10000))

        # 创建位置矩阵
        pe = torch.zeros(max_len, d_model)

        # 计算正弦（偶数）
        pe[:, 0::2] = torch.sin(position * div_term)

        # 计算余弦（奇数）
        pe[:, 1::2] = torch.cos(position * div_term)

        # 增加一个维度，从 [max_len,d_model] 变成 [1,max_len,d_model]，有利于与前面 Embedding 相加
        pe = pe.unsqueeze(0)

        # 保存 pe 参数，在后续不进行更新
        self.register_buffer("pe", pe)

    def forward(
        self,
        x: torch.Tensor
    ):
        # 计算当前 x 的 Token 个数
        seq_len = x.size(1)

        # 相加得到位置编码的输出
        x = x + self.pe[:, :seq_len, :]

        return x
```

# 3. 注意力机制

## 3.1 Query、Key 与 Value

### 作用

注意力机制通过 Query、Key 和 Value 三组向量完成信息检索：

- **Query（Q）**：当前 Token 想查找什么信息；
- **Key（K）**：每个 Token 能提供什么匹配特征；
- **Value（V）**：匹配完成后真正被汇总的内容。

输入 $X$ 通过三组独立的线性映射得到 Q、K、V：

$$
Q=XW^Q,\qquad K=XW^K,\qquad V=XW^V
$$

在自注意力中，Q、K、V 都来自同一个输入；在 Decoder 的交叉注意力中，它们会来自不同位置。

### 张量形状

在线性映射完成、多头拆分之前：

$$
Q,K,V\in\mathbb{R}^{B\times T\times d_{\text{model}}}
$$

拆分注意力头之后：

$$
Q,K,V\in\mathbb{R}^{B\times h\times T\times d_k}
$$

其中：

$$
d_k=\frac{d_{\text{model}}}{h}
$$

## 3.2 Scaled Dot-Product Attention

### 作用

缩放点积注意力先计算 Query 与所有 Key 的相似度，再通过 Softmax 得到注意力权重，最后对 Value 加权求和。

完整公式为：

$$
\operatorname{Attention}(Q,K,V)=
\operatorname{softmax}\left(
\frac{QK^\top}{\sqrt{d_k}}+M
\right)V
$$

其中 $M$ 表示可选的 Mask。

第一步，计算 Query 与 Key 的点积：

$$
\text{scores}=QK^\top
$$

点积越大，表示当前 Query 与对应 Key 越匹配。

![Query 与 Key 计算注意力分数](/img/blog/llm/02-transformer/03-query-key-attention-scores.png)

第二步，将分数除以 $\sqrt{d_k}$：

$$
\text{scaled scores}=\frac{QK^\top}{\sqrt{d_k}}
$$

当 $d_k$ 较大时，点积结果可能变得很大，使 Softmax 过于集中。缩放可以让数值保持在更稳定的范围。

第三步，通过 Softmax 把每一行分数转换为总和为 1 的权重：

$$
A=\operatorname{softmax}\left(
\frac{QK^\top}{\sqrt{d_k}}+M
\right)
$$

最后使用注意力权重 $A$ 对 Value 加权求和：

$$
O=AV
$$

![注意力权重对 Value 加权求和](/img/blog/llm/02-transformer/04-attention-weighted-value-sum.png)

### 张量形状

对于多头自注意力中的单次批量计算：

$$
Q:[B,h,T,d_k],\qquad K^\top:[B,h,d_k,T]
$$

$$
QK^\top:[B,h,T,T]
$$

$$
A:[B,h,T,T],\qquad V:[B,h,T,d_k]
$$

$$
AV:[B,h,T,d_k]
$$

![缩放点积注意力完整计算流程](/img/blog/llm/02-transformer/05-scaled-dot-product-attention-flow.png)

### 代码实现

```python
# 缩放点积注意力
class ScaledDotProductAttention(nn.Module):

    def __init__(self):
        super().__init__()

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: torch.Tensor | None = None
    ):
        # 计算 QK^T
        scores = torch.matmul(
            query,
            key.transpose(-1, -2)
        )

        # d_k 是 query/key 的最后一维
        d_k = query.size(-1)

        # 缩放点积
        scores = scores / math.sqrt(d_k)

        # 添加 mask
        if mask is not None:
            scores = scores.masked_fill(
                mask == 0,
                float("-inf")
            )

        # 计算 attention 权重
        weights = torch.softmax(
            scores,
            dim=-1
        )

        # Attention(Q,K,V)
        outputs = torch.matmul(
            weights,
            value
        )

        return outputs, weights
```

## 3.3 Multi-Head Attention

### 作用

单头注意力只在一个特征空间中建立 Token 之间的联系。多头注意力会把 $d_{\text{model}}$ 拆成 $h$ 个子空间，让不同注意力头并行学习不同关系。

每个头分别执行一次注意力：

$$
\operatorname{head}_i=
\operatorname{Attention}
\left(
QW_i^Q,
KW_i^K,
VW_i^V
\right)
$$

所有头的输出拼接后，再通过输出矩阵 $W^O$ 进行融合：

$$
\operatorname{MultiHead}(Q,K,V)=
\operatorname{Concat}
\left(
\operatorname{head}_1,\ldots,
\operatorname{head}_h
\right)W^O
$$

论文中使用 $d_{\text{model}}=512$、$h=8$，因此每个头的维度为：

$$
d_k=512/8=64
$$

### 张量形状

多头注意力的完整形状变化为：

$$
[B,T,d_{\text{model}}]
\longrightarrow
[B,T,h,d_k]
\longrightarrow
[B,h,T,d_k]
$$

每个头完成注意力计算后：

$$
[B,h,T,d_k]
\longrightarrow
[B,T,h,d_k]
\longrightarrow
[B,T,d_{\text{model}}]
$$


### 代码实现

```python
class MultiHeadAttention(nn.Module):

    def __init__(
        self,
        d_model: int,
        num_heads: int
    ):
        super().__init__()

        # 保存数据
        self.d_model = d_model
        self.num_heads = num_heads

        # 计算每个 head 的维度
        assert d_model % num_heads == 0
        self.d_k = d_model // num_heads

        # 准备三个线性层，映射为 qkv
        self.w_q = nn.Linear(d_model, d_model)
        self.w_k = nn.Linear(d_model, d_model)
        self.w_v = nn.Linear(d_model, d_model)

        # 缩放点积
        self.attention = ScaledDotProductAttention()

        # wo
        self.w_o = nn.Linear(d_model, d_model)

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: torch.Tensor | None = None,
    ):
        # 计算 qkv
        Q = self.w_q(query)
        K = self.w_k(key)
        V = self.w_v(value)

        # 目前 Q、K、V 形状均为 [B,T,d_model]，必须拆分为 [B,T,num_heads,d_k] 才能计算多头注意力
        batch_size = query.size(0)

        # 拆分 Q，当前 Q、K、V: [B,T,d_model]
        Q = Q.reshape(
            batch_size,
            query.size(1),
            self.num_heads,
            self.d_k
        )
        # [B,T,H,d_k] -> [B,H,T,d_k]
        Q = Q.transpose(1, 2)

        # 拆分 K，当前 Q、K、V: [B,T,d_model]
        K = K.reshape(
            batch_size,
            key.size(1),
            self.num_heads,
            self.d_k
        )
        # [B,T,H,d_k] -> [B,H,T,d_k]
        K = K.transpose(1, 2)

        # 拆分 V，当前 Q、K、V: [B,T,d_model]
        V = V.reshape(
            batch_size,
            value.size(1),
            self.num_heads,
            self.d_k
        )
        # [B,T,H,d_k] -> [B,H,T,d_k]
        V = V.transpose(1, 2)

        # 计算出注意力的输出和权重
        attention_outputs, attention_weights = self.attention(Q, K, V, mask)

        # concat，attention_outputs: [B,H,T,d_k]
        attention_outputs = attention_outputs.transpose(1, 2)
        # [B,T,H,d_k] -> [B,T,d_model]
        attention_outputs = attention_outputs.reshape(
            attention_outputs.size(0),
            attention_outputs.size(1),
            self.d_model
        )

        # 乘以 w_o
        outputs = self.w_o(attention_outputs)

        return outputs, attention_weights
```

# 4. Encoder

Encoder 的任务是把输入序列转换为带有完整上下文信息的表示。每一层 Encoder 都包含两个子层：Multi-Head Self-Attention 和 Position-wise Feed-Forward Network；每个子层之后都接残差连接与 LayerNorm。

## 4.1 Position-wise Feed-Forward Network

### 作用

自注意力负责在不同 Token 之间交换信息，前馈神经网络则对每个 Token 的特征进行进一步变换。它会独立地处理每个位置，但所有位置共享同一组参数。

论文中的 FFN 由两个线性层和一个 ReLU 激活函数组成：

$$
\operatorname{FFN}(x)=
\operatorname{ReLU}(xW_1+b_1)W_2+b_2
$$

第一层先把特征维度从 $d_{\text{model}}$ 扩展到 $d_{ff}$，第二层再映射回 $d_{\text{model}}$。论文使用 $d_{\text{model}}=512$、$d_{ff}=2048$。

### 张量形状

$$
[B,S,d_{\text{model}}]
\longrightarrow
[B,S,d_{ff}]
\longrightarrow
[B,S,d_{\text{model}}]
$$

序列长度 $S$ 不变，只有最后一个特征维度先扩大再恢复。

### 代码实现

```python
class PositionwiseFeedForward(nn.Module):

    def __init__(
        self,
        d_model: int,
        d_ff: int
    ):
        super().__init__()

        self.d_model = d_model
        self.d_ff = d_ff

        self.network = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model)
        )

    def forward(
        self,
        x: torch.Tensor
    ):
        return self.network(x)
```

## 4.2 Residual Connection 与 LayerNorm

### 作用

残差连接把子层输入 $x$ 直接加到子层输出上，使原始信息能够沿网络向后传递；LayerNorm 对每个 Token 的特征维度进行归一化，使深层网络中的数值更加稳定。

当前实现采用 Post-Norm 结构：

$$
y=\operatorname{LayerNorm}
\left(
x+\operatorname{Sublayer}(x)
\right)
$$

因为需要逐元素相加，所以 $x$ 和子层输出的形状必须相同。这也是多头注意力和 FFN 最终都要回到 $d_{\text{model}}$ 的原因。

### 张量形状

$$
x:[B,S,d_{\text{model}}]
$$

$$
\operatorname{Sublayer}(x):[B,S,d_{\text{model}}]
$$

$$
y:[B,S,d_{\text{model}}]
$$

### 代码实现

```python
class AddNorm(nn.Module):

    def __init__(
        self,
        d_model: int
    ):
        super().__init__()

        self.norm = nn.LayerNorm(d_model)

    def forward(
        self,
        x: torch.Tensor,
        sublayer_output: torch.Tensor
    ):
        # 残差连接
        x = x + sublayer_output

        # Layer Normalization
        x = self.norm(x)

        return x
```

## 4.3 Encoder Layer

### 作用

单层 Encoder 按以下顺序处理输入：

1. Multi-Head Self-Attention：Q、K、V 都来自当前输入 $x$；
2. Add & Norm：将注意力输出与原输入相加并归一化；
3. Feed Forward：逐位置变换每个 Token 的特征；
4. Add & Norm：再次执行残差连接与归一化。

可以写成：

$$
X'=\operatorname{LayerNorm}
\left(
X+\operatorname{MultiHead}(X,X,X)
\right)
$$

$$
Y=\operatorname{LayerNorm}
\left(
X'+\operatorname{FFN}(X')
\right)
$$

### 张量形状

整个 Encoder Layer 不改变张量的整体形状：

$$
[B,S,d_{\text{model}}]
\longrightarrow
[B,S,d_{\text{model}}]
$$

### 代码实现

```python
class EncoderLayer(nn.Module):

    def __init__(
        self,
        d_model: int,
        d_ff: int,
        num_heads: int
    ):
        super().__init__()

        self.d_model = d_model
        self.d_ff = d_ff
        self.num_heads = num_heads

        # Multi-Head Self-Attention
        self.multi = MultiHeadAttention(
            d_model=d_model,
            num_heads=num_heads
        )

        # 第一个 Add & Norm
        self.add_norm1 = AddNorm(
            d_model=d_model
        )

        # Feed Forward
        self.feedforward = PositionwiseFeedForward(
            d_model=d_model,
            d_ff=d_ff
        )

        # 第二个 Add & Norm
        self.add_norm2 = AddNorm(
            d_model=d_model
        )

    def forward(
        self,
        x: torch.Tensor,  # 不需要传入 qkv，因为自注意力的 qkv 等于 x
        mask: torch.Tensor | None = None
    ):
        # 1. Multi-Head Self-Attention
        attention_output, attention_weights = self.multi(
            x,
            x,
            x,
            mask
        )

        # 2. Add & Norm
        x = self.add_norm1(
            x,
            attention_output
        )

        # 3. Feed Forward
        feedforward_output = self.feedforward(
            x
        )

        # 4. Add & Norm
        x = self.add_norm2(
            x,
            feedforward_output
        )

        return x, attention_weights
```

## 4.4 Encoder 堆叠

### 作用

原论文将 6 个结构相同但参数相互独立的 Encoder Layer 依次堆叠。浅层先建立基础的 Token 关系，后续层在前一层表示的基础上继续提取更深的上下文信息。

使用 `nn.ModuleList` 可以让 PyTorch 正确注册每一层中的参数。若第 $l$ 层表示为 $\operatorname{EncoderLayer}^{(l)}$，则：

$$
X^{(l)}=
\operatorname{EncoderLayer}^{(l)}
\left(X^{(l-1)}\right),
\qquad l=1,2,\ldots,N
$$

### 张量形状

每一层的输入与输出形状一致，因此堆叠多层后仍然是：

$$
[B,S,d_{\text{model}}]
\longrightarrow
[B,S,d_{\text{model}}]
$$

### 代码实现

```python
class Encoder(nn.Module):

    def __init__(
        self,
        d_model: int,
        d_ff: int,
        num_heads: int,
        num_layers: int = 6
    ):
        super().__init__()

        self.layers = nn.ModuleList()

        for _ in range(num_layers):
            self.layers.append(
                EncoderLayer(
                    d_model=d_model,
                    d_ff=d_ff,
                    num_heads=num_heads
                )
            )

    def forward(
        self,
        x: torch.Tensor,
        mask: torch.Tensor | None = None
    ):
        for layer in self.layers:
            x, weights = layer(
                x,
                mask
            )

        return x
```

# 5. Decoder 与 Mask

Decoder 相比 Encoder 多了一次注意力计算：

- **Masked Self-Attention**：读取 Decoder 已经获得的目标序列信息，并通过因果掩码阻止当前位置看到未来 Token；
- **Cross-Attention**：使用 Decoder 状态作为 Query，使用 Encoder 输出作为 Key 和 Value，从源序列中检索生成当前 Token 所需要的信息。

## 5.1 Padding Mask

### 作用

同一个 Batch 中的句子长度通常不同，需要用 `<pad>` 补齐为相同长度。Padding Token 只是为了形成规则张量，不包含有效语义，因此不应该参与注意力计算。

代码先判断每个位置是否不等于 `pad_id`：

$$
M_{\text{pad}}(b,j)=
\begin{cases}
1,&\text{tokens}_{b,j}\ne\text{pad\_id}\\
0,&\text{tokens}_{b,j}=\text{pad\_id}
\end{cases}
$$

当 Mask 为 0 时，注意力分数会被替换为 $-\infty$。经过 Softmax 后，这些位置的权重变为 0。

### 张量形状

原始 Token 张量为：

$$
[B,S]
$$

连续增加两个维度后：

$$
[B,S]
\longrightarrow
[B,1,1,S]
$$

它可以广播到每个注意力头和每个 Query 位置，与 `[B,h,S,S]` 的 Encoder 注意力分数配合使用。


## 5.2 Causal Mask

### 作用

Decoder 在预测第 $i$ 个 Token 时，只能使用第 $i$ 个位置及其之前的信息，不能提前看到未来答案。因此需要创建一个下三角矩阵：

$$
C_{ij}=
\begin{cases}
1,&j\le i\\
0,&j>i
\end{cases}
$$

在注意力分数中，也可以把它写为加法 Mask：

$$
M_{ij}=
\begin{cases}
0,&j\le i\\
-\infty,&j>i
\end{cases}
$$

这样，未来位置在 Softmax 后的注意力权重就是 0。

### 张量形状

因果掩码的初始形状为：

$$
[T,T]
$$

目标序列的 Padding Mask 为：

$$
[B,1,1,T]
$$

两者结合后，可以广播为 Decoder 自注意力分数所需的：

$$
[B,h,T,T]
$$


### 代码实现

```python
def create_causal_mask(
    seq_len: int,
    device: None
):
    mask = torch.ones(
        seq_len,
        seq_len,
        device=device
    )

    # 只保留下三角矩阵
    mask = torch.tril(mask)

    return mask


def create_padding_mask(
    tokens: torch.Tensor,
    pad_id: int = 0
):
    mask = tokens != pad_id

    # [B,T] -> [B,1,1,T]
    mask = mask.unsqueeze(1).unsqueeze(2)

    return mask
```

## 5.3 Decoder Layer

### 作用

单层 Decoder 按以下顺序处理输入：

1. 带目标 Mask 的多头自注意力；
2. 第一次 Add & Norm；
3. 以 Decoder 状态为 Query、Encoder 输出为 Key 和 Value 的交叉注意力；
4. 第二次 Add & Norm；
5. Feed Forward；
6. 第三次 Add & Norm。

Masked Self-Attention 可以表示为：

$$
X'=\operatorname{LayerNorm}
\left(
X+\operatorname{MultiHead}(X,X,X,M_{\text{tgt}})
\right)
$$

Cross-Attention 可以表示为：

$$
X''=\operatorname{LayerNorm}
\left(
X'+\operatorname{MultiHead}
(X',H_{\text{enc}},H_{\text{enc}},M_{\text{src}})
\right)
$$

其中 $H_{\text{enc}}$ 是 Encoder 输出。

### 张量形状

Masked Self-Attention 中：

$$
Q,K,V:[B,h,T,d_k]
$$

$$
\text{Self-Attention Scores}:[B,h,T,T]
$$

Cross-Attention 中，Query 和 Key/Value 的序列长度不同：

$$
Q:[B,h,T,d_k]
$$

$$
K,V:[B,h,S,d_k]
$$

因此交叉注意力分数为：

$$
QK^\top:[B,h,T,S]
$$

最终 Decoder Layer 的输出仍为：

$$
[B,T,d_{\text{model}}]
$$

### 代码实现

```python
class DecoderLayer(nn.Module):

    def __init__(
        self,
        d_model: int,
        d_ff: int,
        num_heads: int,
    ):
        super().__init__()

        self.d_model = d_model
        self.d_ff = d_ff
        self.num_heads = num_heads

        # 带掩码的自注意力
        self.masked_multiattention = MultiHeadAttention(
            d_model=d_model,
            num_heads=num_heads
        )

        # add_norm1
        self.add_norm1 = AddNorm(d_model=d_model)

        # 不带掩码的自注意力
        self.multiattention = MultiHeadAttention(
            d_model=d_model,
            num_heads=num_heads
        )

        # add_norm2
        self.add_norm2 = AddNorm(d_model=d_model)

        # feedforward
        self.FeedForward = PositionwiseFeedForward(
            d_model=d_model,
            d_ff=d_ff
        )

        # add_norm3
        self.add_norm3 = AddNorm(d_model=d_model)

    def forward(
        self,
        x: torch.Tensor,
        encoder_output: torch.Tensor,
        tgt_mask: torch.Tensor | None = None,
        src_mask: torch.Tensor | None = None
    ):
        # 带掩码的自注意力机制
        masked_attention_outputs, masked_attention_weights = self.masked_multiattention(
            x,
            x,
            x,
            tgt_mask
        )

        # add_norm1
        addnorm1 = self.add_norm1(x, masked_attention_outputs)

        # 不带掩码的自注意力机制
        attention_outputs, attention_weights = self.multiattention(
            addnorm1,
            encoder_output,
            encoder_output,
            src_mask
        )

        # add_norm2
        addnorm2 = self.add_norm2(addnorm1, attention_outputs)

        # feedforward
        feedforward = self.FeedForward(addnorm2)

        # add_norm3
        addnorm3 = self.add_norm3(addnorm2, feedforward)

        return addnorm3, masked_attention_weights, attention_weights
```

## 5.4 Decoder 堆叠

### 作用

与 Encoder 相同，原论文也使用 6 层 Decoder Layer。每一层都会先更新目标序列内部的信息，再从 Encoder 输出中读取源序列信息。

若第 $l$ 层表示为 $\operatorname{DecoderLayer}^{(l)}$，则：

$$
Y^{(l)}=
\operatorname{DecoderLayer}^{(l)}
\left(Y^{(l-1)},H_{\text{enc}}\right),
\qquad l=1,2,\ldots,N
$$

### 张量形状

每层 Decoder 的输入和输出均保持：

$$
[B,T,d_{\text{model}}]
$$

Encoder 输出在每一层中保持：

$$
[B,S,d_{\text{model}}]
$$

### 代码实现

```python
class Decoder(nn.Module):

    def __init__(
        self,
        d_model: int,
        d_ff: int,
        num_heads: int,
        num_layers: int = 6
    ):
        super().__init__()

        self.d_model = d_model
        self.d_ff = d_ff
        self.num_heads = num_heads

        self.layers = nn.ModuleList()

        for lay in range(num_layers):
            self.layers.append(
                DecoderLayer(
                    d_model=d_model,
                    d_ff=d_ff,
                    num_heads=num_heads
                )
            )

    def forward(
        self,
        x: torch.Tensor,
        encoder_output: torch.Tensor,
        tgt_mask: torch.Tensor | None = None,
        src_mask: torch.Tensor | None = None
    ):
        for layer in self.layers:
            outputs, masked_attention_weights, attention_weights = layer(
                x,
                encoder_output,
                tgt_mask,
                src_mask
            )

        return outputs
```

# 6. 完整 Transformer

## 6.1 作用

完整模型把前面的所有模块按数据流连接起来：

1. 根据 `src` 创建 Encoder Padding Mask；
2. 根据 `tgt` 创建 Decoder Padding Mask 和 Causal Mask，并将二者组合；
3. 源序列经过独立的 Embedding 与位置编码后进入 Encoder；
4. 目标序列经过独立的 Embedding 与位置编码后进入 Decoder；
5. Decoder 同时接收目标表示、Encoder 输出和两种 Mask；
6. 线性层将每个 Decoder 隐状态投影到目标词表。

源序列与目标序列分别使用 Embedding，是因为它们在完整翻译任务中可能对应不同词表或不同参数空间。位置编码不包含可训练参数，因此可以复用同一个模块。

最后的词表投影公式为：

$$
\text{logits}=
H_{\text{decoder}}W_{\text{vocab}}+b_{\text{vocab}}
$$

其中：

$$
W_{\text{vocab}}
\in
\mathbb{R}^{d_{\text{model}}\times V}
$$

`logits` 表示每个目标位置对词表中每个 Token 的未归一化分数。

## 6.2 张量形状

$$
[B,T,d_{\text{model}}]
\longrightarrow
[B,T,V]
$$

## 6.3 代码实现

```python
class Transformer(nn.Module):

    def __init__(
        self,
        vocab_size: int,
        d_model: int,
        d_ff: int,
        num_heads: int
    ):
        super().__init__()

        self.d_model = d_model

        # Encoder Embedding
        self.src_embedding = Embedding(
            vocab_size=vocab_size,
            d_model=d_model
        )

        # Decoder Embedding
        self.tgt_embedding = Embedding(
            vocab_size=vocab_size,
            d_model=d_model
        )

        # 位置编码
        self.position_encoding = PositionEncoding(
            d_model=d_model
        )

        # Encoder
        self.encoder = Encoder(
            d_model=d_model,
            d_ff=d_ff,
            num_heads=num_heads
        )

        # Decoder
        self.decoder = Decoder(
            d_model=d_model,
            d_ff=d_ff,
            num_heads=num_heads
        )

        # Linear
        self.linear = nn.Linear(
            d_model,
            vocab_size
        )

    def forward(
        self,
        src: torch.Tensor,
        tgt: torch.Tensor,
        pad_id: int = 0
    ):
        # 1. 创建 mask
        src_mask = create_padding_mask(
            src,
            pad_id
        )

        tgt_padding_mask = create_padding_mask(
            tgt,
            pad_id
        )

        tgt_causal_mask = create_causal_mask(
            tgt.size(1),
            tgt.device
        )

        # causal + padding
        tgt_mask = (
            tgt_padding_mask
            &
            tgt_causal_mask.bool()
        )

        # 2. Encoder 输入
        src_x = self.src_embedding(src)

        src_x = self.position_encoding(
            src_x
        )

        # 3. Encoder
        encoder_output = self.encoder(
            src_x,
            src_mask
        )

        # 4. Decoder 输入
        tgt_x = self.tgt_embedding(tgt)

        tgt_x = self.position_encoding(
            tgt_x
        )

        # 5. Decoder
        decoder_output = self.decoder(
            tgt_x,
            encoder_output,
            tgt_mask,
            src_mask
        )

        # 6. Linear
        logits = self.linear(
            decoder_output
        )

        return logits
```

# 7. 张量形状汇总

下面将完整 Transformer 中最重要的张量集中整理。

| 张量                    | 形状              | 含义                                    |
| --------------------- | --------------- | ------------------------------------- |
| `src`                 | `[B,S]`         | Encoder 输入的 Token ID                  |
| `tgt`                 | `[B,T]`         | Decoder 输入的 Token ID                  |
| `src_x`               | `[B,S,d_model]` | 源序列的 Embedding 与位置编码之和                |
| `tgt_x`               | `[B,T,d_model]` | 目标序列的 Embedding 与位置编码之和               |
| Encoder 单头 `Q/K/V`    | `[B,h,S,d_k]`   | Encoder 自注意力的查询、键和值                   |
| Encoder 注意力分数         | `[B,h,S,S]`     | 每个源 Token 对所有源 Token 的关注程度            |
| `encoder_output`      | `[B,S,d_model]` | Encoder 最后一层输出                        |
| Decoder 单头 `Q/K/V`    | `[B,h,T,d_k]`   | Decoder Masked Self-Attention 的查询、键和值 |
| Decoder 自注意力分数        | `[B,h,T,T]`     | 每个目标 Token 对目标序列已有位置的关注程度             |
| Cross-Attention `Q`   | `[B,h,T,d_k]`   | 来自 Decoder 的查询                        |
| Cross-Attention `K/V` | `[B,h,S,d_k]`   | 来自 Encoder 输出的键和值                     |
| Cross-Attention 分数    | `[B,h,T,S]`     | 每个目标 Token 对所有源 Token 的关注程度           |
| `decoder_output`      | `[B,T,d_model]` | Decoder 最后一层输出                        |
| `logits`              | `[B,T,V]`       | 每个目标位置对词表中所有 Token 的未归一化分数            |

Transformer 的核心可以总结为：Embedding 把 Token 变成向量，位置编码加入顺序，多头注意力完成 Token 之间的信息交换，FFN 继续变换每个位置的特征，Encoder 提取源序列表示，Decoder 在 Mask 约束下结合源序列逐步生成目标序列。
