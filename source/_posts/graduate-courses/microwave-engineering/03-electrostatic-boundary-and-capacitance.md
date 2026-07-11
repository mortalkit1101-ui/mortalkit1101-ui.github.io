---
title: 03 静电边界条件与电容
date: 2026-07-04 21:44:23
updated: 2026-07-04 21:44:23
categories:
  - 研究生课程
  - 微波工程与电磁场
tags:
  - 微波工程
  - 电磁场
  - 静电场
permalink: courses/microwave-engineering/03-electrostatic-boundary-and-capacitance/
description: 静电边界条件、电容及相关计算。
---
> 主线：电场遇到导体和介质分界面时会受到约束；电容是几何结构和介质对电场分布的结果。

## 静电场基本方程

$$
\nabla\times\mathbf{E}=0
$$

$$
\nabla\cdot\mathbf{D}=\rho
$$

$$
\mathbf{D}=\varepsilon\mathbf{E}
$$

对应图像：

- $\nabla\times\mathbf{E}=0$：静电场是保守场，可以写成 $\mathbf{E}=-\nabla\varphi$。
- $\nabla\cdot\mathbf{D}=\rho$：自由电荷是电位移矢量的源。

## 介质分界面边界条件

电场分成切向和法向：

$$
\mathbf{E}=\mathbf{E}_t+\mathbf{E}_n
$$

切向条件：

$$
E_{1t}=E_{2t}
$$

或写成：

$$
\mathbf{n}\times(\mathbf{E}_2-\mathbf{E}_1)=0
$$

法向条件：

$$
D_{2n}-D_{1n}=\rho_s
$$

或写成：

$$
\mathbf{n}\cdot(\mathbf{D}_2-\mathbf{D}_1)=\rho_s
$$

无自由面电荷时：

$$
D_{1n}=D_{2n}
$$

若两侧介电常数不同：

$$
\varepsilon_1E_{1n}=\varepsilon_2E_{2n}
$$

记法：

- $E_t$ 连续。
- $D_n$ 的突变量等于自由面电荷密度。
- $D_n$ 连续不代表 $E_n$ 连续，因为 $D=\varepsilon E$。

## 导体边界条件

静电平衡时：

$$
\mathbf{E}_{\text{in}}=0
$$

导体内部和表面等势：

$$
\nabla\varphi=0
$$

导体表面电场无切向分量：

$$
E_t=0
$$

导体表面外侧电场只沿法向：

$$
D_{\text{out},n}=\rho_s
$$

真空或空气中：

$$
E_{\text{out},n}=\frac{\rho_s}{\varepsilon_0}
$$

## 电容

定义：

$$
C=\frac{Q}{U}
$$

电容不是“单纯存电荷”，而是一定电压下结构能容纳多少等量异号电荷。

### 平行板电容

板间近似均匀电场：

$$
E=\frac{U}{d}
$$

电荷面密度：

$$
\sigma=\varepsilon E
$$

总电荷：

$$
Q=\sigma S=\varepsilon ES
$$

因此：

$$
C=\frac{Q}{U}=\frac{\varepsilon S}{d}
$$

影响因素：

- $S$ 越大，电容越大。
- $d$ 越小，电容越大。
- $\varepsilon$ 越大，电容越大。

### 同轴线单位长度电容

内导体半径 $a$，外导体内半径 $b$：

$$
C'=\frac{2\pi\varepsilon}{\ln(b/a)}
$$

这个量后面直接进入传输线参数：

$$
Z_0=\sqrt{\frac{L'}{C'}}
$$

## 静电能量

电容储能：

$$
W_e=\frac12QU=\frac12CU^2=\frac{Q^2}{2C}
$$

场能密度：

$$
w_e=\frac12\mathbf{E}\cdot\mathbf{D}
$$

线性均匀介质中：

$$
w_e=\frac12\varepsilon E^2
$$

总电场能量：

$$
W_e=\int_V\frac12\varepsilon E^2\,dV
$$

关键图像：

> 电能不只是“在电容器元件里”，更准确地说是储存在电场所在空间里。

## 典型任务

| 题目类型 | 入口 |
| --- | --- |
| 导体表面外侧电场 | $E=\rho_s/\varepsilon$ |
| 介质分界面场关系 | 拆成 $E_t$ 与 $D_n$ |
| 求电容 | 假设 $U$，求 $\mathbf{E}$，再求 $Q$，最后 $C=Q/U$ |
| 求静电能量 | 用 $C,U,Q$ 公式或场能积分 |

## 连接

- 波导金属壁：切向电场为 0。
- 传输线：单位长度电容 $C'$ 来自横截面上的静电场。
- 谐振器：电场能量和磁场能量相互转换。

---

## 前后链接

---

**课程导航：** [上一篇：02 场、电位与高斯定律](/courses/microwave-engineering/02-field-and-potential/) · [返回微波工程与电磁场分类](/categories/%E7%A0%94%E7%A9%B6%E7%94%9F%E8%AF%BE%E7%A8%8B/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：04 恒定磁场与电感](/courses/microwave-engineering/04-static-magnetic-field-and-inductance/)
