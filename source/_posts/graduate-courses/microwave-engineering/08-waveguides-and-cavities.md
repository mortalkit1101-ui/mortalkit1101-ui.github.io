---
title: 08 波导与谐振腔
date: 2026-07-01 16:37:37
updated: 2026-07-01 16:37:37
permalink: courses/microwave-engineering/08-waveguides-and-cavities/
description: 波导模式与谐振腔基础。
tags:
  - 电磁场
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/08-waveguides-and-cavities.svg
---

> 主线：传输线主要处理 TEM 传播；波导和腔体更强调边界条件形成的 TE/TM 模式与截止频率。

## TEM、TE、TM

| 模式 | 条件 |
| --- | --- |
| TEM | $E_z=0,\ H_z=0$ |
| TE | $E_z=0,\ H_z\neq0$ |
| TM | $E_z\neq0,\ H_z=0$ |

两导体传输线可以支持 TEM；空心金属波导不能支持 TEM，只能支持 TE/TM。

## 矩形波导

金属壁边界：

$$
E_t=0
$$

截止波数：

$$
k_c^2=\left(\frac{m\pi}{a}\right)^2+\left(\frac{n\pi}{b}\right)^2
$$

截止频率：

$$
f_c=\frac{1}{2\pi\sqrt{\mu\varepsilon}}k_c
$$

空气矩形波导常写为：

$$
f_{c,mn}=\frac{1}{2\sqrt{\mu\varepsilon}}
\sqrt{\left(\frac{m}{a}\right)^2+\left(\frac{n}{b}\right)^2}
$$

主模：

$$
TE_{10}
$$

因为 $TE_{10}$ 截止频率最低，最容易传播。

## 传播常数与导波波长

$$
\beta=\sqrt{k^2-k_c^2}
$$

传播条件：

$$
k>k_c
$$

导波波长：

$$
\lambda_g=\frac{2\pi}{\beta}
$$

相速度：

$$
v_p=\frac{\omega}{\beta}
$$

群速度：

$$
v_g=\frac{d\omega}{d\beta}
$$

## 波导阻抗

TE 模：

$$
Z_{TE}=\frac{\omega\mu}{\beta}
$$

TM 模：

$$
Z_{TM}=\frac{\beta}{\omega\varepsilon}
$$

## 谐振腔

波导两端封闭后，场在有限空间内形成驻波，就是谐振腔。

谐振条件：

> 三个方向上的边界条件同时满足，只允许某些离散频率存在。

能量在电场和磁场之间交换：

$$
W_e \leftrightarrow W_m
$$

## Q 值

定义图像：

$$
Q=\omega\frac{\text{储存能量}}{\text{每秒损耗能量}}
$$

Q 值越高：

- 损耗越小。
- 频率选择性越强。
- 带宽越窄。

近似关系：

$$
Q=\frac{f_0}{\Delta f}
$$

## 电磁场总图谱

| 内容 | 核心问题 |
| --- | --- |
| 静电场 | 电荷如何产生电场 |
| 恒定磁场 | 电流如何产生磁场 |
| 时变场 | 电场和磁场如何互相激发 |
| 平面波 | 电磁波如何在无限空间传播 |
| 传输线 | 电磁波如何沿导体结构传播 |
| 波导 | 边界条件如何筛选模式 |
| 谐振腔 | 场如何在有限空间储能 |

## 连接

- 波导是从传输线走向三维场结构的关键。
- 谐振腔是滤波器、振荡器、频率选择结构的基础。
- TE/TM 模式后面会反复出现在波导、微带、腔体和天线中。

---

## 前后链接

---

**课程导航：** [上一篇：07 均匀传输线](/courses/microwave-engineering/07-uniform-transmission-lines/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：09 微波电磁理论](/courses/microwave-engineering/09-microwave-electromagnetics/)
