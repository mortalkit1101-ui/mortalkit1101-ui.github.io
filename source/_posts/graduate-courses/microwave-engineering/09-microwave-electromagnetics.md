---
title: 09 微波电磁理论
date: 2026-07-01 16:37:37
updated: 2026-07-01 16:37:37
categories:
  - 研究生课程
  - 微波工程与电磁场
tags:
  - 微波工程
  - 电磁场
  - 微波理论
permalink: courses/microwave-engineering/09-microwave-electromagnetics/
description: 微波频段中的电磁理论基础。
---
> 主线：Pozar 第 1 章把 Maxwell 方程、边界条件、平面波、功率流和反射透射整理成微波工程的底层语言。

## 核心对象

- Maxwell 方程组。
- 本构关系：$\mathbf{D}=\varepsilon\mathbf{E}$，$\mathbf{B}=\mu\mathbf{H}$，$\mathbf{J}=\sigma\mathbf{E}$。
- 边界条件。
- 平面波。
- 功率流与能量守恒。

## 常用频域形式

$$
\nabla\times\mathbf{E}=-j\omega\mu\mathbf{H}
$$

$$
\nabla\times\mathbf{H}=(\sigma+j\omega\varepsilon)\mathbf{E}
$$

复介电常数：

$$
\varepsilon_c=\varepsilon-j\frac{\sigma}{\omega}
$$

## 边界条件速查

| 边界 | 关系 |
| --- | --- |
| 电场切向 | $\mathbf{n}\times(\mathbf{E}_2-\mathbf{E}_1)=0$ |
| 磁场切向 | $\mathbf{n}\times(\mathbf{H}_2-\mathbf{H}_1)=\mathbf{K}_s$ |
| 电位移法向 | $\mathbf{n}\cdot(\mathbf{D}_2-\mathbf{D}_1)=\rho_s$ |
| 磁感应法向 | $\mathbf{n}\cdot(\mathbf{B}_2-\mathbf{B}_1)=0$ |

理想导体表面：

$$
E_t=0
$$

## 平面波功率

坡印亭矢量：

$$
\mathbf{S}=\mathbf{E}\times\mathbf{H}
$$

时间平均功率密度：

$$
\mathbf{S}_{av}=\frac12\mathrm{Re}\{\mathbf{E}\times\mathbf{H}^*\}
$$

## 反射与透射

法向入射反射系数：

$$
\Gamma=\frac{\eta_2-\eta_1}{\eta_2+\eta_1}
$$

透射系数：

$$
T=\frac{2\eta_2}{\eta_2+\eta_1}
$$

核心判断：

> 波阻抗不连续就会反射。

## 微波视角

低频电路常看电压电流；微波工程更常看：

- 入射波。
- 反射波。
- 传输波。
- 功率。
- 相位。

这也是后面 S 参数出现的原因。

## 连接

本篇是电磁场基础到微波工程的接口。后面所有传输线、波导、匹配、网络参数，本质上都是这些场方程在特定结构中的版本。

---

## 前后链接

---

**课程导航：** [上一篇：08 波导与谐振腔](/courses/microwave-engineering/08-waveguides-and-cavities/) · [返回微波工程与电磁场分类](/categories/%E7%A0%94%E7%A9%B6%E7%94%9F%E8%AF%BE%E7%A8%8B/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：10 微波传输线理论](/courses/microwave-engineering/10-microwave-transmission-lines/)
