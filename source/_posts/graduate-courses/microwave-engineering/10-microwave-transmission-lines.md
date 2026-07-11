---
title: 10 微波传输线理论
date: 2026-07-05 15:52:49
updated: 2026-07-05 15:52:49
categories:
  - 研究生课程
  - 微波工程与电磁场
tags:
  - 微波工程
  - 电磁场
  - 微波传输线
permalink: courses/microwave-engineering/10-microwave-transmission-lines/
description: 微波传输线的分析方法。
---
> 主线：传输线理论把沿线传播的电磁波写成电压电流波；反射系数、输入阻抗、驻波比和 Smith 圆图是核心工具。

## 核心对象

$$
V^+,\quad V^-,\quad \Gamma,\quad Z_0,\quad Z_L,\quad Z_{\mathrm{in}},\quad VSWR
$$

图像：

> 负载不匹配 $\rightarrow$ 反射 $\rightarrow$ 入射波和反射波叠加 $\rightarrow$ 驻波 $\rightarrow$ 输入阻抗随位置变化。

## 反射系数

负载处：

$$
\Gamma_L=\frac{Z_L-Z_0}{Z_L+Z_0}
$$

任意位置：

$$
\Gamma(z)=\Gamma_L e^{-j2\beta z}
$$

只要沿无耗传输线移动，$|\Gamma|$ 不变，相位改变。

## 驻波比

$$
VSWR=\frac{1+|\Gamma|}{1-|\Gamma|}
$$

反射越大，驻波比越大。

## 输入阻抗

$$
Z_{\mathrm{in}}
=Z_0\frac{Z_L+jZ_0\tan\beta l}{Z_0+jZ_L\tan\beta l}
$$

四分之一波长：

$$
l=\frac{\lambda}{4}
$$

$$
Z_{\mathrm{in}}=\frac{Z_0^2}{Z_L}
$$

用途：阻抗变换。

## Smith 圆图

Smith 圆图本质：

> 把归一化阻抗和反射系数之间的变换画在同一个图上。

归一化阻抗：

$$
z=\frac{Z}{Z_0}
$$

反射系数：

$$
\Gamma=\frac{z-1}{z+1}
$$

用途：

- 已知负载，看反射系数。
- 沿线移动，看阻抗变化。
- 设计短截线匹配。
- 估计驻波比。

## 匹配结构

### 四分之一波长变换器

目标：把 $Z_L$ 变换到 $Z_0$。

变换器阻抗：

$$
Z_1=\sqrt{Z_0Z_L}
$$

### 单短截线匹配

思路：

1. 沿主线移动到导纳实部为 1 的位置。
2. 用短截线提供相反的虚部。

### 有耗传输线

有耗线中：

$$
\gamma=\alpha+j\beta
$$

入射波随距离衰减：

$$
e^{-\alpha z}
$$

## 典型任务

| 任务 | 入口 |
| --- | --- |
| 已知 $Z_L$ 求反射 | $\Gamma_L=(Z_L-Z_0)/(Z_L+Z_0)$ |
| 已知 $Z_L,l$ 求输入阻抗 | $Z_{\mathrm{in}}$ 公式 |
| 判断匹配好坏 | 看 $|\Gamma|$ 或 VSWR |
| 设计窄带匹配 | 四分之一波长线或短截线 |

## 连接

传输线理论是微波工程中最常用的计算框架。后面 S 参数、匹配网络、谐振器和滤波器都在反复使用“入射波/反射波”语言。

---

## 前后链接

---

**课程导航：** [上一篇：09 微波电磁理论](/courses/microwave-engineering/09-microwave-electromagnetics/) · [返回微波工程与电磁场分类](/categories/%E7%A0%94%E7%A9%B6%E7%94%9F%E8%AF%BE%E7%A8%8B/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：11 传输线和波导](/courses/microwave-engineering/11-transmission-lines-and-waveguides/)
