---
title: 04 恒定磁场与电感
date: 2026-07-04 16:03:29
updated: 2026-07-04 16:03:29
tags:
  - 微波工程
  - 电磁场
  - 磁场
permalink: courses/microwave-engineering/04-static-magnetic-field-and-inductance/
description: 恒定磁场与电感的核心概念。
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/04-static-magnetic-field-and-inductance.svg
---

> 主线：恒定电流产生恒定磁场；磁场形成磁通和磁链，由此定义电感；磁能储存在磁场中。

## 基本场量

$$
\mathbf{B}=\mu\mathbf{H}
$$

| 量 | 含义 | 单位 |
| --- | --- | --- |
| $\mathbf{B}$ | 磁感应强度，实际磁通密度 | T |
| $\mathbf{H}$ | 磁场强度，更偏向电流激发的场 | A/m |
| $\mu$ | 磁导率 | H/m |

介质中：

$$
\mu=\mu_0\mu_r
$$

## 安培环路定律

积分形式：

$$
\oint\mathbf{H}\cdot d\mathbf{l}=I
$$

微分形式：

$$
\nabla\times\mathbf{H}=\mathbf{J}
$$

图像：

> 电流产生环绕它的磁场。

与静电场对照：

$$
\nabla\cdot\mathbf{D}=\rho
$$

$$
\nabla\times\mathbf{H}=\mathbf{J}
$$

电荷让电场发散，电流让磁场旋转。

## 典型磁场

### 无限长直导线

取半径 $r$ 的圆形安培环路：

$$
H\cdot2\pi r=I
$$

$$
H=\frac{I}{2\pi r}
$$

$$
B=\frac{\mu I}{2\pi r}
$$

方向：右手大拇指指向电流，四指弯曲方向为磁场方向。

### 长螺线管

单位长度匝数为 $n$：

$$
H=nI
$$

$$
B=\mu nI
$$

## 磁通连续性

$$
\nabla\cdot\mathbf{B}=0
$$

积分形式：

$$
\oint_S\mathbf{B}\cdot d\mathbf{S}=0
$$

图像：

> 磁力线没有起点和终点，只能闭合。

## 磁场边界条件

法向：

$$
B_{1n}=B_{2n}
$$

切向：

$$
H_{2t}-H_{1t}=K_s
$$

矢量式：

$$
\mathbf{n}\times(\mathbf{H}_2-\mathbf{H}_1)=\mathbf{K}_s
$$

无表面电流时：

$$
H_{1t}=H_{2t}
$$

边界条件对照：

| 静电场 | 恒定磁场 |
| --- | --- |
| $E_t$ 连续 | $B_n$ 连续 |
| $D_n$ 由自由面电荷决定 | $H_t$ 由表面电流决定 |

## 磁矢位

因为：

$$
\nabla\cdot\mathbf{B}=0
$$

所以可以令：

$$
\mathbf{B}=\nabla\times\mathbf{A}
$$

对照：

| 场 | 位函数 |
| --- | --- |
| 静电场 | $\mathbf{E}=-\nabla\varphi$ |
| 恒定磁场 | $\mathbf{B}=\nabla\times\mathbf{A}$ |

## 电感

定义：

$$
L=\frac{\Psi}{I}
$$

磁链：

$$
\Psi=N\Phi
$$

所以：

$$
L=\frac{N\Phi}{I}
$$

电感描述的是：电流建立磁链的能力。

## 磁场能量

电感储能：

$$
W_m=\frac12LI^2
$$

磁场能量密度：

$$
w_m=\frac12\mathbf{B}\cdot\mathbf{H}
$$

线性均匀介质中：

$$
w_m=\frac12\mu H^2
$$

总磁能：

$$
W_m=\int_V\frac12\mu H^2\,dV
$$

## 电容与电感对照

| 项目 | 电容 | 电感 |
| --- | --- | --- |
| 来源 | 电荷产生电场 | 电流产生磁场 |
| 定义 | $C=Q/U$ | $L=\Psi/I$ |
| 储能 | $W_e=\frac12CU^2$ | $W_m=\frac12LI^2$ |
| 分布参数 | $C'$ | $L'$ |

## 连接

传输线里最重要的两个分布参数：

$$
Z_0=\sqrt{\frac{L'}{C'}}
$$

$$
v=\frac{1}{\sqrt{L'C'}}
$$

---

## 前后链接

---

**课程导航：** [上一篇：03 静电边界条件与电容](/courses/microwave-engineering/03-electrostatic-boundary-and-capacitance/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：05 Maxwell 方程与时变场](/courses/microwave-engineering/05-maxwell-equations/)
