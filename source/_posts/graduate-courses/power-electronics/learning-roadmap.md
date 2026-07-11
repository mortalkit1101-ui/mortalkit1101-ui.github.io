---
title: 00 电源硬件与数字电源学习路线
date: 2026-07-07 14:10:54
updated: 2026-07-07 14:10:54
tags:
  - 学习路线
  - 电源硬件
  - 数字电源
permalink: courses/power-electronics/learning-roadmap/
description: 面向电源硬件研发与数字电源方向的一年半学习路线。
categories:
  - 电源硬件与数字电源
series: 电源硬件与数字电源
cover: /img/courses/covers/power-learning-roadmap.svg
---

> 主线：电源硬件研发 + 数字控制 + EMI/EMC  
> 目标岗位：电源硬件工程师 / 数字电源工程师 / 电力电子硬件工程师 / 电源应用工程师  
> 对标方向：大疆偏消费级高功率密度电源，阳光电源偏新能源逆变器与储能电力电子，TI / 英飞凌偏电源芯片应用。

这条路线的核心不是“学很多知识点”，而是做出 2-3 个能证明工程能力的电源项目：会拓扑分析、会器件选型、会仿真、会 PCB Layout、会调试波形、会写基础控制代码，还能分析 EMI/EMC 风险。

## 1. 最终能力画像

不要把自己定位成：

> 我会 STM32。  
> 我懂一点电源。  
> 我也做射频。

更好的定位是：

> 具备电磁场 / 射频背景的电源硬件研发候选人，熟悉 DC-DC 拓扑、数字电源控制、功率器件选型、PCB Layout 和 EMI/EMC 分析。

简历和面试里可以浓缩为：

> 方向：高功率密度电源硬件 / 数字电源 / 新能源电力电子。

| 公司类型 | 适配方向 |
|---|---|
| 大疆 | 便携储能、无人机电源、电池充电、快充、电源管理、高功率密度 DC-DC |
| 阳光电源 | 光伏逆变器、储能 PCS、DC-DC、PFC、三相逆变、数字控制 |
| 华为数字能源 | 光伏、储能、充电桩、数据中心电源、嵌入式电源 |
| TI / 英飞凌 | 电源芯片应用、Gate Driver、MOSFET / SiC / GaN 应用 |
| 比亚迪 / 汇川 / 麦格米特 | 车载电源、电驱、电控、工业电源、逆变器 |
 
## 2. 路线调整原则

### 调整 1：LLC / PFC 不能放得太晚

如果对标阳光电源、华为数字能源、台达、麦格米特，面试中很可能问：

1. PFC 为什么要做功率因数校正？
2. Boost PFC 和普通 Boost 有什么区别？
3. LLC 为什么能软开关？
4. 半桥 / 全桥怎么驱动？
5. 死区时间有什么影响？
6. 开关损耗和导通损耗怎么算？
7. EMI 噪声从哪里来？

所以从 2027 年 3 月开始就要接触 LLC / PFC 的概念，不能拖到最后。

### 调整 2：STM32 可以入门，但 C2000 要提前出现

如果只投小功率数字 Buck，STM32 够用。但如果对标阳光电源、逆变器、储能 PCS、数字电源，大概率会遇到：

1. TI C2000
2. ePWM
3. ADC 触发采样
4. PI 电流环 / 电压环
5. SVPWM
6. dq 坐标变换
7. 保护中断

不需要一开始精通 C2000，但 2027 年上半年应该开始接触。

### 调整 3：项目要从“能跑”升级为“能证明工程能力”

简历项目不要只写：

> 做了一个 Buck。

要写成：

> 完成 12V 转 5V 同步 Buck 电源设计，包含参数计算、MOSFET / 电感 / 电容选型、LTspice 仿真、PCB Layout、示波器测试、效率测试、纹波测试、热分析和 EMI 风险分析。

大厂看的是完整工程闭环。

### 调整 4：把射频背景转化为 EMI/EMC 优势

普通电源学生会说：

> 我会 Buck。

你应该说：

> 我能结合电磁场和高频传输知识，分析开关节点、回流路径、高 di/dt 环路、寄生参数和辐射风险。

这对大疆、华为数字能源、阳光电源都很有价值。

## 3. 总路线

