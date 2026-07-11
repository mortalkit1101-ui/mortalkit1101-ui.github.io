$ErrorActionPreference = 'Stop'

$blogRoot = [IO.Path]::GetFullPath((Get-Location).Path)
$vaultRoot = 'F:\AAAAA\obsidian'
$courseRoot = Join-Path $vaultRoot '学习资料库\01_研究生课程'
$powerRoot = Join-Path $courseRoot '电源硬件与数字电源'
$microwaveRoot = Join-Path $courseRoot '微波工程与电磁场'
$postRoot = Join-Path $blogRoot 'source\_posts\graduate-courses'
$powerPostRoot = Join-Path $postRoot 'power-electronics'
$microwavePostRoot = Join-Path $postRoot 'microwave-engineering'
$imageRoot = Join-Path $blogRoot 'source\img\courses\power-electronics'
$utf8NoBom = New-Object Text.UTF8Encoding($false)

function Write-Utf8File([string]$Path, [string]$Content) {
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  [IO.File]::WriteAllText($Path, ($Content -replace "`r`n", "`n"), $utf8NoBom)
}

function Remove-WorkspacePath([string]$Path) {
  $full = [IO.Path]::GetFullPath($Path)
  if (-not $full.StartsWith($blogRoot, [StringComparison]::OrdinalIgnoreCase) -or $full -eq $blogRoot) {
    throw "Refusing to remove path outside blog workspace: $full"
  }
  if (Test-Path -LiteralPath $full) {
    Remove-Item -LiteralPath $full -Recurse -Force
  }
}

function Convert-Callouts([string]$Content) {
  $labels = @{
    note = '笔记'
    tip = '要点'
    warning = '注意'
    example = '示例'
    summary = '小结'
    info = '说明'
  }
  return [regex]::Replace($Content, '(?m)^> \[!(?<type>note|tip|warning|example|summary|info)\](?<title>[^\r\n]*)$', {
    param($match)
    $label = $labels[$match.Groups['type'].Value]
    $title = $match.Groups['title'].Value.Trim()
    if ($title) { return "> **$label｜$title**" }
    return "> **$label**"
  })
}

function Remove-FirstHeading([string]$Content) {
  return [regex]::Replace($Content, '\A\s*#\s+[^\r\n]+\r?\n+', '', 1)
}

function Remove-OldNavigation([string]$Content) {
  $content = [regex]::Replace($Content, '(?m)^\s*(上一篇|下一篇)：\[\[[^\]]+\]\]\s*$', '')
  return $content.Trim()
}

function New-FrontMatter($Article) {
  $tags = ($Article.Tags | ForEach-Object { "  - $_" }) -join "`n"
  $cover = if ($Article.Cover) { "cover: $($Article.Cover)`n" } else { '' }
  return @"
---
title: $($Article.Title)
date: $($Article.Date)
updated: $($Article.Date)
categories:
  - 研究生课程
  - $($Article.Course)
tags:
$tags
permalink: $($Article.Permalink)
description: $($Article.Description)
${cover}---

"@
}

function New-CourseNavigation($Articles, [int]$Index) {
  $parts = New-Object Collections.Generic.List[string]
  if ($Index -gt 0) {
    $previous = $Articles[$Index - 1]
    $parts.Add("[上一篇：$($previous.Title)](/$($previous.Permalink))")
  }
  $course = $Articles[$Index].Course
  $categoryUrl = '/categories/' + [uri]::EscapeDataString('研究生课程') + '/' + [uri]::EscapeDataString($course) + '/'
  $parts.Add("[返回${course}分类]($categoryUrl)")
  if ($Index -lt ($Articles.Count - 1)) {
    $next = $Articles[$Index + 1]
    $parts.Add("[下一篇：$($next.Title)](/$($next.Permalink))")
  }
  return "`n`n---`n`n**课程导航：** " + ($parts -join ' · ')
}

