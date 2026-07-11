---
title: 05 Maxwell 方程与时变场
date: 2026-07-04 16:03:30
updated: 2026-07-04 16:03:30
tags:
  - 微波工程
  - 电磁场
  - Maxwell方程
permalink: courses/microwave-engineering/05-maxwell-equations/
description: Maxwell 方程组与时变电磁场。
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/05-maxwell-equations.svg
---

> 主线：静态场只看电荷或电流；时变场里，变化的电场和变化的磁场会互相激发，形成电磁波。

## Maxwell 方程组

微分形式：

$$
\nabla\cdot\mathbf{D}=\rho
$$

$$
\nabla\cdot\mathbf{B}=0
$$

$$
\nabla\times\mathbf{E}=-\frac{\partial\mathbf{B}}{\partial t}
$$

$$
\nabla\times\mathbf{H}=\mathbf{J}+\frac{\partial\mathbf{D}}{\partial t}
$$

积分形式：

$$
\oint_S\mathbf{D}\cdot d\mathbf{S}=Q
$$

$$
\oint_S\mathbf{B}\cdot d\mathbf{S}=0
$$

$$
\oint_C\mathbf{E}\cdot d\mathbf{l}
=-\frac{d}{dt}\int_S\mathbf{B}\cdot d\mathbf{S}
$$

$$
\oint_C\mathbf{H}\cdot d\mathbf{l}
=I+\frac{d}{dt}\int_S\mathbf{D}\cdot d\mathbf{S}
$$

## 四条方程的物理图像

| 方程 | 图像 |
| --- | --- |
| $\nabla\cdot\mathbf{D}=\rho$ | 电荷是电场源 |
| $\nabla\cdot\mathbf{B}=0$ | 磁力线闭合 |
| $\nabla\times\mathbf{E}=-\partial\mathbf{B}/\partial t$ | 变化磁场产生旋涡电场 |
| $\nabla\times\mathbf{H}=\mathbf{J}+\partial\mathbf{D}/\partial t$ | 电流和变化电场产生磁场 |

## 位移电流

位移电流密度：

$$
\mathbf{J}_d=\frac{\partial\mathbf{D}}{\partial t}
$$

作用：

- 修正安培环路定律。
- 解释电容间隙中没有传导电流但仍能有磁场。
- 使电场变化也能产生磁场。

这一步是从电路走向电磁波的关键。

## 坡印亭矢量

定义：

$$
\mathbf{S}=\mathbf{E}\times\mathbf{H}
$$

单位：

$$
\mathrm{W/m^2}
$$

含义：

> 单位面积上电磁能量流动的功率密度。

方向由 $\mathbf{E}\times\mathbf{H}$ 决定，也就是电磁能量传播方向。

## 正弦时变场

用相量表示：

$$
\mathbf{E}(t)=\mathrm{Re}\{\tilde{\mathbf{E}}e^{j\omega t}\}
$$

时域微分可替换为：

$$
\frac{\partial}{\partial t}\rightarrow j\omega
$$

频域 Maxwell 方程：

$$
\nabla\times\tilde{\mathbf{E}}=-j\omega\tilde{\mathbf{B}}
$$

$$
\nabla\times\tilde{\mathbf{H}}=\tilde{\mathbf{J}}+j\omega\tilde{\mathbf{D}}
$$

## 介质中的本构关系

线性均匀各向同性介质：

$$
\mathbf{D}=\varepsilon\mathbf{E}
$$

$$
\mathbf{B}=\mu\mathbf{H}
$$

$$
\mathbf{J}=\sigma\mathbf{E}
$$

介质性质主要由 $\varepsilon,\mu,\sigma$ 决定。

## 连接

- 位移电流让电磁波可以在无自由电流空间中传播。
- 坡印亭矢量把“场”转换成“功率流”。
- 正弦相量是后面微波工程公式的默认语言。

---

## 前后链接

---

**课程导航：** [上一篇：04 恒定磁场与电感](/courses/microwave-engineering/04-static-magnetic-field-and-inductance/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：06 平面电磁波](/courses/microwave-engineering/06-plane-waves/)
