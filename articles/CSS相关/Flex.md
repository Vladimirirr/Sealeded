# CSS - Flex Layout

CSS 的核心布局方案 —— 弹性布局。

文档：<https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout>

标准：<https://www.w3.org/TR/css-flexbox>

## 概念

Flex 是 Flexible Box 的缩写，一种灵活的一维布局方案（一维指的是，它只能或主要操作着一个方向，行或列，的布局）。

它的主要思想是让容器具备修改（伸长或缩短）其内项目的尺寸，甚至修改某一个项目的展示顺序，从而更好地安排容器的空间分配，这便是 Flexible 弹性 一词的由来。

与之相对，网格布局是二维的，可以自由地操作行和列，并将一个内容选择性的放入到任意一个单元格。

同时网格天生擅长重叠，如果要在 Flex 里发生重叠，需要一些奇技淫巧，比如 `负margin`、`transform`、`定位`、等。

### 轴线

采取 Flex 布局的对象，叫做容器(Flex-Container)，其中的直接子对象，叫做它的项目(Flex-Item)。

容器存在两条轴，一条主轴和一条交叉轴（副轴），交叉轴总是正交主轴。主轴的尺寸即容器的长，交叉轴的尺寸即容器的宽。你只能指定主轴的方向，交叉轴始终是水平向右或垂直向下。项目默认按次地 沿主轴方向排列、沿交叉轴方向换行。

轴的概念很重要，项目对齐的根基都是轴。

### 轴的特性

`*`表示默认值。

#### flex-direction

语法：`flex-direction: row* | row-reverse | column | column-reverse`

主轴方向，与书写方向相关。

- `row`：书写的水平方向
- `row`：书写的水平方向的反方向
- `column`：书写的垂直方向
- `column-reverse`：书写的垂直方向的反方向

#### flex-wrap

语法：`flex-wrap: nowrap* | wrap | wrap-reverse`

指定当主轴空间不足时项目是否需要换行。注意，Flex 是一维的，**这里的换行只是主轴的延续而已**。

当换行发生时，每行都会产生一根主轴（即主轴的延续），这些主轴平分交叉轴上的空间（因此每行主轴也拥有属于它的一段交叉轴），这样每行又好似一个单独的 Flex 容器。

这也正是 MDN 上所描述的：“The flex items can be allowed to wrap, but once they do so, each line becomes a flex container of its own.”

- `nowrap`：项目都放在主轴上，即便已经挤不下了（溢出）
- `wrap`：交叉轴的方向换行
- `wrap-reverse`：交叉轴的反方向换行

#### justify-content

语法：`justify-content: flex-start* | flex-end | center | space-between | space-around | space-evenly`

指定项目如何与主轴对齐。

- `flex-start`：从主轴开始方向放置
- `flex-end`：从主轴结束方向放置
- `center`：放置在中间
- `space-between`：首尾放置在两端，其余的按相同间隔放置
- `space-around`：首位放置在距离各自端的一定间隔，此两端间隔之和与其余的按相同间隔放置的间隔相同
- `space-evenly`：所有都按相同的间隔放置

#### align-items

语法：`align-items: flex-start | flex-end | center | baseline | stretch*`

指定项目如何与交叉轴对齐。

- `flex-start`：对齐至交叉轴开始位置
- `flex-end`：对齐至交叉轴结束位置
- `center`：对齐至交叉轴中间位置
- `baseline`：从交叉轴开始方向找一个位置，此位置能对齐所有项目的 baseline，并对齐至此位置
- `stretch`：未指定尺寸的项目将被拉伸到交叉轴的长度

#### align-content

语法：`align-content: flex-start | flex-end | center | space-between | space-around | space-evenly | stretch*`

与 `align-items` 很容易混淆，`align-content` 决定行与行之间的间隔（多行，因此当只有一行时，它不生效），而 `align-items` 决定的是每条主轴所属的交叉轴上的空间分配。