```text
电路分析
↓
模拟电子 + 功率器件
↓
电力电子拓扑
↓
Buck / Boost / Flyback / LLC / PFC
↓
LTspice / PLECS 仿真
↓
STM32 数字控制
↓
TI C2000 入门
↓
数字 Buck 项目
↓
同步 Buck PCB 项目
↓
PFC / 逆变器 / 储能方向了解
↓
EMI / 热 / 保护 / 可靠性
↓
简历项目 + 面试题
```

## 4. 分阶段执行方案

## 第一阶段：2026 年 7 月

### 核心目标

只做三件事：

1. 电磁场 / 微波工程继续推进
2. 补电路分析
3. 保持英语

现在没必要急着学 Buck。基础电路不稳，后面学电源会变成背公式。

### 每日安排

| 时间 | 内容 |
|---|---|
| 下午第 1 小时 | 电磁场 / 微波工程 |
| 下午第 2 小时 | 电磁场 / 微波工程 |
| 下午第 3 小时 | 电路分析 |
| 晚上 40 分钟 | 英语跟读 + 单词 + Datasheet 句子 |

### 电路分析重点

1. KCL / KVL
2. 节点电压法
3. 网孔电流法
4. 戴维南 / 诺顿
5. RC / RL 一阶电路
6. 正弦稳态
7. 阻抗
8. 拉普拉斯基础

### 本阶段书籍与读法

| 优先级 | 书籍 / 材料 | 用法 |
|---|---|---|
| 主教材 | 《电路》（邱关源）或《电路基础》同类教材 | 只抓 KCL、KVL、节点法、网孔法、一阶电路、正弦稳态，不追求全书刷完 |
| 辅助 | 《电路分析基础》（李瀚荪） | 用来补例题和中文表述，适合做题巩固 |
| 英文补充 | *Engineering Circuit Analysis*，Hayt / Kemmerly / Durbin | 每周读 1-2 页英文解释，训练 Datasheet 阅读耐受度 |
| 电磁场主线 | 《电磁场与电磁波》或正在使用的微波工程教材 | 和导师课程同步，不额外开新坑 |

### 7 月验收标准

看到一个基础电路，能自己列方程，算出电压、电流、时间常数和稳态结果。

## 第二阶段：2026 年 8 月到 10 月

### 核心目标

建立“器件 + 仿真 + C 语言”基础。

### 每周安排

| 内容 | 每周投入 |
|---|---|
| 模拟电子 | 3 次，每次 40-60 分钟 |
| C 语言 | 2 次，每次 40-60 分钟 |
| LTspice | 1 次，每次 60 分钟 |
| 英语 | 每天 30-40 分钟 |
| 射频科研 | 按导师要求推进 |

### 模拟电子重点

1. 二极管
2. BJT
3. MOSFET
4. 运放
5. 比较器
6. 开关状态与线性状态
7. 误差放大器
8. 电流采样
9. Gate Driver 基础

MOSFET 不是只知道它能开关，而是要理解：

1. Vgs
2. Vds
3. Rds(on)
4. Qg
5. Ciss / Coss / Crss
6. 开关损耗
7. 栅极电阻
8. 米勒平台
9. 死区时间

### C 语言重点

1. 变量
2. 函数
3. 指针
4. 数组
5. 结构体
6. 位运算
7. 状态机
8. 定时器思维
9. 中断思维

### LTspice 重点

1. RC 瞬态
2. 二极管整流
3. MOSFET 开关
4. 简单 Buck 开环
5. 看电压、电流、纹波、开关节点

### 本阶段书籍与读法

| 优先级 | 书籍 / 材料 | 用法 |
|---|---|---|
| 主教材 | 《模拟电子技术基础》（童诗白 / 华成英） | 重点看二极管、MOSFET、运放、比较器，不必在小信号模型里陷太深 |
| 器件补充 | *The Art of Electronics*，Horowitz / Hill | 查阅式阅读，重点看 MOSFET、运放、比较器、电源相关章节 |
| C 语言 | 《C 程序设计语言》（K&R）或《C Primer Plus》 | 用小程序练变量、指针、数组、结构体、位运算 |
| 仿真工具 | Analog Devices 官方 LTspice 文档与示例 | 每周复现一个小电路，不要只看教程 |
| 电源预热 | TI / Infineon MOSFET、Gate Driver Datasheet | 每周读一份器件首页、绝对最大额定值、典型应用电路 |

### 10 月验收标准

能解释 MOSFET 为什么能做开关，并能用 LTspice 仿真一个 MOSFET 控制负载的开关电路。

## 第三阶段：2026 年 11 月到 2027 年 2 月