function Copy-ImageSet($Mappings, [string]$DefaultSourceRoot, [string]$DestinationRoot) {
  foreach ($mapping in $Mappings) {
    $source = if ($mapping.SourcePath) { $mapping.SourcePath } else { Join-Path $DefaultSourceRoot $mapping.Source }
    if (-not (Test-Path -LiteralPath $source)) { throw "Missing image: $source" }
    $destination = Join-Path $DestinationRoot $mapping.Destination
    $parent = Split-Path -Parent $destination
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
  }
}

function Replace-ImageLinks([string]$Content, $Mappings, [string]$WebRoot) {
  foreach ($mapping in $Mappings) {
    $sourceName = [regex]::Escape($mapping.Source)
    $replacement = "![$($mapping.Alt)]($WebRoot/$($mapping.Destination))`n`n*图：$($mapping.Caption)*"
    $content = [regex]::Replace($content, "!\[\[[^\]]*${sourceName}\]\]", [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement })
  }
  return $content
}

Remove-WorkspacePath $postRoot
Remove-WorkspacePath $imageRoot
New-Item -ItemType Directory -Force -Path $powerPostRoot, $microwavePostRoot, $imageRoot | Out-Null

$powerImages01 = @(
  [pscustomobject]@{ Source='Pasted image 20260707172342.png'; Destination='01-introduction/01-01-power-electronics-overview.png'; Alt='电力电子系统概览'; Caption='电力电子系统及其基本组成' },
  [pscustomobject]@{ Source='Pasted image 20260707185729.png'; Destination='01-introduction/01-02-converter-components.png'; Alt='电力电子变换器组成'; Caption='电力电子变换器中的主要器件与功能模块' },
  [pscustomobject]@{ Source='Pasted image 20260707190145.png'; Destination='01-introduction/01-03-energy-flow.png'; Alt='变换器能量流动方向'; Caption='不同变换器中的能量流动方向' },
  [pscustomobject]@{ Source='Pasted image 20260707190314.png'; Destination='01-introduction/01-04-multistage-conversion.png'; Alt='多级电能变换'; Caption='多级电能变换结构示意' },
  [pscustomobject]@{ Source='Pasted image 20260707190514.png'; Destination='01-introduction/01-05-resistor-divider.png'; Alt='电阻分压方案'; Caption='使用电阻分压获得较低输出电压' },
  [pscustomobject]@{ Source='Pasted image 20260707190811.png'; Destination='01-introduction/01-06-linear-regulation.png'; Alt='三极管线性调节方案'; Caption='使用三极管进行线性电压调节' },
  [pscustomobject]@{ Source='Pasted image 20260707190913.png'; Destination='01-introduction/01-07-ideal-switch.png'; Alt='理想开关周期控制'; Caption='理想开关的周期导通与关断' },
  [pscustomobject]@{ Source='Pasted image 20260707191206.png'; Destination='01-introduction/01-08-switched-waveform.png'; Alt='开关输出波形'; Caption='周期性开关控制形成的输出波形' },
  [pscustomobject]@{ Source='Pasted image 20260707191442.png'; Destination='01-introduction/01-09-converter-model.png'; Alt='电力电子变换器模型'; Caption='加入储能元件后的变换器模型' }
)

