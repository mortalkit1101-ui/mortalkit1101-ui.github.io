---
title: 06 平面电磁波
date: 2026-07-04 21:44:12
updated: 2026-07-04 21:44:12
tags:
  - 微波工程
  - 电磁场
  - 电磁波
permalink: courses/microwave-engineering/06-plane-waves/
description: 平面电磁波的传播与基本参数。
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/06-plane-waves.svg
---

> 主线：时变电场和时变磁场互相激发，形成向前传播的电磁波；平面波是最基本的波模型。

## 波动方程

在无源、均匀、无耗介质中：

$$
\nabla^2\mathbf{E}-\mu\varepsilon\frac{\partial^2\mathbf{E}}{\partial t^2}=0
$$

$$
\nabla^2\mathbf{H}-\mu\varepsilon\frac{\partial^2\mathbf{H}}{\partial t^2}=0
$$

波速：

$$
v=\frac{1}{\sqrt{\mu\varepsilon}}
$$

真空中：

$$
c=\frac{1}{\sqrt{\mu_0\varepsilon_0}}
$$

## 均匀平面波

沿 $+z$ 方向传播的形式：

$$
\mathbf{E}(z)=\mathbf{E}_0e^{-j\beta z}
$$

$$
\mathbf{H}(z)=\mathbf{H}_0e^{-j\beta z}
$$

相位常数：

$$
\beta=\omega\sqrt{\mu\varepsilon}
$$

波长：

$$
\lambda=\frac{2\pi}{\beta}
$$

三者方向：

$$
\mathbf{E}\perp\mathbf{H}\perp\mathbf{k}
$$

## 波阻抗

无耗介质中：

$$
\eta=\sqrt{\frac{\mu}{\varepsilon}}
$$

场量关系：

$$
\frac{E}{H}=\eta
$$

真空中：

$$
\eta_0\approx377\ \Omega
$$

## 极化

极化描述电场矢量端点随时间的运动方式。

| 类型 | 图像 |
| --- | --- |
| 线极化 | 电场方向固定 |
| 圆极化 | 电场端点画圆 |
| 椭圆极化 | 电场端点画椭圆 |

极化在天线、雷达、通信链路中很重要。

## 有耗介质

传播常数：

$$
\gamma=\alpha+j\beta
$$

其中：

- $\alpha$：衰减常数。
- $\beta$：相位常数。

场随传播方向变化：

$$
e^{-\gamma z}=e^{-\alpha z}e^{-j\beta z}
$$

有耗介质中，波一边传播一边衰减。

## 反射和透射

法向入射时，反射系数：

$$
\Gamma=\frac{\eta_2-\eta_1}{\eta_2+\eta_1}
$$

透射系数：

$$
T=\frac{2\eta_2}{\eta_2+\eta_1}
$$

图像：

- 两侧波阻抗相等，反射为 0。
- 波阻抗差异越大，反射越强。

## 驻波

入射波和反射波叠加：

$$
\mathbf{E}=\mathbf{E}^++\mathbf{E}^-
$$

完全反射时形成明显驻波。

驻波比：

$$
VSWR=\frac{1+|\Gamma|}{1-|\Gamma|}
$$

## 连接

- 平面波反射为传输线反射提供物理图像。
- 波阻抗 $\eta$ 类似传输线特性阻抗 $Z_0$。
- 驻波概念会直接进入传输线和 Smith 圆图。

---

## 前后链接

---

**课程导航：** [上一篇：05 Maxwell 方程与时变场](/courses/microwave-engineering/05-maxwell-equations/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：07 均匀传输线](/courses/microwave-engineering/07-uniform-transmission-lines/)
