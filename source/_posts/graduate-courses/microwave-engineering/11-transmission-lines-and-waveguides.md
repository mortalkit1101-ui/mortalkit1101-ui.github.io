---
title: 11 传输线和波导
date: 2026-07-01 16:37:37
updated: 2026-07-01 16:37:37
tags:
  - 微波工程
  - 电磁场
  - 传输线
permalink: courses/microwave-engineering/11-transmission-lines-and-waveguides/
description: 传输线与波导的联系和区别。
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/11-transmission-lines-and-waveguides.svg
---

> 主线：不同导波结构支持不同模式；TEM、TE、TM 是区分传输线和波导的关键语言。

## 模式分类

| 模式 | 条件 | 常见结构 |
| --- | --- | --- |
| TEM | $E_z=H_z=0$ | 同轴线、双导线、理想微带近似 |
| TE | $E_z=0,\ H_z\neq0$ | 矩形波导、圆波导 |
| TM | $E_z\neq0,\ H_z=0$ | 矩形波导、圆波导 |

## 同轴线

特点：

- 支持 TEM 模。
- 没有截止频率。
- 场主要在内外导体之间。

常用参数：

$$
C'=\frac{2\pi\varepsilon}{\ln(b/a)}
$$

$$
L'=\frac{\mu}{2\pi}\ln(b/a)
$$

$$
Z_0=\frac{1}{2\pi}\sqrt{\frac{\mu}{\varepsilon}}\ln(b/a)
$$

## 矩形波导

主模：

$$
TE_{10}
$$

截止频率：

$$
f_{c,mn}=\frac{1}{2\sqrt{\mu\varepsilon}}
\sqrt{\left(\frac{m}{a}\right)^2+\left(\frac{n}{b}\right)^2}
$$

传播条件：

$$
f>f_c
$$

低于截止频率时，场沿传播方向指数衰减，不传输功率。

## 微带线

微带线由导带、介质基片和接地板组成。

特点：

- 实际为准 TEM 模。
- 场一部分在介质中，一部分在空气中。
- 常用有效介电常数 $\varepsilon_{\mathrm{eff}}$ 描述。

相速度近似：

$$
v_p=\frac{c}{\sqrt{\varepsilon_{\mathrm{eff}}}}
$$

## 色散

色散指不同频率具有不同传播速度。

波导中：

$$
\beta=\sqrt{k^2-k_c^2}
$$

因此相速度和群速度都与频率有关。

## 传输线与波导对比

| 项目 | 传输线 | 波导 |
| --- | --- | --- |
| 常见模式 | TEM / 准 TEM | TE / TM |
| 截止频率 | TEM 无截止 | 有截止 |
| 典型结构 | 同轴线、微带线 | 矩形波导、圆波导 |
| 分析重点 | $Z_0,\Gamma,Z_{\mathrm{in}}$ | 模式、截止频率、场分布 |

## 连接

- 传输线偏“电路化”的波。
- 波导偏“场分布和模式”的波。
- 微带线处在两者之间，是实际微波电路最常见结构。

---

## 前后链接

---

**课程导航：** [上一篇：10 微波传输线理论](/courses/microwave-engineering/10-microwave-transmission-lines/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：12 微波网络分析](/courses/microwave-engineering/12-microwave-network-analysis/)