$powerImages02 = @(
  [pscustomobject]@{ Source='Pasted image 20260708164034.png'; Destination='02-power-diode/02-01-pn-carriers.png'; Alt='PN 结载流子分布'; Caption='P 型与 N 型半导体接触前后的载流子分布' },
  [pscustomobject]@{ Source='Pasted image 20260708164425.png'; Destination='02-power-diode/02-02-depletion-region.png'; Alt='PN 结耗尽层'; Caption='PN 结形成后的耗尽层与空间电荷区' },
  [pscustomobject]@{ Source='Pasted image 20260708164526.png'; Destination='02-power-diode/02-03-forward-bias.png'; Alt='PN 结正向偏置'; Caption='正向偏置削弱内建电场' },
  [pscustomobject]@{ Source='Pasted image 20260708165059.png'; Destination='02-power-diode/02-04-reverse-bias.png'; Alt='PN 结反向偏置'; Caption='反向偏置增强内建电场' },
  [pscustomobject]@{ Source='Pasted image 20260708171402.png'; Destination='02-power-diode/02-05-junction-capacitance.png'; Alt='PN 结结电容'; Caption='势垒电容与扩散电容示意' },
  [pscustomobject]@{ Source='Pasted image 20260708172013.png'; Destination='02-power-diode/02-06-power-diode-structure.png'; Alt='功率二极管结构'; Caption='功率二极管的基本层结构' },
  [pscustomobject]@{ Source='Pasted image 20260708182716.png'; Destination='02-power-diode/02-07-drift-region.png'; Alt='功率二极管漂移区'; Caption='轻掺杂漂移区在功率二极管中的位置' },
  [pscustomobject]@{ Source='Pasted image 20260708182853.png'; Destination='02-power-diode/02-08-reverse-blocking.png'; Alt='功率二极管反向阻断'; Caption='反向偏置时耗尽层向漂移区扩展' },
  [pscustomobject]@{ Source='Pasted image 20260708182918.png'; Destination='02-power-diode/02-09-forward-conduction.png'; Alt='功率二极管正向导通'; Caption='正向偏置时的载流子注入与导通过程' },
  [pscustomobject]@{ Source='Pasted image 20260708183520.png'; Destination='02-power-diode/02-10-polarity.png'; Alt='二极管极性与偏置'; Caption='二极管阳极、阴极与偏置方向' },
  [pscustomobject]@{ Source='Pasted image 20260708184227.png'; Destination='02-power-diode/02-11-reverse-characteristic.png'; Alt='功率二极管反向特性'; Caption='功率二极管的反向伏安特性' },
  [pscustomobject]@{ Source='Pasted image 20260708185347.png'; Destination='02-power-diode/02-12-forward-characteristic.png'; Alt='功率二极管正向特性'; Caption='功率二极管的正向伏安特性' },
  [pscustomobject]@{ Source='Pasted image 20260708190543.png'; Destination='02-power-diode/02-13-switching-states.png'; Alt='功率二极管开关状态'; Caption='功率二极管在不同开关状态间的转换' },
  [pscustomobject]@{ Source='Pasted image 20260708190840.png'; Destination='02-power-diode/02-14-forward-recovery.png'; Alt='功率二极管正向恢复'; Caption='从反向阻断切换到正向导通的恢复过程' },
  [pscustomobject]@{ Source='Pasted image 20260708191428.png'; Destination='02-power-diode/02-15-reverse-recovery-current.png'; Alt='功率二极管反向恢复电流'; Caption='从正向导通切换到反向阻断时的恢复电流' },
  [pscustomobject]@{ Source='Pasted image 20260708191644.png'; Destination='02-power-diode/02-16-reverse-recovery-waveform.png'; Alt='功率二极管反向恢复波形'; Caption='完整的反向恢复过程波形' },
  [pscustomobject]@{ Source='Pasted image 20260708192222.png'; Destination='02-power-diode/02-17-recovery-detail-a.png'; Alt='反向恢复过程补充图一'; Caption='反向恢复过程的细节示意之一' },
  [pscustomobject]@{ Source='Pasted image 20260708192452.png'; Destination='02-power-diode/02-18-recovery-detail-b.png'; Alt='反向恢复过程补充图二'; Caption='反向恢复过程的细节示意之二' },
  [pscustomobject]@{ Source='02-功率二极管-P2并联问题.png'; Destination='02-power-diode/02-19-parallel-current-sharing.png'; Alt='功率二极管并联均流问题'; Caption='功率二极管并联时的电流分配与热失控风险' }
)

