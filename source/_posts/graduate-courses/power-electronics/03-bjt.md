---
title: 03 双极结型晶体管 BJT
date: 2026-07-09 18:34:24
updated: 2026-07-09 18:34:24
tags:
  - BJT
  - 功率晶体管
  - 电力电子器件
permalink: courses/power-electronics/03-bjt/
description: NPN 型三极管的基本工作原理、功率 BJT 结构与输入特性笔记。
categories:
  - 电源硬件与数字电源
series: 电源硬件与数字电源
cover: /img/courses/power-electronics/03-bjt/03-05-power-bjt-structure.png
---

## 1. NPN 型三极管的工作原理

NPN 型三极管由两个 N 型区和中间的 P 型区构成，形成发射极 E、基极 B 和集电极 C 三个端子，以及两个 PN 结。

![NPN 三极管层结构](/img/courses/power-electronics/03-bjt/03-01-npn-layer-structure.png)

*图：NPN 三极管由 N 型发射区、P 型基区和 N 型集电区构成*

### 1.1 仅施加一个偏置电压

![NPN 三极管单一偏置状态](/img/courses/power-electronics/03-bjt/03-02-single-bias.png)

*图：仅施加单一偏置时，两个 PN 结不能同时满足放大区工作条件*

仅施加一个偏置电压时，一个势垒区减弱，另一个势垒区增强，NPN 型三极管不能形成完整的集电极电流通路。

### 1.2 同时设置发射结与集电结偏置

![NPN 三极管有源区偏置](/img/courses/power-electronics/03-bjt/03-03-active-bias.png)

*图：发射结正偏、集电结反偏时的载流子运动*

当发射结正向偏置、集电结反向偏置时，发射极向基区注入电子。由于基区较薄，大部分电子穿过基区并在集电结电场作用下进入集电区，最终形成集电极电流。

基极电流增大时，发射极注入基区的电子数量增加，集电极电流也随之增大。直流电流放大倍数可写为：

$$
\beta = \frac{i_C}{i_B}
$$

> **直观理解**
> 可以用水流与闸门作类比：基极控制量相当于闸门开度，较小的控制变化可以调节较大的集电极—发射极电流。这个类比有助于建立直观认识，但不能替代半导体载流子模型。

![NPN 三极管水流类比](/img/courses/power-electronics/03-bjt/03-04-water-flow-analogy.png)

*图：用水流和闸门直观理解基极电流对集电极电流的控制*

## 2. 功率 BJT 的结构特点

![功率 BJT 纵向结构](/img/courses/power-electronics/03-bjt/03-05-power-bjt-structure.png)

*图：功率 BJT 的纵向多层结构*

为了保持较大的电流增益 $\beta$，发射区的掺杂浓度通常高于基区。功率 BJT 采用适合承受较大电流和电压的纵向结构，三个端子分别为发射极 E、基极 B 和集电极 C。

![NPN 与 PNP 三极管符号](/img/courses/power-electronics/03-bjt/03-06-bjt-symbols.png)

*图：NPN 与 PNP 三极管的端子和电路符号*

## 3. 功率 BJT 的静态特性

### 3.1 输入特性

输入特性描述基极电流 $i_B$ 与基极—发射极电压 $u_{BE}$ 的关系，并以集电极—发射极电压 $u_{CE}$ 为参变量。

![功率 BJT 输入特性曲线](/img/courses/power-electronics/03-bjt/03-07-input-characteristic.png)

*图：不同 $u_{CE}$ 条件下 $i_B$ 与 $u_{BE}$ 的关系*

由图可见，在 $u_{BE}$ 不变时，随着 $u_{CE}$ 增大，$i_B$ 会有所减小，输入特性曲线相应发生偏移。

### 3.2 输出特性

输出特性用于描述集电极电流 $i_C$ 与集电极—发射极电压 $u_{CE}$ 的关系。当前笔记已记录：

- $V_{CEO}$ 表示基极开路条件下集电极—发射极可承受的电压参数。
- 当基极电流 $i_B$ 近似为零时，集电极电流 $i_C$ 也接近于零。

## 4. 当前学习进度

功率 BJT 的输出特性和动态特性尚未整理完成，本节笔记仍在更新。

---

**课程导航：** [上一篇：02 功率二极管](/courses/power-electronics/02-power-diode/) · [返回电源硬件与数字电源分类](/categories/%E7%94%B5%E6%BA%90%E7%A1%AC%E4%BB%B6%E4%B8%8E%E6%95%B0%E5%AD%97%E7%94%B5%E6%BA%90/)
