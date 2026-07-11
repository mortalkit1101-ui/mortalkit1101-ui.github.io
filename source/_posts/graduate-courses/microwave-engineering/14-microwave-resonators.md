---
title: 14 微波谐振器
date: 2026-07-01 16:37:37
updated: 2026-07-01 16:37:37
permalink: courses/microwave-engineering/14-microwave-resonators/
description: 微波谐振器的参数与结构。
tags:
  - 微波工程
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/14-microwave-resonators.svg
---

> 主线：谐振器是在某些频率上强烈储存电磁能量的结构；Q 值描述储能和损耗的比例。

## 谐振的基本图像

电场能量和磁场能量周期性交换：

$$
W_e\leftrightarrow W_m
$$

在谐振频率附近，结构容易储存能量。

## Q 值

定义：

$$
Q=\omega_0\frac{\text{平均储存能量}}{\text{平均损耗功率}}
$$

频域近似：

$$
Q=\frac{f_0}{\Delta f}
$$

图像：

- Q 高：损耗小，选择性强，带宽窄。
- Q 低：损耗大，选择性弱，带宽宽。

## 串联谐振

串联 RLC：

$$
Z=R+j\omega L+\frac{1}{j\omega C}
$$

谐振条件：

$$
\omega_0=\frac{1}{\sqrt{LC}}
$$

谐振时阻抗最小。

## 并联谐振

并联 RLC 谐振时输入阻抗最大。

图像：

- 串联谐振像短路。
- 并联谐振像开路。

## 传输线谐振器

短路线：

$$
Z_{\mathrm{in}}=jZ_0\tan\beta l
$$

开路线：

$$
Z_{\mathrm{in}}=-jZ_0\cot\beta l
$$

常见长度：

- $\lambda/2$ 谐振器。
- $\lambda/4$ 谐振器。

## 波导腔

由封闭金属边界形成三维谐振结构。

特点：

- 模式离散。
- 谐振频率由几何尺寸和介质决定。
- 场分布由边界条件决定。

## 介质谐振器

用高介电常数介质约束场。

特点：

- 体积小。
- Q 值可较高。
- 常用于振荡器、滤波器。

## 耦合与外部 Q

谐振器必须通过探针、环、缝隙或传输线与外部电路交换能量。

耦合强弱影响：

- 外部 Q。
- 带宽。
- 插入损耗。
- 谐振峰形状。

## 连接

谐振器是滤波器、振荡器、腔体测量和频率选择结构的基础。后面滤波器可以看成多个谐振器按耦合规则连接。

---

## 前后链接

---

**课程导航：** [上一篇：13 阻抗匹配和调谐](/courses/microwave-engineering/13-impedance-matching/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：15 功分器与定向耦合器](/courses/microwave-engineering/15-power-dividers-and-couplers/)
