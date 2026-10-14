---
title: 03 TIM定时中断
date: 2026-10-14 22:05:21
tags:
  - TIM
categories:
  - 嵌入式
published: true
---

## 1. TIM 定时中断简介

TIM（Timer）是片内定时器。本文沿用**正点原子探索者 STM32F407ZGT6 V3 开发板**、STM32F4 标准外设库（SPL V1.4.0）和现有 168 MHz 时钟模板，用 TIM6 每隔 500 ms 产生一次更新中断，翻转 PF9 红灯。红灯亮 500 ms、灭 500 ms，完整亮灭周期为 1 s。PF10 绿灯保持熄灭。

EXTI 由外部引脚边沿提出中断请求；TIM6 由片内计数器溢出提出请求。两者随后都经过 NVIC、向量表和中断服务函数。**TIM6 自动计数，主循环无须用 `delay_ms` 等待 500 ms。**

### 1.1 从时钟到 LED 翻转

```text
HSE 8 MHz
  ↓ PLL
HCLK 168 MHz
  ↓ APB1 /4
PCLK1 42 MHz
  ↓ F407 定时器时钟规则：×2
TIM6CLK 84 MHz
  ↓ PSC 分频
CNT 向上计数
  ↓ 超过 ARR，回到 0
更新事件，UIF=1
  ↓ UIE 与 NVIC 均已开启
TIM6_DAC_IRQHandler
  ↓ 清 UIF，翻转 PF9
```

TIM6 使用内部时钟计数，没有外部 TIM 输入引脚，也不需要 SYSCFG/EXTI 映射。PF9 是普通 GPIO 输出：CPU 在中断函数里翻转它，TIM6 没有直接向 PF9 输出波形。TIM6 是基本定时器，没有 PWM 输出通道。

### 1.2 探索者 V3 的时钟与 LED

V3 原理图第 2 页的 Y2 是 8 MHz 晶振；第 5 页的 LED0/DS0 为 PF9 红灯，LED1/DS1 为 PF10 绿灯，两灯均为**低电平点亮**。本实验先将 PF9/PF10 输出高电平，使两灯熄灭，然后只翻转 PF9。引脚与有效电平也与资料盘配套 LED 源码相符。

| 项目 | 当前模板或板卡数值 | 用途 |
| --- | ---: | --- |
| HSE | 8 MHz | PLL 输入源 |
| SYSCLK、HCLK | 168 MHz | 系统与 AHB 时钟 |
| PCLK1 | 42 MHz | APB1 总线时钟 |
| TIM6CLK | 84 MHz | TIM6 预分频器输入 |
| LED0/DS0 | PF9 | 红灯，低电平亮 |
| LED1/DS1 | PF10 | 绿灯，低电平亮 |

## 2. RCC 时钟树与关键寄存器

RCC（Reset and Clock Control）负责选择时钟源、PLL 倍频与分频、总线分频、外设时钟使能和外设复位。使用 TIM6 前，既要让系统有时钟，也要打开 TIM6 的外设时钟开关。

### 2.1 本模板的系统时钟

当前 `SYSTEM/system_stm32f4xx.c` 使用 HSE=8 MHz，主 PLL 参数 $M=8$、$N=336$、$P=2$、$Q=7$。系统时钟由 $P$ 分支得到：

$$
f_{\mathrm{VCO}}=\frac{8\,\mathrm{MHz}}{8}\times336=336\,\mathrm{MHz}
$$

$$
f_{\mathrm{SYSCLK}}=\frac{f_{\mathrm{VCO}}}{2}=168\,\mathrm{MHz}
$$

$Q$ 分支为 $336/7=48\,\mathrm{MHz}$，不参与本次 TIM6 的计数频率计算。PLL 内部的 336 MHz 也不是 CPU 的运行频率。

AHB 不分频，故 HCLK=168 MHz；APB1 四分频，故 PCLK1=42 MHz；APB2 二分频，故 PCLK2=84 MHz。

