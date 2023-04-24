# CSS - Flex Layout

CSS 的核心布局方案 —— 弹性布局。

## 概念

Flex 是一维布局方案，指的是，它一次只能处理水平或垂直一个方向上项目的排列，而 Grid 能同时处理水平和垂直两个方向。

### 轴线

采取 Flex 布局的对象，叫做容器(Flex-Container)，其中的直接子对象，叫做它的项目(Flex-Item)。

容器存在两条轴，一条主轴和一条交叉轴（副轴），交叉轴总是正交主轴。主轴的尺寸即容器的长，交叉轴的尺寸即容器的宽。

项目默认按次地 沿主轴方向排列、沿交叉轴方向换行。

### 轴的特性

`*`表示默认值。

#### flex-direction

语法：`flex-direction: row* | row-reverse | column | column-reverse`

#### flex-wrap

语法：`flex-wrap: nowrap* | wrap | wrap-reverse`

#### justify-content

语法：`justify-content: flex-start* | flex-end | center | space-between | space-around | space-evenly`

#### align-items

语法：`align-items: flex-start | flex-end | center | baseline | stretch*`

#### align-content

语法：`align-content: flex-start* | flex-end | center | space-between | space-around | space-evenly | stretch`

### 项目的特性

#### order

#### align-self

#### flex-grow

#### flex-shrink

#### flex-basis

#### flex

## 实践

骰子的一些面，也对应着一些常见的布局模型。

### 1

### 2

### 3

### 4

### 5

### 6

## 兼容性

- Chrome 21 - 2012
- Firefox 28 - 2014
- Safari 6.1 - 2013
- Edge 12 - 2015
- Opera 12.1 - 2012
- IE 10 - 2012
