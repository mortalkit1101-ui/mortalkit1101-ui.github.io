---
title: 15 功分器与定向耦合器
date: 2026-07-01 16:37:37
updated: 2026-07-01 16:37:37
permalink: courses/microwave-engineering/15-power-dividers-and-couplers/
description: 功分器与定向耦合器基础。
tags:
  - 微波工程
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/15-power-dividers-and-couplers.svg
---

> 主线：功分器负责把功率分配到多个端口；耦合器负责按方向取出一部分功率。

## 三端口网络的限制

理想三端口若同时满足：

- 无耗。
- 互易。
- 所有端口匹配。

通常无法同时做到完全隔离。

Wilkinson 功分器通过隔离电阻解决输出端隔离问题。

## Wilkinson 功分器

等分功分器典型结构：

- 两段 $\lambda/4$ 传输线。
- 一个隔离电阻。

等分时：

$$
Z_{\lambda/4}=\sqrt{2}Z_0
$$

隔离电阻：

$$
R=2Z_0
$$

特性：

- 输入端匹配。
- 输出端匹配。
- 两输出端隔离。
- 理想情况下无耗功分；隔离电阻只在不平衡时耗能。

## 定向耦合器

四端口：

- 输入端。
- 直通端。
- 耦合端。
- 隔离端。

核心指标：

耦合度：

$$
C=-20\log\left|\frac{V_{\text{coupled}}}{V_{\text{in}}}\right|
$$

方向性：

$$
D=20\log\left|\frac{V_{\text{coupled}}}{V_{\text{isolated}}}\right|
$$

隔离度：

$$
I=-20\log\left|\frac{V_{\text{isolated}}}{V_{\text{in}}}\right|
$$

## 90 度混合网络

又叫 branch-line hybrid。

特点：

- 两个输出端幅度相等。
- 相位差 $90^\circ$。

用途：

- 平衡放大器。
- IQ 网络。
- 功率合成与分配。

## 180 度混合网络

常见形式：

- Rat-race hybrid。
- Magic-T。

特点：

- 可得到同相或反相信号。
- 用于平衡混频、功率合成、差分网络。

## 耦合线

由两根相邻传输线通过电磁耦合传递能量。

分析常用：

- 偶模。
- 奇模。

耦合强弱由线间距、线宽、介质和长度决定。

## 连接

功分器和耦合器是阵列馈电、测量反馈、功率监测和平衡电路的基础。相控阵和微波系统里会大量使用这些结构。

---

## 前后链接

---

**课程导航：** [上一篇：14 微波谐振器](/courses/microwave-engineering/14-microwave-resonators/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：16 微波滤波器](/courses/microwave-engineering/16-microwave-filters/)