$bjtImages = @(
  [pscustomobject]@{ Source='Pasted image 20260709172532.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709172532.png'); Destination='03-bjt/03-01-npn-layer-structure.png'; Alt='NPN 三极管层结构'; Caption='NPN 三极管由 N 型发射区、P 型基区和 N 型集电区构成' },
  [pscustomobject]@{ Source='Pasted image 20260709172721.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709172721.png'); Destination='03-bjt/03-02-single-bias.png'; Alt='NPN 三极管单一偏置状态'; Caption='仅施加单一偏置时，两个 PN 结不能同时满足放大区工作条件' },
  [pscustomobject]@{ Source='Pasted image 20260709173629.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709173629.png'); Destination='03-bjt/03-03-active-bias.png'; Alt='NPN 三极管有源区偏置'; Caption='发射结正偏、集电结反偏时的载流子运动' },
  [pscustomobject]@{ Source='Pasted image 20260709174401.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709174401.png'); Destination='03-bjt/03-04-water-flow-analogy.png'; Alt='NPN 三极管水流类比'; Caption='用水流和闸门直观理解基极电流对集电极电流的控制' },
  [pscustomobject]@{ Source='Pasted image 20260709181630.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709181630.png'); Destination='03-bjt/03-05-power-bjt-structure.png'; Alt='功率 BJT 纵向结构'; Caption='功率 BJT 的纵向多层结构' },
  [pscustomobject]@{ Source='Pasted image 20260709181929.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709181929.png'); Destination='03-bjt/03-06-bjt-symbols.png'; Alt='NPN 与 PNP 三极管符号'; Caption='NPN 与 PNP 三极管的端子和电路符号' },
  [pscustomobject]@{ Source='Pasted image 20260709183125.png'; SourcePath=(Join-Path $vaultRoot 'Pasted image 20260709183125.png'); Destination='03-bjt/03-07-input-characteristic.png'; Alt='功率 BJT 输入特性曲线'; Caption='不同 u_CE 条件下 i_B 与 u_BE 的关系' }
)

$assetSource = Join-Path $powerRoot 'assets'
Copy-ImageSet $powerImages01 $assetSource $imageRoot
Copy-ImageSet $powerImages02 $assetSource $imageRoot
Copy-ImageSet $bjtImages $vaultRoot $imageRoot

$powerArticles = @(
  [pscustomobject]@{ Source='电源硬件研发与数字电源一年半学习路线.md'; Output='learning-roadmap.md'; Title='电源硬件研发与数字电源一年半学习路线'; Slug='learning-roadmap'; Permalink='courses/power-electronics/learning-roadmap/'; Course='电源硬件与数字电源'; Tags=@('学习路线','电源硬件','数字电源'); Description='面向电源硬件研发与数字电源方向的一年半学习路线。'; Cover=$null },
  [pscustomobject]@{ Source='01 电力电子绪论.md'; Output='01-introduction.md'; Title='01 电力电子绪论'; Slug='01-introduction'; Permalink='courses/power-electronics/01-introduction/'; Course='电源硬件与数字电源'; Tags=@('电力电子','功率变换'); Description='电力电子变换器的基本概念、分类、能量流动和开关型变换思想。'; Cover='/img/courses/power-electronics/01-introduction/01-01-power-electronics-overview.png' },
  [pscustomobject]@{ Source='02 功率二极管.md'; Output='02-power-diode.md'; Title='02 功率二极管'; Slug='02-power-diode'; Permalink='courses/power-electronics/02-power-diode/'; Course='电源硬件与数字电源'; Tags=@('功率二极管','PN结','电力电子器件'); Description='功率二极管的 PN 结基础、结构、静态特性与动态恢复过程。'; Cover='/img/courses/power-electronics/02-power-diode/02-06-power-diode-structure.png' },
  [pscustomobject]@{ Source='03 双极结型晶体管BJT.md'; Output='03-bjt.md'; Title='03 双极结型晶体管 BJT'; Slug='03-bjt'; Permalink='courses/power-electronics/03-bjt/'; Course='电源硬件与数字电源'; Tags=@('BJT','功率晶体管','电力电子器件'); Description='NPN 型三极管的基本工作原理、功率 BJT 结构与输入特性笔记。'; Cover='/img/courses/power-electronics/03-bjt/03-05-power-bjt-structure.png' }
)

