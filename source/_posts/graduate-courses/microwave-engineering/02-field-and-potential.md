---
title: 02 场、电位与高斯定律
date: 2026-07-04 21:44:21
updated: 2026-07-04 21:44:21
permalink: courses/microwave-engineering/02-field-and-potential/
description: 场、电位与高斯定律的基础关系。
tags:
  - 电磁场
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/02-field-and-potential.svg
---

> 主线：电荷产生电场，电场可以用电位描述；高斯定律用“穿过闭合面的通量”统计内部电荷。

## 场的基本概念

| 类型 | 含义 | 例子 |
| --- | --- | --- |
| 标量场 | 空间每一点对应一个数值 | 温度场、电位场 |
| 矢量场 | 空间每一点对应一个有大小和方向的矢量 | 电场 $\mathbf{E}$、磁场 $\mathbf{B}$ |

电磁场里最常见的三个场量：

- $\mathbf{E}$：电场强度，单位正电荷受到的力。
- $\mathbf{D}$：电位移矢量，用来描述自由电荷和介质中的电场关系。
- $\varphi$：电位，标量。

## $\nabla$ 算子

直角坐标系中：

$$
\nabla=\mathbf{a}_x\frac{\partial}{\partial x}
+\mathbf{a}_y\frac{\partial}{\partial y}
+\mathbf{a}_z\frac{\partial}{\partial z}
$$

| 运算 | 表达式 | 输入 | 输出 | 物理图像 |
| --- | --- | --- | --- | --- |
| 梯度 | $\nabla \varphi$ | 标量场 | 矢量场 | 变化最快的方向 |
| 散度 | $\nabla\cdot\mathbf{A}$ | 矢量场 | 标量场 | 是否有源或汇 |
| 旋度 | $\nabla\times\mathbf{A}$ | 矢量场 | 矢量场 | 是否有旋转趋势 |

## 电场与电位

核心关系：

$$
\mathbf{E}=-\nabla\varphi
$$

记法：

- 电位像高度。
- 电场像坡度。
- 负号表示电场指向电位下降最快的方向。

若导体静电平衡，内部电位处处相等：

$$
\nabla\varphi=0,\qquad \mathbf{E}=0
$$

## 库仑定律与点电荷电场

两点电荷作用力：

$$
\mathbf{F}
=\frac{1}{4\pi\varepsilon}
\frac{q_1q_2}{R^2}\mathbf{a}_R
$$

点电荷电场：

$$
\mathbf{E}
=\frac{1}{4\pi\varepsilon}
\frac{q}{R^2}\mathbf{a}_R
$$

点电荷电位：

$$
\varphi
=\frac{1}{4\pi\varepsilon}
\frac{q}{R}
$$

对比：

- 电位按 $1/R$ 衰减。
- 电场按 $1/R^2$ 衰减。
- 多个电荷时，电场按矢量叠加。

## 高斯定律

积分形式：

$$
\oint_S \mathbf{D}\cdot d\mathbf{S}=Q_{\mathrm{free}}
$$

真空或空气中：

$$
\mathbf{D}=\varepsilon_0\mathbf{E}
$$

均匀介质中常写成：

$$
\oint_S \mathbf{E}\cdot d\mathbf{S}=\frac{Q}{\varepsilon}
$$

物理图像：

> 闭合面里包住多少自由电荷，就有多少电通量从这个闭合面穿出去。

适合使用高斯定律的结构：

- 球对称：点电荷、带电球体。
- 柱对称：无限长线电荷、同轴线。
- 平面对称：无限大带电平面、平行板。

## 典型高斯面

### 点电荷

高斯面：半径 $r$ 的球面。

$$
E\cdot4\pi r^2=\frac{q}{\varepsilon}
$$

$$
E=\frac{q}{4\pi\varepsilon r^2}
$$

### 无限长线电荷

线电荷密度为 $\lambda$，高斯面取半径 $\rho$、长度 $l$ 的圆柱面。

$$
E\cdot2\pi\rho l=\frac{\lambda l}{\varepsilon}
$$

$$
E=\frac{\lambda}{2\pi\varepsilon\rho}
$$

### 无限大带电平面

面电荷密度为 $\rho_s$。

两侧都有场时：

$$
E=\frac{\rho_s}{2\varepsilon}
$$

导体表面外侧：

$$
E=\frac{\rho_s}{\varepsilon}
$$

## 连接

这一篇提供后面所有场问题的语言：

- 边界条件会用到 $\nabla\times\mathbf{E}=0$ 和 $\nabla\cdot\mathbf{D}=\rho$。
- 电容计算本质上还是先求 $\mathbf{E}$ 和 $\mathbf{D}$。
- 磁场部分会把“散度、旋度”的图像换到 $\mathbf{B}$ 和 $\mathbf{H}$ 上。

---

## 前后链接

---

**课程导航：** [上一篇：01 微波工程学习框架](/courses/microwave-engineering/01-learning-framework/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：03 静电边界条件与电容](/courses/microwave-engineering/03-electrostatic-boundary-and-capacitance/)
