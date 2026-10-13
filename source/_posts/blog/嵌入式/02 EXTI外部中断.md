---
title: 02 EXTI外部中断
date: 2026-10-13 22:25:26
tags:
  - EXTI
  - NVIC
categories:
  - 嵌入式
published: true
---

## 1. EXTI 简介

EXTI（External interrupt/event controller）是外部中断与事件控制器。本文使用**正点原子探索者 STM32F407ZGT6 V3 开发板**和 STM32F4 标准外设库，接着 GPIO 输入输出学习按键中断。

### 1.1 轮询与中断

**轮询**：主循环反复读取 GPIO，执行到检测语句时才检查按键。如果主循环正在处理较长的操作，按键检测需要等待。

**中断**：硬件检测指定事件，产生请求；CPU 在允许响应时暂时转去执行中断服务函数，处理结束后恢复原来的程序。

中断并不是 CPU 同时执行两段程序，也不保证请求发生后立刻执行。IRQ 未使能、CPU 屏蔽中断或更高优先级异常正在执行，都可能让请求先等待。

### 1.2 从 PE2 下降沿到主循环处理

```text
按下 KEY2，PE2 从高电平变为低电平
        ↓
SYSCFG：选择 PE2 作为 EXTI2 的来源
        ↓
EXTI：检测下降沿，记录挂起标志
        ↓
允许的中断请求送往 NVIC
        ↓
NVIC：使能、优先级与待响应管理
        ↓
CPU 保存现场，读取中断向量
        ↓
执行 EXTI2_IRQHandler
        ↓
清除 EXTI 标志，记录软件通知
        ↓
异常返回，继续原程序
        ↓
主循环消抖并切换 LED
```

| 环节 | 负责什么 |
| --- | --- |
| GPIO | 接收引脚电平 |
| SYSCFG | 选择哪个 GPIO 端口连接到对应 EXTI 线路 |
| EXTI | 检测指定边沿，记录并产生请求 |
| NVIC | 管理 CPU 对中断的响应 |
| CPU 与中断函数 | 保存、恢复现场并执行处理程序 |

**下降沿由硬件检测。**进入中断函数后，`EXTI_GetITStatus` 检查的是对应线路有没有挂起请求，不是在函数里重新检测电平的高低变化。

### 1.3 探索者 V3 的按键与 LED

| 板上器件 | 芯片引脚 | 松开 / 熄灭 | 按下 / 点亮 |
| --- | --- | --- | --- |
| KEY0 | PE4 | 配置内部上拉后为高电平 | 低电平 |
| KEY1 | PE3 | 配置内部上拉后为高电平 | 低电平 |
| KEY2 | PE2 | 配置内部上拉后为高电平 | 低电平 |
| KEY_UP / WK_UP | PA0 | 普通输入配置内部下拉后为低电平 | 高电平 |
| LED0 / DS0，红灯 | PF9 | 高电平 | 低电平 |
| LED1 / DS1，绿灯 | PF10 | 高电平 | 低电平 |

KEY0、KEY1、KEY2 按下接地，板上没有外部上拉电阻，需要配置 STM32 内部上拉。按下是下降沿，松开是上升沿；持续按住低电平，不会凭空产生新的下降沿。

官方《STM32F407 探索者开发指南 V1.3》第十六章 16.2 的硬件资源列表存在旧引脚笔误。这里以 **V3 硬件参考手册第 31 页、原理图第 5 页及配套源码**交叉核对后的连接为准，不采用 PE0 / PE1 的 LED 连接。

## 2. 寄存器介绍

### 2.1 SYSCFG_EXTICR：选择 GPIO 来源

GPIO 引脚序号决定 EXTI 线路序号：`Px0 → EXTI0`、`Px2 → EXTI2`、`Px3 → EXTI3`，依次对应到 EXTI15。

以 EXTI2 为例，多个端口的第 2 号引脚通过选择器接入同一条线路：

```text
PA2 ─┐
PB2 ─┤
PC2 ─┼── 选择一个来源 ──→ EXTI2
PD2 ─┤
PE2 ─┘
```

**同一条 GPIO EXTI 线路，同一时刻只能选择一个端口来源。**PE2 和 PE3 可以分别使用 EXTI2、EXTI3；PA2 和 PE2 不能同时作为 EXTI2 的两个独立 GPIO 来源。

`SYSCFG_EXTICR1` 地址偏移为 `0x08`，其中 EXTI2 的端口选择字段位于 `[11:8]`。GPIOE 的编码为 4；标准库的 `SYSCFG_EXTILineConfig` 会修改这个字段。

GPIOE、GPIOF 的时钟由 AHB1 控制，SYSCFG 的时钟由 APB2 控制。使用 F407 的 EXTI 不需要另找一个独立的 EXTI 时钟使能函数。

