---
title: 12 微波网络分析
date: 2026-07-01 16:37:37
updated: 2026-07-01 16:37:37
permalink: courses/microwave-engineering/12-microwave-network-analysis/
description: 散射参数与微波网络分析。
tags:
  - 微波工程
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/12-microwave-network-analysis.svg
---

> 主线：微波网络不用直接测电压电流，而用端口波变量描述反射、传输、匹配和隔离。

## 二端口网络

常见端口参数：

- Z 参数。
- Y 参数。
- S 参数。
- ABCD 参数。

每种参数都是同一个网络的不同描述方式。

## Z 参数

$$
V_1=Z_{11}I_1+Z_{12}I_2
$$

$$
V_2=Z_{21}I_1+Z_{22}I_2
$$

适合低频电路直观理解。

## Y 参数

$$
I_1=Y_{11}V_1+Y_{12}V_2
$$

$$
I_2=Y_{21}V_1+Y_{22}V_2
$$

适合并联网络。

## S 参数

S 参数描述入射波和反射波：

$$
b_1=S_{11}a_1+S_{12}a_2
$$

$$
b_2=S_{21}a_1+S_{22}a_2
$$

四个量的含义：

| 参数 | 含义 |
| --- | --- |
| $S_{11}$ | 输入端反射 |
| $S_{21}$ | 正向传输 |
| $S_{12}$ | 反向传输 |
| $S_{22}$ | 输出端反射 |

常用判断：

- $S_{11}$ 小：输入匹配好。
- $S_{21}$ 大：传输强，放大器中代表增益。
- $S_{12}$ 小：反向隔离好。
- $S_{22}$ 小：输出匹配好。

## 互易、无耗、匹配

互易网络：

$$
S_{ij}=S_{ji}
$$

二端口中：

$$
S_{12}=S_{21}
$$

无耗网络：

$$
[S]^*[S]=[I]
$$

匹配端口：

$$
S_{ii}=0
$$

## ABCD 参数

ABCD 参数适合级联：

$$
\begin{bmatrix}
V_1\\
I_1
\end{bmatrix}
=
\begin{bmatrix}
A&B\\
C&D
\end{bmatrix}
\begin{bmatrix}
V_2\\
-I_2
\end{bmatrix}
$$

多个网络级联时，ABCD 矩阵直接相乘。

## 信号流图

信号流图用于处理多次反射和多个端口之间的波关系。

核心对象仍然是：

$$
a_i,\quad b_i,\quad S_{ij}
$$

## 典型任务

| 任务 | 入口 |
| --- | --- |
| 看匹配 | $S_{11},S_{22}$ |
| 看传输 | $S_{21}$ |
| 看隔离 | $S_{12}$ |
| 看是否互易 | $S_{12}=S_{21}$ |
| 看是否无耗 | $[S]^*[S]=[I]$ |
| 分析级联 | ABCD 矩阵 |

## 连接

S 参数是微波测量和设计的核心语言。后面的匹配、功分器、耦合器、滤波器和放大器，都要用 S 参数描述性能。

---

## 前后链接

---

**课程导航：** [上一篇：11 传输线和波导](/courses/microwave-engineering/11-transmission-lines-and-waveguides/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：13 阻抗匹配和调谐](/courses/microwave-engineering/13-impedance-matching/)