### 2.2 为什么 APB1 是 42 MHz，TIM6 却是 84 MHz

“TIM6 挂在 APB1”表示 CPU 通过 APB1 访问其寄存器；**APB1 的总线时钟**与**驱动 TIM6 计数部分的时钟**需要区分。STM32F407 的 RCC 硬件规则为：对应 APB 分频为 1 时，定时器时钟等于 PCLK；分频不为 1 时，定时器时钟等于对应 PCLK 的两倍。[ST RM0090 第 7.2 节](https://www.st.com/resource/en/reference_manual/dm00031020-stm32f405-407-415-417-437-455-469-application-note-stmicroelectronics.pdf)给出了该规则。

$$
f_{\mathrm{TIMx}}=
\begin{cases}
f_{\mathrm{PCLKx}},&\text{对应 APB 分频为 1}\\
2f_{\mathrm{PCLKx}},&\text{对应 APB 分频不为 1}
\end{cases}
$$

当前 APB1 为四分频，因此 $f_{\mathrm{TIM6}}=2\times42\,\mathrm{MHz}=84\,\mathrm{MHz}$。这一倍频由硬件时钟路径完成，不需要给 TIM6 再配置一个 PLL；APB1 总线本身仍是 42 MHz。这个规则只应用于相应定时器，不能把 APB1 上的所有外设时钟都乘二。

### 2.3 RCC 相关寄存器与库函数

| 寄存器或字段 | 作用 | 本实验的对应操作 |
| --- | --- | --- |
| `RCC_CR` | 开启 HSE、PLL 并读取就绪状态 | 启动阶段已完成 |
| `RCC_PLLCFGR` | 设置 PLL 的 M/N/P/Q | 模板已设置 |
| `RCC_CFGR` | 选择 SYSCLK 来源，设置 AHB/APB 分频 | 模板已设置 |
| `RCC_AHB1ENR.GPIOFEN` | 打开 GPIOF 的时钟 | `RCC_AHB1PeriphClockCmd` |
| `RCC_APB1ENR.TIM6EN` | 打开 TIM6 的时钟 | `RCC_APB1PeriphClockCmd` |

启动文件已在进入 `main` 前调用 `SystemInit()`。`SystemCoreClockUpdate()` 只是按寄存器设置和已知时钟源频率刷新软件变量 `SystemCoreClock`，不会重新设置硬件，也不是实测晶振频率。代码检查该变量是否为 168 MHz；若不是，两灯常亮并停在检查分支。本检查基于当前固定模板，不能单独证明全部 APB 分频都正确。

## 3. TIM6 时间基准与寄存器

TIM6 是 16 位基本定时器，按“输入时钟 → PSC → CNT → ARR”工作。它只能向上计数，适合生成周期时间基准。[ST RM0090 第 20 章](https://www.st.com/resource/en/reference_manual/dm00031020-stm32f405-407-415-417-437-455-469-application-note-stmicroelectronics.pdf)说明了计数、更新事件和寄存器行为。

### 3.1 PSC、CNT 与 ARR

| 寄存器 | 含义 | 本实验 |
| --- | --- | ---: |
| `TIM6_PSC` | 预分频值，实际除数为 PSC+1 | 8399 |
| `TIM6_CNT` | 硬件当前计数值 | 从 0 向上数 |
| `TIM6_ARR` | 一轮计数的上限 | 4999 |

PSC=0 表示除以 1，PSC=1 表示除以 2。因而：

$$
f_{\mathrm{CNT}}=\frac{f_{\mathrm{TIM6}}}{PSC+1}
$$

CNT 从 0 数到 ARR，下一次回到 0；一轮共经过 **ARR+1 个计数间隔**。正常连续向上计数时：

$$
\boxed{T_{\mathrm{update}}=\frac{(PSC+1)(ARR+1)}{f_{\mathrm{TIM6}}}}
$$

这里 $T_{\mathrm{update}}$ 是相邻两次正常溢出更新事件之间的时间。`EGR.UG` 也能主动产生更新事件，因此看到“更新事件”不一定说明已经经过一个完整周期。

TIM6 的 PSC/ARR 都是 16 位。特别要注意，TIM6 的 ARR=0 会阻止计数，不能把它当作普通的单计数周期。

### 3.2 先确定目标时间，再选择计数频率

设计新定时时，先知道想要的目标周期 $T$，再选择计数器“一格”的时长，因而得到 $f_{\mathrm{CNT}}$；之后依次求 PSC、ARR，最后反算实际周期检查。**给定 TIM6CLK 和目标周期，$f_{\mathrm{CNT}}$ 并没有唯一答案。**

以本实验目标 $T=500\,\mathrm{ms}$ 为例，选择一格为 $100\,\mu\mathrm{s}$，因此 $f_{\mathrm{CNT}}=10\,\mathrm{kHz}$：

$$
PSC=\frac{84\,000\,000}{10\,000}-1=8399
$$

$$
ARR=T\,f_{\mathrm{CNT}}-1
=0.5\times10\,000-1=4999
$$

回代：$(8399+1)(4999+1)/84\,000\,000=0.5\,\mathrm{s}$。选一格为 $10\,\mu\mathrm{s}$ 也可以，但会得到另一组合法的 PSC/ARR。选值时要检查两者为合法整数、在 16 位范围内，并确保 TIM6 的 ARR 非零。

再看一个 20 ms 更新例子，同样使用 84 MHz 输入：

| 选择的一格时长 | $f_{\mathrm{CNT}}$ | PSC | ARR | 实际更新周期 |
| --- | ---: | ---: | ---: | ---: |
| 100 μs | 10 kHz | 8399 | 199 | 20 ms |
| 10 μs | 100 kHz | 839 | 1999 | 20 ms |

两组参数都每 20 ms 更新一次，若每次更新都触发中断，均为每秒 50 次。提高 $f_{\mathrm{CNT}}$ 后，每计一次数代表的时间从 100 μs 缩短到 10 μs，因此设置周期的时间步长更细；它可以减小目标时间不能整除计数间隔时的量化误差，但不会提高时钟源本身的准确度。代价是单次可设置的最长周期缩短：TIM6 的 ARR 为 16 位，最大取 65535；10 kHz 时最长为 $65536/10000=6.5536$ s，100 kHz 时最长为 $65536/100000=0.65536$ s。选 PSC 和 ARR 时，要同时兼顾时间分辨率与 ARR 范围。

若 PSC、ARR 已经给定，则顺序反过来：先用 PSC 求**实际** $f_{\mathrm{CNT}}$，再用 $(ARR+1)/f_{\mathrm{CNT}}$ 求实际 $T$。不能在不知道目标时间或 PSC 的情况下，单凭 84 MHz 唯一“算出” $f_{\mathrm{CNT}}$。

### 3.3 更新事件与中断开关

| 位或寄存器 | 作用 |
| --- | --- |
| `TIM6_CR1.CEN` | 允许 CNT 开始计数 |
| `TIM6_DIER.UIE` | 允许更新事件提出中断请求 |
| `TIM6_SR.UIF` | 记录更新事件已发生 |
| `TIM6_EGR.UG` | 软件主动产生更新，装载缓冲参数 |
| NVIC 的 `TIM6_DAC_IRQn` | 允许 CPU 响应该 IRQ |

打开 TIM6 时钟、启动 CNT、开启 UIE、使能 NVIC 是不同步骤。CNT 能变化，只能说明计数已经运行，不能证明 CPU 一定会进入中断。

标准库 `TIM_TimeBaseInit()` 在本版实现中写入 `EGR.UG`，使缓冲的 PSC 在启动前生效；默认设置下这也可能置 UIF。因而本实验**先清初始化留下的 UIF，再允许中断请求并启动计数**，避免一启动就处理一次“并未经过 500 ms”的更新。

EXTI 的 PR 是**写 1 清**，TIM 的 SR.UIF 是**写 0 清**。代码使用 `TIM_ClearITPendingBit()` 按 TIM 的规则清除；只清 NVIC pending 不能代替清 UIF。

## 4. NVIC、中断函数与实验验收

### 4.1 从更新请求到中断服务函数

正常溢出后，TIM6 设置 UIF；若 UIE 和 NVIC 通道均已开启，CPU 在允许响应时通过向量表进入 `TIM6_DAC_IRQHandler()`。函数检查更新源、清 UIF、增加调试计数并翻转 PF9，随后返回原程序。

| 名称 | 含义 |
| --- | --- |
| `TIM6` | 定时器外设实例 |
| `RCC_APB1Periph_TIM6` | RCC 外设时钟开关选择 |
| `TIM_IT_Update` | TIM6 更新中断源 |
| `TIM6_DAC_IRQn` | NVIC IRQ 通道 |
| `TIM6_DAC_IRQHandler` | 向量表对应的函数符号 |

TIM6 与 DAC 错误中断共用入口，函数名因此包含 DAC。本实验没有启用 DAC 中断，仅处理 TIM6 更新源；若后续同时启用 DAC 中断，应在共享入口分别检查与清除来源。

本实验使用 `NVIC_PriorityGroup_2`，TIM6 的抢占优先级为 1、子优先级为 0。初始化完成后，主循环即使为空，TIM6 也会继续计数。ISR 中不调用 `delay_ms` 或 `delay_us`，不叠加另一套 SysTick 中断时基。

`timer_irq_count` 用于 Keil Watch 观察实际处理的中断次数。`volatile` 保留异步访问所需的读写，但不提供原子性；本例只有 ISR 增加它，main 不清零或读改写。UIF 是一位标志，不是事件队列；长时间阻止中断处理时，多次更新可能合并成一次待处理请求。

### 4.2 下载与验收

| 配置 | TIM6 更新间隔 | PF9 红灯完整亮灭周期 |
| --- | ---: | ---: |
| PSC=8399，ARR=4999 | 500 ms | 1 s |
| PSC=8399，ARR=2499 | 250 ms | 500 ms |
| PSC=8399，ARR=9999 | 1 s | 2 s |

**每次中断只翻转一次 LED，所以完整的“亮→灭→再亮”需要两次更新。**正常运行时 PF10 绿灯应一直熄灭；连续观察约 10 s，红灯应完成约 10 个亮灭周期。修改 ARR 后需重新编译、下载。Keil Watch 中的计数正常约每秒增加 2，但断点暂停 CPU 会改变观察条件，不能用暂停后的数值直接作连续时间测量。

| 现象 | 优先检查 |
| --- | --- |
| 两灯一直亮 | `SystemCoreClock` 未通过 168 MHz 检查，检查 HSE/PLL |
| 两灯一直灭 | TIM6 时钟、CEN、UIE、NVIC、ISR 名称及程序是否已下载运行 |
| 一启动就翻转一次 | 初始化时的 UG 之后是否清过 UIF |
| 反复进入中断 | TIM6 UIF 或共享入口其他来源是否正确清除 |
| 周期相差一倍 | 混用 PCLK1=42 MHz、TIM6CLK=84 MHz，或把翻转间隔当成完整闪烁周期 |
| 编译出现重复定义 | `main.c` 与 `stm32f4xx_it.c` 是否同时定义相同 ISR |

以下程序由当前标准库模板复制建立的独立教学工程编译，Keil / AC6 V6.7 结果为 0 错误、0 警告；生成 AXF/HEX。**尚未下载到开发板，也未取得实测定时证据。**程序只作最小 TIM6 中断实验，之后学习 PWM 会使用具备输出通道的定时器。

## 5. 代码部分

### 5.1 初始化顺序

`SystemInit` 已由启动文件调用。`main` 刷新 `SystemCoreClock`、初始化 PF9/PF10，检查现有模板时钟，然后设置 NVIC 优先级分组并启动 TIM6。定时器初始化内部按“开时钟 → 时间基准参数 → 清初始化标志 → 开 UIE → 开 NVIC → 开 CEN”执行。

`TIM_TimeBaseInitTypeDef` 是标准库定义的配置结构体；`tim.TIM_Prescaler` 是其中一项，`&tim` 是把其地址交给库函数。本版库对 TIM6 不应用公共结构体里的 `TIM_CounterMode`、`TIM_ClockDivision`、`TIM_RepetitionCounter` 字段；TIM6 的计数分频由 PSC 决定。`GPIO_Speed_2MHz` 也不决定 LED 的闪烁频率。

### 5.2 完整代码

```c
#include "stm32f4xx.h"

/* Written only in the ISR; main does not clear it. Watch it in Keil. */
volatile uint32_t timer_irq_count = 0;

void LED_Init(void)
{
    GPIO_InitTypeDef gpio;

    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOF, ENABLE);
    /* Explorer V3: PF9 red, PF10 green, active low. */
    GPIO_SetBits(GPIOF, GPIO_Pin_9 | GPIO_Pin_10);

    GPIO_StructInit(&gpio);
    gpio.GPIO_Pin = GPIO_Pin_9 | GPIO_Pin_10;
    gpio.GPIO_Mode = GPIO_Mode_OUT;
    gpio.GPIO_OType = GPIO_OType_PP;
    gpio.GPIO_Speed = GPIO_Speed_2MHz;
    gpio.GPIO_PuPd = GPIO_PuPd_NOPULL;
    GPIO_Init(GPIOF, &gpio);
}

void TIM6_Init(void)
{
    TIM_TimeBaseInitTypeDef tim;
    NVIC_InitTypeDef nvic;

    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM6, ENABLE);
    TIM_DeInit(TIM6);

    /* TIM6 clock = 84 MHz with this template's APB1 /4. */
    TIM_TimeBaseStructInit(&tim);
    tim.TIM_Prescaler = 8400 - 1;    /* 84 MHz / 8400 = 10 kHz */
    tim.TIM_Period = 5000 - 1;       /* 5000 / 10 kHz = 0.5 s */
    tim.TIM_CounterMode = TIM_CounterMode_Up;
    tim.TIM_ClockDivision = TIM_CKD_DIV1;
    tim.TIM_RepetitionCounter = 0;
    TIM_TimeBaseInit(TIM6, &tim);

    /* TimeBaseInit generates UG and can set UIF. Clear it before UIE. */
    TIM_ClearITPendingBit(TIM6, TIM_IT_Update);
    NVIC_ClearPendingIRQ(TIM6_DAC_IRQn);

    TIM_ITConfig(TIM6, TIM_IT_Update, ENABLE);

    nvic.NVIC_IRQChannel = TIM6_DAC_IRQn;
    nvic.NVIC_IRQChannelPreemptionPriority = 1;
    nvic.NVIC_IRQChannelSubPriority = 0;
    nvic.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&nvic);

    TIM_Cmd(TIM6, ENABLE);
}

void TIM6_DAC_IRQHandler(void)
{
    if (TIM_GetITStatus(TIM6, TIM_IT_Update) != RESET)
    {
        TIM_ClearITPendingBit(TIM6, TIM_IT_Update);
        timer_irq_count++;
        GPIO_ToggleBits(GPIOF, GPIO_Pin_9);
    }
}

int main(void)
{
    /* Startup has already called SystemInit(). */
    SystemCoreClockUpdate();
    LED_Init();

    /* This lesson assumes the existing 168/42/84 MHz clock tree. */
    if (SystemCoreClock != 168000000U)
    {
        GPIO_ResetBits(GPIOF, GPIO_Pin_9 | GPIO_Pin_10);
        while (1)
        {
            /* Both LEDs on: inspect HSE/PLL before timing experiments. */
        }
    }

    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
    TIM6_Init();

    while (1)
    {
        /* TIM6 counts in hardware; no delay or polling is needed here. */
    }
}
```