**本课中断引脚仍配置为数字输入模式，不需要设置 GPIO 的 AF 复用模式。**

### 2.2 EXTI_IMR：中断屏蔽寄存器

地址偏移：`0x00`。

| 对应位 | 含义 |
| --- | --- |
| `0` | 屏蔽这条线路的中断请求 |
| `1` | 允许这条线路的中断请求 |

允许 EXTI 线路与允许 NVIC 的 IRQ 是两个步骤。只配置其中一个，不能算完整的 CPU 中断响应配置。

### 2.3 EXTI_EMR：事件屏蔽寄存器

地址偏移：`0x04`。控制 EXTI 的事件路径。

**事件不等于执行中断服务函数。**本课使用 `EXTI_Mode_Interrupt`；事件模式与相关唤醒机制留到后续按需学习。

### 2.4 EXTI_RTSR / EXTI_FTSR：触发边沿选择

| 寄存器 | 地址偏移 | 对应位置 1 的作用 |
| --- | --- | --- |
| RTSR | `0x08` | 选择上升沿触发 |
| FTSR | `0x0C` | 选择下降沿触发 |

KEY1、KEY2 为低电平有效，按下时采用下降沿；KEY_UP 为高电平有效，按下时采用上升沿。两种边沿都开启时，按下和松开的变化都可能产生请求。

### 2.5 EXTI_PR：请求挂起寄存器

地址偏移：`0x14`。

读取对应位为 1，表示这条线路有挂起请求。**清除方式是向对应位写 1；写 0 不会清除。**标准库 `EXTI_ClearITPendingBit` 将指定线路掩码直接写入 PR。

PR 不能按普通变量“赋 0 清除”的习惯处理，也不应使用读—改—写方式清位，否则可能误清其他已挂起线路。

清 PR 只清除当前来源记录，不会关闭 EXTI，不会改变 GPIO 电平，也不代表按键已经松开或完成消抖。

每条线的 PR 是一个状态位，不是脉冲队列。多个边沿可能合并为一个待处理状态，因此不能据此保证精确记录所有高速脉冲。

### 2.6 EXTI_SWIER：软件中断事件寄存器

地址偏移：`0x10`。可以按寄存器规则通过软件产生请求，用于检查后半段中断路径。GPIO 接线、来源选择和边沿是否正确，仍需要实际输入验证。

## 3. NVIC 与中断执行

### 3.1 EXTI 挂起与 NVIC 挂起

| 状态 | 含义 |
| --- | --- |
| EXTI PR | 外设来源的挂起记录 |
| NVIC Enabled | 该 IRQ 被允许响应 |
| NVIC Pending | 内核侧有请求等待响应 |
| NVIC Active | 已进入这个异常的处理，可能正在执行或被更高优先级异常打断 |

**Pending 是待响应，不是“暂停正在执行的中断”。**进入 ISR 后 NVIC 管理 pending / active 状态，但外设 PR 仍需软件按规则清除。只清 NVIC pending，不能代替清除仍然有效的外设请求来源。

### 3.2 抢占优先级与子优先级

F407 实现 4 位中断优先级，数字越小，优先级越高。本课采用 `NVIC_PriorityGroup_2`：

| 类型 | 位数 | 可用数值 |
| --- | --- | --- |
| 抢占优先级 | 2 位 | 0～3 |
| 子优先级 | 2 位 | 0～3 |

- 抢占优先级决定是否能够打断正在执行的较低抢占优先级 ISR。
- 相同抢占优先级的 ISR 不因子优先级不同而相互打断。
- 同抢占级的多个请求同时等待且可以响应时，子优先级用于排序；两者完全相同再按异常编号排序。

本课 EXTI2 为 `(1, 0)`，EXTI3 为 `(1, 1)`：二者不能互相抢占；同时等待时 EXTI2 在前。优先级分组是位数的划分，不是给外设分配五个物理组，应在工程中统一设置。

### 3.3 CPU 保存现场与异常返回

普通、未涉及浮点扩展的异常进入，硬件保存 `R0～R3、R12、LR、PC、xPSR` 的基本栈帧；编译器按需要保存其他寄存器。同时，硬件从向量表读取中断入口地址。

ISR 执行结束后，异常返回机制恢复原执行状态。如果还有符合条件的待处理异常，也可能通过尾链直接处理下一项，不一定立即返回主循环。当前先掌握整体过程，不要求背异常返回指令。

### 3.4 中断函数名称与共享入口

| GPIO EXTI 线路 | 中断入口 |
| --- | --- |
| EXTI0～EXTI4 | 分别使用 EXTI0_IRQHandler～EXTI4_IRQHandler |
| EXTI5～EXTI9 | 共用 EXTI9_5_IRQHandler |
| EXTI10～EXTI15 | 共用 EXTI15_10_IRQHandler |