### 核心目标

正式进入电力电子。

### 必学拓扑

1. Buck
2. Boost
3. Buck-Boost
4. Flyback
5. Forward
6. 半桥
7. 全桥
8. 同步整流
9. 基础 PFC 概念
10. 基础 LLC 概念

### 必须能回答的问题

1. Buck 为什么降压？
2. Boost 为什么升压？
3. CCM 和 DCM 有什么区别？
4. 占空比和输出电压是什么关系？
5. 电感怎么选？
6. 输出电容怎么选？
7. MOSFET 怎么选？
8. 二极管怎么选？
9. 开关频率升高有什么好处和代价？
10. 为什么同步 Buck 效率更高？
11. 为什么高 di/dt 环路会带来 EMI？

### 项目 1：12V 转 5V Buck 仿真

要求：

1. 输入 12V
2. 输出 5V
3. 开环 PWM 控制
4. 能看电感电流
5. 能看输出纹波
6. 能解释开关节点波形
7. 能改变占空比观察输出变化

### 本阶段书籍与读法

| 优先级 | 书籍 / 材料 | 用法 |
|---|---|---|
| 主教材 | *Fundamentals of Power Electronics*，Robert W. Erickson / Dragan Maksimović | 重点看稳态变换器分析、Buck / Boost / Buck-Boost、CCM / DCM、开关实现、磁性元件 |
| 中文辅助 | 《电力电子技术》（王兆安 / 刘进军） | 建立中文概念框架，重点看 DC-DC、整流、逆变、PWM |
| 工程入门 | *Power Supply Cookbook*，Marty Brown | 用来快速理解电源工程参数怎么估算 |
| 仿真辅助 | Christophe Basso 的开关电源 SPICE 相关书或公开资料 | 看仿真建模思路，先服务 Buck 项目，不要一口气啃控制环 |
| 工具 | TI Power Stage Designer | 用来校验 Buck / Boost 参数和电感电容估算 |

### 2027 年 2 月验收标准

能独立讲清楚 Buck / Boost 的工作过程，并完成一个基础 Buck 的 LTspice 仿真报告。

## 第四阶段：2027 年 3 月到 7 月

这是最关键阶段。

### 核心目标

进入数字电源，做出能写进简历的项目。

### 学习内容

1. STM32 GPIO
2. STM32 定时器
3. PWM
4. ADC
5. 中断
6. DMA 基础
7. 串口打印
8. PI 控制
9. 数字滤波
10. 采样时序
11. 保护逻辑

### 同时开始接触 TI C2000

不用一口吃下，但要知道：

1. C2000 为什么适合电力电子
2. ePWM 是什么
3. ADC 触发采样怎么做
4. Trip Zone 保护是什么
5. 电压环 / 电流环怎么实现

### 项目 2：STM32 数字 Buck

目标：

1. STM32 输出 PWM
2. ADC 采样输出电压
3. PI 算法调占空比
4. 输出稳定在目标电压附近
5. 加过压保护
6. 加过流保护的基本逻辑
7. 串口输出电压、电流、占空比

### 项目 2 的简历写法

> 基于 STM32 实现数字 Buck 闭环控制，完成 PWM 驱动、ADC 采样、PI 控制、软启动、过压保护和串口监测，实现输出电压闭环调节，并通过示波器测试输出纹波和动态响应。

### 本阶段书籍与读法

| 优先级 | 书籍 / 材料 | 用法 |
|---|---|---|
| 控制基础 | 《自动控制原理》（胡寿松）或同类教材 | 只抓反馈、稳定性、PI/PID、频域概念，不追求复杂证明 |
| 数字控制 | *Digital Control of High-Frequency Switched-Mode Power Converters*，Luca Corradini 等 | 查阅式阅读，重点理解采样、延时、数字补偿，不要求全书通读 |
| STM32 | STM32 参考手册 + HAL / LL 示例 | 围绕 PWM、ADC、中断、DMA、串口读，不系统刷外设 |
| C2000 | TI C2000 官方文档、培训、例程 | 先看 ePWM、ADC、Trip Zone、CLA / 中断概念 |
| 电源控制补充 | Erickson 书中的控制器设计、数字控制章节 | 与数字 Buck 项目结合看，遇到问题再回书里查 |

### 2027 年 7 月验收标准

能拿着板子、波形、仿真图和代码，向面试官完整讲清楚一个数字 Buck 项目。

## 第五阶段：2027 年 8 月到 12 月