$microwaveDefinitions = @(
  @('00_学习计划.md','00-study-plan.md','00 微波工程与工程电磁场学习计划','00-study-plan','学习计划','课程学习安排与阶段目标。'),
  @('01_微波工程学习框架.md','01-learning-framework.md','01 微波工程学习框架','01-learning-framework','微波工程','微波工程知识结构与学习主线。'),
  @('02_场与电位基础.md','02-field-and-potential.md','02 场、电位与高斯定律','02-field-and-potential','电磁场','场、电位与高斯定律的基础关系。'),
  @('03_静电边界条件与电容.md','03-electrostatic-boundary-and-capacitance.md','03 静电边界条件与电容','03-electrostatic-boundary-and-capacitance','静电场','静电边界条件、电容及相关计算。'),
  @('04_恒定磁场与电感.md','04-static-magnetic-field-and-inductance.md','04 恒定磁场与电感','04-static-magnetic-field-and-inductance','磁场','恒定磁场与电感的核心概念。'),
  @('05_Maxwell方程与时变场.md','05-maxwell-equations.md','05 Maxwell 方程与时变场','05-maxwell-equations','Maxwell方程','Maxwell 方程组与时变电磁场。'),
  @('06_平面电磁波.md','06-plane-waves.md','06 平面电磁波','06-plane-waves','电磁波','平面电磁波的传播与基本参数。'),
  @('07_均匀传输线.md','07-uniform-transmission-lines.md','07 均匀传输线','07-uniform-transmission-lines','传输线','均匀传输线模型与基本方程。'),
  @('08_波导与谐振腔.md','08-waveguides-and-cavities.md','08 波导与谐振腔','08-waveguides-and-cavities','波导','波导模式与谐振腔基础。'),
  @('09_微波电磁理论.md','09-microwave-electromagnetics.md','09 微波电磁理论','09-microwave-electromagnetics','微波理论','微波频段中的电磁理论基础。'),
  @('10_微波传输线理论.md','10-microwave-transmission-lines.md','10 微波传输线理论','10-microwave-transmission-lines','微波传输线','微波传输线的分析方法。'),
  @('11_传输线和波导.md','11-transmission-lines-and-waveguides.md','11 传输线和波导','11-transmission-lines-and-waveguides','传输线','传输线与波导的联系和区别。'),
  @('12_微波网络分析.md','12-microwave-network-analysis.md','12 微波网络分析','12-microwave-network-analysis','微波网络','散射参数与微波网络分析。'),
  @('13_阻抗匹配和调谐.md','13-impedance-matching.md','13 阻抗匹配和调谐','13-impedance-matching','阻抗匹配','阻抗匹配与调谐方法。'),
  @('14_微波谐振器.md','14-microwave-resonators.md','14 微波谐振器','14-microwave-resonators','谐振器','微波谐振器的参数与结构。'),
  @('15_功分器与定向耦合器.md','15-power-dividers-and-couplers.md','15 功分器与定向耦合器','15-power-dividers-and-couplers','微波器件','功分器与定向耦合器基础。'),
  @('16_微波滤波器.md','16-microwave-filters.md','16 微波滤波器','16-microwave-filters','微波滤波器','微波滤波器的基本理论与实现。'),
  @('17_微波系统与选学专题.md','17-microwave-systems.md','17 微波系统与选学专题','17-microwave-systems','微波系统','微波系统分析与后续选学方向。')
)

