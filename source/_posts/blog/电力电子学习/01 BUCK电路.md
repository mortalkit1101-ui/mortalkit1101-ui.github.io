---
title: 01 BUCK电路
date: 2026-09-29 10:00:00
tags:
  - BUCK
categories:
  - 电力电子
toc_number: false
mathjax: true
published: true
---

## 1. 基本拓扑

下图是异步 Buck 电路的基本拓扑，包括开关管 Q、续流二极管 D、电感 L 和输出电容 C。

![异步 Buck 电路的基本拓扑](/img/blog/power-electronics/01-buck-circuit/01-asynchronous-buck-topology.png)

- **Q 导通时：** $V_{SW}\approx V_i$，电感电流以固定斜率上升。
- **Q 关断时：** $V_{SW}\approx -V_d$，电感电流以固定斜率下降。

## 2. 参数计算

### 2.1 占空比计算

电感电流在开关导通期间上升、关断期间下降，变化斜率与电感两端的电压有关。

![电感电流在导通与关断期间的变化](/img/blog/power-electronics/01-buck-circuit/02-inductor-current-timing.png)

由电感关系式：

$$
U=L\frac{\mathrm{d}i}{\mathrm{d}t}
$$

根据伏秒平衡，导通期间电感电压与导通时间的乘积，等于关断期间电感电压绝对值与关断时间的乘积：

$$
(V_i-V_o)T_{\mathrm{on}}=(V_o+V_d)T_{\mathrm{off}}
$$

又已知：

$$
T=T_{\mathrm{on}}+T_{\mathrm{off}}=\frac{1}{f}
$$

因此，导通时间为：

$$
T_{\mathrm{on}}=\frac{V_o+V_d}{V_i+V_d}\cdot\frac{1}{f}
$$

关断时间为：

$$
T_{\mathrm{off}}=\frac{V_i-V_o}{V_i+V_d}\cdot\frac{1}{f}
$$

占空比为：

$$
D=\frac{T_{\mathrm{on}}}{T}=\frac{V_o+V_d}{V_i+V_d}
$$

### 2.2 电感电流纹波计算

电感电流纹波 $\Delta I_L$ 是一个开关周期内电感电流的峰峰值，如下图所示。

![电感电流的平均值与峰峰值纹波](/img/blog/power-electronics/01-buck-circuit/03-inductor-current-ripple.png)

开关导通时：

$$
U=V_i-V_o
$$

导通时间：

$$
\mathrm{d}t=T_{\mathrm{on}}
=\frac{V_o+V_d}{V_i+V_d}\cdot\frac{1}{f}
$$

根据：

$$
U=L\frac{\mathrm{d}i}{\mathrm{d}t}
$$

则电流增大量为：

$$
\mathrm{d}i=\frac{U\cdot\mathrm{d}t}{L}
=\frac{V_o+V_d}{V_i+V_d}\cdot\frac{1}{fL}(V_i-V_o)
=\Delta I_L
$$

即电流纹波为：

$$
\Delta I_L
=\frac{V_o+V_d}{fL}\cdot\frac{V_i-V_o}{V_i+V_d}
$$

同步 Buck（$V_d=0$）时：

$$
\Delta I_L=\frac{V_o}{fL}\left(1-\frac{V_o}{V_i}\right)
$$

**电感峰值电流**为：

$$
I_{LP}=I_o+\frac{\Delta I_L}{2}
$$

代入电流纹波公式：

$$
I_{LP}
=I_o+\frac{V_o+V_d}{2fL}\cdot\frac{V_i-V_o}{V_i+V_d}
$$

同步 Buck（$V_d=0$）时：

$$
I_{LP}
=I_o+\frac{V_o}{2fL}\left(1-\frac{V_o}{V_i}\right)
$$

由以下关系确定电感量：

$$
I_L=I_o
$$

$$
\Delta I_L
=\frac{V_o+V_d}{fL}\cdot\frac{V_i-V_o}{V_i+V_d}
$$

取电流纹波为平均电感电流的 20%～40%：

$$
\Delta I_L=(0.2\sim0.4)I_L
$$

因此：

$$
L=\frac{V_o+V_d}{f(0.2\sim0.4)I_o}
\cdot\frac{V_i-V_o}{V_i+V_d}
$$

同步 Buck（$V_d=0$）时：

$$
L=\frac{V_o}{f(0.2\sim0.4)I_o}
\left(1-\frac{V_o}{V_i}\right)
$$

### 2.3 输出电压纹波计算

输出电压纹波反映输出的稳定性。电感电流分为负载电流和电容电流，电容交替充电、放电；图中还标出了电容的等效串联电阻（ESR）。

![电感电流分配、电容充放电与 ESR 示意](/img/blog/power-electronics/01-buck-circuit/04-output-current-paths-and-esr.png)

输出电压纹波由电容充放电引起的电压变化和 ESR 上的压降组成。下图给出了两部分的计算过程：

![输出电容与 ESR 引起的电压纹波计算](/img/blog/power-electronics/01-buck-circuit/05-output-voltage-ripple.png)

## 3. BUCK 芯片

下图标出了输入储能与去耦电容、自举电容、使能引脚，以及接入反馈引脚的电阻分压网络。

![BUCK 芯片外围电路及关键引脚](/img/blog/power-electronics/01-buck-circuit/06-buck-chip-peripherals.png)
