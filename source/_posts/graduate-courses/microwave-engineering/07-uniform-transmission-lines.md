---
title: 07 均匀传输线
date: 2026-07-07 08:17:28
updated: 2026-07-07 08:17:28
permalink: courses/microwave-engineering/07-uniform-transmission-lines/
description: 均匀传输线模型与基本方程。
tags:
  - 电磁场
categories:
  - 微波工程与工程电磁场
series: 微波工程与工程电磁场
cover: /img/courses/covers/07-uniform-transmission-lines.svg
---

> 主线：微波频率下，电压电流沿线传播；负载不匹配会产生反射，输入阻抗随位置变化。

## 分布参数

单位长度参数：

$$
R',\quad L',\quad G',\quad C'
$$

含义：

- $R'$：导体损耗。
- $L'$：单位长度电感。
- $G'$：介质损耗。
- $C'$：单位长度电容。

## 传输线方程

频域形式：

$$
\frac{dV}{dz}=-(R'+j\omega L')I
$$

$$
\frac{dI}{dz}=-(G'+j\omega C')V
$$

传播常数：

$$
\gamma=\sqrt{(R'+j\omega L')(G'+j\omega C')}
$$

特性阻抗：

$$
Z_0=\sqrt{\frac{R'+j\omega L'}{G'+j\omega C'}}
$$

无耗线：

$$
Z_0=\sqrt{\frac{L'}{C'}}
$$

$$
\beta=\omega\sqrt{L'C'}
$$

$$
v=\frac{1}{\sqrt{L'C'}}
$$

## 行波解

电压：

$$
V(z)=V_0^+e^{-\gamma z}+V_0^-e^{\gamma z}
$$

电流：

$$
I(z)=\frac{V_0^+}{Z_0}e^{-\gamma z}-\frac{V_0^-}{Z_0}e^{\gamma z}
$$

其中：

- $V_0^+$：入射波。
- $V_0^-$：反射波。

## 反射系数

负载处：

$$
\Gamma_L=\frac{Z_L-Z_0}{Z_L+Z_0}
$$

特殊情况：

| 负载        | $\Gamma_L$ |
| --------- | ---------- |
| $Z_L=Z_0$ | 0          |
| 开路        | 1          |
| 短路        | -1         |

## 输入阻抗

无耗线，长度 $l$：

$$
Z_{\mathrm{in}}
=Z_0\frac{Z_L+jZ_0\tan\beta l}{Z_0+jZ_L\tan\beta l}
$$

常见特例：

短路线：

$$
Z_{\mathrm{in}}=jZ_0\tan\beta l
$$

开路线：

$$
Z_{\mathrm{in}}=-jZ_0\cot\beta l
$$

四分之一波长线：

$$
Z_{\mathrm{in}}=\frac{Z_0^2}{Z_L}
$$

## 驻波比

$$
VSWR=\frac{1+|\Gamma|}{1-|\Gamma|}
$$

物理图像：

- $|\Gamma|=0$：无反射。
- $|\Gamma|$ 越大，驻波越明显。
- $|\Gamma|=1$：全反射。

## 匹配

匹配目标：

$$
Z_{\mathrm{in}}=Z_0
$$

常见方法：

- 四分之一波长变换器。
- 单短截线匹配。
- 双短截线匹配。
- 集总 L 网络。

## 连接

- 传输线把电磁波问题变成电路可计算形式。
- Smith 圆图本质上是反射系数平面的图形化工具。
- 微波网络的 S 参数就是对入射波、反射波的系统化描述。

---

## 前后链接

---

**课程导航：** [上一篇：06 平面电磁波](/courses/microwave-engineering/06-plane-waves/) · [返回微波工程与工程电磁场分类](/categories/%E5%BE%AE%E6%B3%A2%E5%B7%A5%E7%A8%8B%E4%B8%8E%E5%B7%A5%E7%A8%8B%E7%94%B5%E7%A3%81%E5%9C%BA/) · [下一篇：08 波导与谐振腔](/courses/microwave-engineering/08-waveguides-and-cavities/)