### 核心目标

对标大厂，把项目做完整，把能力栈补成工程闭环。

### 必补内容

1. PCB Layout
2. EMI / EMC
3. 热设计
4. 保护电路
5. Datasheet 阅读
6. LLC 基础
7. PFC 基础
8. 三相逆变器基础
9. C2000 入门实验
10. 面试题整理

### 本阶段书籍与读法

| 优先级 | 书籍 / 材料 | 用法 |
|---|---|---|
| 开关电源工程 | *Switching Power Supply Design*，Pressman / Billings / Morey | 重点看拓扑、磁件、控制、保护、EMI、热设计，作为工程参考书 |
| EMI/EMC | *EMC for Product Designers*，Tim Williams | 建立传导、辐射、接地、屏蔽、滤波的工程框架 |
| PCB EMI | *PCB Design for Real-World EMI Control*，Bruce Archambeault | 重点看回流路径、环路面积、平面、去耦、电源板布局 |
| 高速 PCB | 《信号完整性与电源完整性分析》（Eric Bogatin） | 利用你的射频背景理解寄生参数、回流路径、电源完整性 |
| 热设计 | 《电子设备热设计》或厂商热设计应用笔记 | 重点看 MOSFET、二极管、电感、电容温升和散热路径 |
| PFC / 逆变 | Mohan 的 *Power Electronics: Converters, Applications, and Design* | 重点看整流、逆变、PWM、三相桥、功率因数校正 |

### 2027 年 12 月验收标准

完成同步 Buck PCB 与 EMI 分析报告，形成可展示的项目资料包：原理图、PCB、BOM、仿真、测试波形、效率曲线、温升记录、EMI 风险分析、问题复盘。

## 5. 最终准备的 3 个项目

### 项目 A：同步 Buck 电源硬件项目

对标：大疆、消费电子电源、TI / 英飞凌电源应用。

内容：

1. 12V 转 5V 或 24V 转 12V
2. 同步 Buck
3. MOSFET 选型
4. 电感选型
5. 输入 / 输出电容选型
6. Gate Driver 选型
7. LTspice 仿真
8. PCB Layout
9. 示波器测试
10. 效率测试
11. 纹波测试
12. 热测试
13. EMI 风险分析

简历写法：

> 设计并调试一款同步 Buck DC-DC 电源，完成主功率器件、电感、电容和驱动芯片选型，使用 LTspice 进行开关波形和纹波仿真，完成 PCB Layout，并测试输出纹波、效率和关键节点波形。

### 项目 B：STM32 数字 Buck 项目

对标：数字电源、嵌入式电源控制。

内容：

1. PWM 输出
2. ADC 采样
3. PI 控制
4. 软启动
5. 过压保护
6. 过流保护
7. 串口监控
8. 动态响应测试

简历写法：

> 基于 STM32 实现数字 Buck 控制系统，完成 PWM 驱动、ADC 同步采样、PI 闭环控制、软启动和保护逻辑设计，实现输出电压稳定调节，并对负载突变下的动态响应进行测试分析。

### 项目 C：电源 PCB EMI/EMC 分析项目

对标：大疆、华为数字能源、阳光电源的差异化优势。

内容：

1. 分析开关节点 SW
2. 分析高 di/dt 环路
3. 分析输入电容回路
4. 分析续流回路
5. 分析地回流路径
6. 比较不同 Layout 对 EMI 风险的影响
7. 给出优化方案

简历写法：

> 结合电磁场与高频电路基础，分析 DC-DC 电源 PCB 中开关节点、高 di/dt 环路和回流路径对 EMI 的影响，优化功率回路布局、输入去耦和地线结构，降低开关噪声耦合风险。

这个项目很适合你，因为它能把射频背景变成电源岗位优势。

## 6. 对标不同公司的学习侧重点

### 对标大疆

大疆相关电源更偏：

1. 小体积
2. 高功率密度
3. 电池充放电
4. 快充
5. DC-DC
6. USB-C PD
7. BMS 基础
8. 热设计
9. EMI
10. 可靠性

额外补：

1. 锂电池基础
2. 充电曲线 CC/CV
3. USB-C PD 基础
4. 便携储能架构
5. 高功率密度 Layout
6. 低噪声电源设计

### 对标阳光电源

阳光电源更偏：

1. 光伏逆变器
2. 储能 PCS
3. Boost PFC
4. DC-AC 逆变
5. 三相桥
6. IGBT / SiC MOSFET
7. C2000
8. PLL
9. SVPWM
10. 并网基础
11. 安规和保护