$microwaveArticles = @()
foreach ($definition in $microwaveDefinitions) {
  $microwaveArticles += [pscustomobject]@{
    Source=$definition[0]
    Output=$definition[1]
    Title=$definition[2]
    Slug=$definition[3]
    Permalink="courses/microwave-engineering/$($definition[3])/"
    Course='微波工程与电磁场'
    Tags=@('微波工程','电磁场',$definition[4])
    Description=$definition[5]
    Cover=$null
  }
}

for ($i = 0; $i -lt $powerArticles.Count; $i++) {
  $article = $powerArticles[$i]
  $sourcePath = Join-Path $powerRoot $article.Source
  $article | Add-Member -NotePropertyName Date -NotePropertyValue ((Get-Item -LiteralPath $sourcePath).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
  if ($article.Slug -eq '03-bjt') { continue }
  $body = [IO.File]::ReadAllText($sourcePath, [Text.Encoding]::UTF8)
  $body = Remove-FirstHeading $body
  $body = Remove-OldNavigation $body
  $body = Convert-Callouts $body
  if ($article.Slug -eq '01-introduction') {
    $body = Replace-ImageLinks $body $powerImages01 '/img/courses/power-electronics'
  }
  if ($article.Slug -eq '02-power-diode') {
    $body = Replace-ImageLinks $body $powerImages02 '/img/courses/power-electronics'
  }
  $output = (New-FrontMatter $article) + $body.Trim() + (New-CourseNavigation $powerArticles $i) + "`n"
  Write-Utf8File (Join-Path $powerPostRoot $article.Output) $output
}

$bjtArticle = $powerArticles[3]
$bjtBody = @'
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
'@
$bjtOutput = (New-FrontMatter $bjtArticle) + $bjtBody.Trim() + (New-CourseNavigation $powerArticles 3) + "`n"
Write-Utf8File (Join-Path $powerPostRoot $bjtArticle.Output) $bjtOutput

for ($i = 0; $i -lt $microwaveArticles.Count; $i++) {
  $article = $microwaveArticles[$i]
  $sourcePath = Join-Path $microwaveRoot $article.Source
  $article | Add-Member -NotePropertyName Date -NotePropertyValue ((Get-Item -LiteralPath $sourcePath).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
  $body = [IO.File]::ReadAllText($sourcePath, [Text.Encoding]::UTF8)
  $body = Remove-FirstHeading $body
  $body = Remove-OldNavigation $body
  $body = Convert-Callouts $body
  $output = (New-FrontMatter $article) + $body.Trim() + (New-CourseNavigation $microwaveArticles $i) + "`n"
  Write-Utf8File (Join-Path $microwavePostRoot $article.Output) $output
}

$coursePage = Join-Path $blogRoot 'source\courses'
Remove-WorkspacePath $coursePage

$legacyResources = Join-Path $blogRoot 'source\resources\graduate-courses'
Remove-WorkspacePath $legacyResources
$resourcesParent = Split-Path -Parent $legacyResources
if ((Test-Path -LiteralPath $resourcesParent) -and -not (Get-ChildItem -LiteralPath $resourcesParent -Force)) {
  Remove-WorkspacePath $resourcesParent
}

$configPath = Join-Path $blogRoot '_config.yml'
$config = [IO.File]::ReadAllText($configPath, [Text.Encoding]::UTF8)
$config = [regex]::Replace($config, '(?ms)^skip_render:\r?\n(?:  - [^\r\n]+\r?\n)+\r?', '')
Write-Utf8File $configPath $config

[pscustomobject]@{
  PowerArticles = $powerArticles.Count
  MicrowaveArticles = $microwaveArticles.Count
  TotalArticles = $powerArticles.Count + $microwaveArticles.Count
  Images = $powerImages01.Count + $powerImages02.Count + $bjtImages.Count
  Placement = 'normal-blog-flow'
}