本质上是控制行之间的空间分配，这个行为在标准里叫做 [Packing Flex Lines](https://www.w3.org/TR/css-flexbox/#align-content-property)。

标准里是这样描述此属性的：

> Packing Flex Lines: The `align-content` Property
> The `align-content` property aligns a flex container's lines within the flex container when there is extra space in the cross-axis, similar to how `justify-content` aligns individual items within the main-axis. Note, this property has no effect on a single-line flex container.

#### flex-flow

`flex-direction` 和 `flex-wrap` 的缩写。

语法：`flex-flow: <flex-direction> <flex-wrap>`

#### 特殊关键字：safe 与 unsafe

### 容器的特性

#### row-gap

指定两两项目水平之间的间隔。

#### column-gap

指定两两项目垂直之间的间隔。

#### gap

`row-gap` 和 `column-gap` 的缩写。

语法：`flex-flow: <row-gap> <column-gap>`

### 项目的特性

#### order

语法：`order: <integer> | 0`

指定此项目的展示顺序。

#### align-self

语法：`align-items: flex-start | flex-end | center | baseline | stretch*`

指定此项目如何与交叉轴对齐，覆盖容器的 `align-items`。

#### flex-grow

语法：`flex-grow: <float >= 0 | 0>`

当主轴方向容器空间足够时，指定此项目的伸长系数。默认值 `0` 表示不伸长。值越大，伸长的越明显。

公式：`此项目的长度 = 此项目之前的长度 + (剩余的长度 / 伸长系数总和 * 此项目的伸长系数)`

#### flex-shrink

语法：`flex-grow: <float >= 0 | 0>`

当主轴方向容器空间不足时，指定此项目的缩短系数。默认值 `0` 表示不缩短。值越大，缩短的越明显。

公式：`此项目的长度 = 此项目之前的长度 - (多出的长度 / 伸长系数总和 * 此项目的伸长系数)`

#### flex-basis

语法：`flex-basic: auto* | content | <length>`

主轴方向的项目的基本尺寸（基本尺寸指的是，此项目在未被伸缩之前的尺寸）。

- `auto`：同下
- `content`：表示参考我的 width 或 height，如果没 width 也没 height，就参考我的实际内容产生的尺寸

它会覆盖通过 width（主轴水平方向时） 或 height（主轴垂直方向时） 设置的项目的尺寸。

其中 `flex-basic: 0` 表示此项目没有自主尺寸，也意味着此项目放弃任何的空间分配（即 `flex-grow/shrink`），此项目的尺寸将由它设置的 `flex-grow` 给定（如果有的话）。

#### flex

缩写：`<flex-grow> <flex-shrink> <flex-basic>`

预定的缩写值：

- `flex: initial = flex: 0 1 auto` 这也是项目的默认值
- `flex: auto = flex: 1 1 auto` 项目在需要的时候可伸可缩
- `flex: none = flex: 0 0 auto` 项目即不能伸也不能缩
- `flex: <integer> = flex: <integer> 1 0` 项目在尺寸 0 的基础上伸缩

## 标准的泛化 - CSS Box Alignment Module

由于 Flex 设计的相当 Nice，而且 Grid 布局的某些参数与 Flex 相似，因此受 Flex 启发并发起了一个独立的与盒模型对齐相关的基础性标准（即 [CSS Box Alignment Module](https://www.w3.org/TR/css-align/)），从此，Flex 和 Grid 将建立在此标准的基础上再发展自身。

因此，Flex 的 `align-items` 出现了诸如 `start`、`end`、等等的属性，它们其实和现存的 `flex-start` 和 `flex-end` 作用一模一样，只不过它是 CSS Box Alignment Module 里定义的。

## 实践

### 骰子的面

对应着一些常见的布局模型。

#### 1

#### 2

#### 3

#### 4

#### 5

#### 6

### 外边距技巧

对项目设置 `auto` 的外边距，会使它填满主轴方向的剩余空间。

### 更多

Flexbox 示例大全：<https://flexboxpatterns.com>

## 兼容性

- Chrome 21 - 2012
- Firefox 28 - 2014
- Safari 6.1 - 2013
- Edge 12 - 2015
- Opera 12.1 - 2012
- IE 10 - 2012