额外补：

1. PFC
2. 三相逆变器
3. SPWM / SVPWM
4. dq 坐标变换入门
5. LCL 滤波器概念
6. 储能 PCS 架构
7. C2000 入门

### 对标 TI / 英飞凌电源应用

这类岗位更看重：

1. Datasheet 阅读
2. Application Note 阅读
3. 芯片外围电路设计
4. Demo Board 分析
5. MOSFET / Driver / Controller 选型
6. 客户问题定位
7. 示波器调试能力
8. 英文表达

额外补：

1. 英文 Datasheet
2. TI Power Stage Designer
3. Webench 或类似工具
4. Gate Driver 应用笔记
5. MOSFET 损耗计算
6. 电源芯片典型应用电路分析

## 7. 暂时放弃或后置的内容

一年半内不要把这些作为主线：

1. 纯模拟 IC 设计
2. 芯片版图
3. Linux 驱动
4. 复杂 FOC
5. 深度并网控制
6. 复杂 BMS 算法
7. AI
8. 射频方向全面转行

不是不能学，而是现在会分散火力。当前主线始终是：

> 电源硬件 + 数字控制 + EMI/EMC。

## 8. 一年半路线总表

| 时间 | 主线任务 | 项目产出 | 本阶段核心书籍 |
|---|---|---|---|
| 2026.07 | 电磁场 / 微波 + 电路分析 + 英语 | 电路分析基础题 | 《电路》/ *Engineering Circuit Analysis* |
| 2026.08-10 | 模电 + C 语言 + LTspice | MOSFET 开关仿真 | 《模拟电子技术基础》/ *The Art of Electronics* / K&R C |
| 2026.11-2027.02 | Buck / Boost / Flyback / 半桥 / LLC / PFC 入门 | 12V 转 5V Buck 仿真 | *Fundamentals of Power Electronics* / 《电力电子技术》 |
| 2027.03-07 | STM32 + PWM + ADC + PI 控制 + C2000 入门 | STM32 数字 Buck | 《自动控制原理》/ C2000 官方资料 / 数字电源控制书 |
| 2027.08-12 | PCB + EMI + 热 + 保护 + PFC / 逆变器基础 + 面试 | 同步 Buck PCB + EMI 分析报告 | *Switching Power Supply Design* / *EMC for Product Designers* / Mohan |

## 9. 简历方向

简历标题可以写：

> 电源硬件 / 数字电源方向

或者：

> 电力电子硬件研发方向，具备数字控制与 EMI/EMC 分析能力

项目顺序建议：

1. 同步 Buck 电源设计与调试
2. STM32 数字 Buck 闭环控制
3. DC-DC 电源 PCB EMI/EMC 分析
4. 射频 / 电磁场科研项目

这样比“我学过 STM32、Buck、射频”强很多。

## 10. 参考链接

这些链接用于确认工具、产品方向和核心教材，不需要一次性全读。

1. [DJI Power 1000](https://www.dji.com/sg/power-1000)
2. [Huawei Digital Power](https://digitalpower.huawei.com/en)
3. [Infineon Power](https://www.infineon.com/products/power)
4. [Fundamentals of Power Electronics - Springer](https://link.springer.com/book/10.1007/978-3-030-43881-4)
5. [LTspice - Analog Devices](https://www.analog.com/en/resources/design-tools-and-calculators/ltspice-simulator.html)
6. [TI Power Stage Designer](https://www.ti.com/tool/POWERSTAGE-DESIGNER)
7. [TI C2000 Real-Time Control MCUs](https://www.ti.com/product-category/microcontrollers-processors/mcus/overview.html)

## 11. 最重要的一句话

最终目标不是“什么都懂一点”，而是让面试官相信：

> 这个人能进电源研发组，能看懂电源拓扑，能选器件，能画板，能调波形，能写控制代码，还能分析 EMI。

这就是对标大疆、阳光电源、华为数字能源、TI、英飞凌时最有竞争力的路线。

---

**课程导航：** [返回电源硬件与数字电源分类](/categories/%E7%94%B5%E6%BA%90%E7%A1%AC%E4%BB%B6%E4%B8%8E%E6%95%B0%E5%AD%97%E7%94%B5%E6%BA%90/) · [下一篇：01 电力电子绪论](/courses/power-electronics/01-introduction/)