共享入口中需要逐线检查挂起来源，能够处理多个同时到达的请求。

启动文件的向量表关联的是准确的函数符号，例如 `EXTI2_IRQHandler`。名字拼错，代码仍可能编译，但真正中断会进入默认处理入口；同名 ISR 在多个文件重复定义，会导致链接错误。

### 3.5 初始化参数不要混用

| 名称 | 含义 |
| --- | --- |
| GPIO_Pin_2 | GPIO 位掩码，值为 `0x0004` |
| EXTI_PinSource2 | 引脚序号 2 |
| EXTI_Line2 | EXTI 线路掩码，值为 `0x0004` |
| EXTI2_IRQn | NVIC IRQ 编号，在 F407 中为 8 |
| EXTI2_IRQHandler | 中断函数符号 |

数值相同不代表参数用途相同。EXTI 初始化的四项分别选择线路、模式、触发边沿和线路使能；NVIC 初始化则选择 IRQ、抢占优先级、子优先级和 IRQ 使能。

## 4. volatile 与软件标志

### 4.1 为什么共享标志需要 volatile

主循环检查按键通知，中断可能在主循环执行期间把通知置为 1。编译器不能根据普通执行路径一直使用先前保存的旧值。

`volatile` 告诉编译器：这个对象可能被异步改变，必须保留程序规定的相关访问，不能基于“它没有变化”的假设省略读写。低优化下看起来能运行，不代表可以省略它。相关定义见 [Arm 编译器用户指南第 4.1 节](https://documentation-service.arm.com/static/6049fe6cee937942ba302cac)。

| 关键字 / 类型 | 本课中的作用 |
| --- | --- |
| 文件作用域的 static | 名字只在当前 `.c` 文件中可见 |
| volatile | 保留异步共享对象所需的访问 |
| uint8_t | 8 位无符号整数，可保存 0～255 |

`static` 与 `volatile` 作用不同。同一文件中的 main 与 ISR 仍能共同访问文件级 static 变量。

### 4.2 硬件标志与软件标志

| 标志 | 谁设置 | 谁清除 |
| --- | --- | --- |
| EXTI PR | 硬件检测事件后设置 | ISR 按写 1 清的规则清除 |
| 软件 press | ISR 置为 1，通知主循环 | 主循环处理时置为 0 |

不清硬件来源可能反复进入中断；不清软件通知，主循环可能反复处理同一通知。清除一个不会自动清除另一个。

### 4.3 volatile 的边界

- 不提供按键消抖。
- 不关闭整个程序的全部优化。
- 不保证“读取、修改、写回”或“检查后清零”作为一个整体不可被中断。
- 不把布尔标志变成事件队列：多次置 1，结果仍然是 1。

当前用布尔通知学习按键交互。需要精确事件计数或严格并发保护时，再增加相应机制。只由主循环访问的 ready 变量不需要 volatile。

## 5. 代码部分

### 5.1 实验对应与验收

为便于与练习代码对照，以下保留原软件变量名称：

| 板上按键 | 引脚 / IRQ | 软件变量前缀 | 控制的 LED |
| --- | --- | --- | --- |
| KEY2 | PE2 / EXTI2 | key1 | PF9 红灯 |
| KEY1 | PE3 / EXTI3 | key2 | PF10 绿灯 |

**软件 key1 / key2 是本程序自定名称，与板上的 KEY1 / KEY2 标签相反；硬件连接以上表为准。**

初始化顺序为：延时初始化与优先级分组 → GPIO 时钟和模式 → SYSCFG 来源选择 → EXTI 边沿与使能 → 清遗留请求 → NVIC 优先级与使能。

### 5.2 完整代码

```c
#include "stm32f4xx.h"
#include "delay.h"

/* 中断和主循环共同访问，使用 volatile。 */
static volatile uint8_t key1_press = 0;
static volatile uint8_t key2_press = 0;

/* 沿用用户变量对应：key1=PE2，key2=PE3。uint8_t 在255之后回绕。 */
volatile uint8_t key1_irq_count = 0;
volatile uint8_t key2_irq_count = 0;
volatile uint8_t key1_press_count = 0;
volatile uint8_t key2_press_count = 0;

static void Board_Init(void)
{
    GPIO_InitTypeDef gpio;
    EXTI_InitTypeDef exti;
    NVIC_InitTypeDef nvic;

    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOE |
                          RCC_AHB1Periph_GPIOF, ENABLE);
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_SYSCFG, ENABLE);

    /* PF9 红灯，PF10 绿灯，初始都熄灭。 */
    GPIO_SetBits(GPIOF, GPIO_Pin_9 | GPIO_Pin_10);

    GPIO_StructInit(&gpio);
    gpio.GPIO_Pin = GPIO_Pin_9 | GPIO_Pin_10;
    gpio.GPIO_Mode = GPIO_Mode_OUT;
    gpio.GPIO_OType = GPIO_OType_PP;
    gpio.GPIO_Speed = GPIO_Speed_2MHz;
    gpio.GPIO_PuPd = GPIO_PuPd_NOPULL;
    GPIO_Init(GPIOF, &gpio);

    /* KEY2=PE2，KEY1=PE3，输入上拉。 */
    gpio.GPIO_Pin = GPIO_Pin_2 | GPIO_Pin_3;
    gpio.GPIO_Mode = GPIO_Mode_IN;
    gpio.GPIO_PuPd = GPIO_PuPd_UP;
    GPIO_Init(GPIOE, &gpio);

    SYSCFG_EXTILineConfig(EXTI_PortSourceGPIOE, EXTI_PinSource2);
    SYSCFG_EXTILineConfig(EXTI_PortSourceGPIOE, EXTI_PinSource3);

    EXTI_StructInit(&exti);
    exti.EXTI_Line = EXTI_Line2 | EXTI_Line3;
    exti.EXTI_Mode = EXTI_Mode_Interrupt;
    exti.EXTI_Trigger = EXTI_Trigger_Falling;
    exti.EXTI_LineCmd = ENABLE;
    EXTI_Init(&exti);

    EXTI_ClearITPendingBit(EXTI_Line2 | EXTI_Line3);
    NVIC_ClearPendingIRQ(EXTI2_IRQn);
    NVIC_ClearPendingIRQ(EXTI3_IRQn);

    nvic.NVIC_IRQChannel = EXTI2_IRQn;
    nvic.NVIC_IRQChannelPreemptionPriority = 1;
    nvic.NVIC_IRQChannelSubPriority = 0;
    nvic.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&nvic);

    nvic.NVIC_IRQChannel = EXTI3_IRQn;
    nvic.NVIC_IRQChannelSubPriority = 1;
    NVIC_Init(&nvic);
}

void EXTI2_IRQHandler(void)
{
    if (EXTI_GetITStatus(EXTI_Line2) != RESET)
    {
        EXTI_ClearITPendingBit(EXTI_Line2);
        key1_press = 1;       /* 软件key1：PE2，板上KEY2。 */
        key1_irq_count++;
    }
}

void EXTI3_IRQHandler(void)
{
    if (EXTI_GetITStatus(EXTI_Line3) != RESET)
    {
        EXTI_ClearITPendingBit(EXTI_Line3);
        key2_press = 1;       /* 软件key2：PE3，板上KEY1。 */
        key2_irq_count++;
    }
}

int main(void)
{
    /* 沿用你的定义：0 可接受按下，1 已接受、等待松开。 */
    uint8_t key1_ready = 0;
    uint8_t key2_ready = 0;

    delay_init();
    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
    Board_Init();

    while (1)
    {
        /* key1 是你的软件名称，对应 PE2，即板上的 KEY2。 */
        if (key1_press == 1)
        {
            key1_press = 0;

            if (key1_ready == 0)
            {
                delay_ms(20);

                if (GPIO_ReadInputDataBit(GPIOE, GPIO_Pin_2) == 0)
                {
                    key1_ready = 1;
                    key1_press_count++;
                    GPIO_ToggleBits(GPIOF, GPIO_Pin_9);
                }
            }
        }

        /* 释放检测独立放在主循环中，不依赖新的下降沿通知。 */
        if (key1_ready == 1 &&
            GPIO_ReadInputDataBit(GPIOE, GPIO_Pin_2) == 1)
        {
            delay_ms(20);

            if (GPIO_ReadInputDataBit(GPIOE, GPIO_Pin_2) == 1)
            {
                key1_ready = 0;
                key1_press = 0;
            }
        }

        /* key2 对应 PE3，即板上的 KEY1。 */
        if (key2_press == 1)
        {
            key2_press = 0;

            if (key2_ready == 0)
            {
                delay_ms(20);

                if (GPIO_ReadInputDataBit(GPIOE, GPIO_Pin_3) == 0)
                {
                    key2_ready = 1;
                    key2_press_count++;
                    GPIO_ToggleBits(GPIOF, GPIO_Pin_10);
                }
            }
        }

        if (key2_ready == 1 &&
            GPIO_ReadInputDataBit(GPIOE, GPIO_Pin_3) == 1)
        {
            delay_ms(20);

            if (GPIO_ReadInputDataBit(GPIOE, GPIO_Pin_3) == 1)
            {
                key2_ready = 0;
                key2_press = 0;
            }
        }
    }
}
```
