# JavaScript 的 Map、Set、WeakMap 和 WeakSet

## 概述

- Object：对象，存储键值对数据，键名必须是字符串或 Symbol
- Map：字典、映射，键值对都可以是任何类型
- Array：数组
- Set：集合，值唯一的数组

其中 WeakMap 和 WeakSet 已转移至[WeakData](../../articles/JavaScript%E7%9B%B8%E5%85%B3/WeakData/index.md)。

Map 键和 Set 值的相等依照[SameValueZero](https://tc39.es/ecma262/2016/#sec-samevaluezero)：

1. `NaN`和`NaN`相等（即便`NaN !== NaN` === true）
2. `-0`和`+0`相等
3. 其他的值依照`===`

## 备注

All Comparison Algorithms in JavaScript:

- [SameValue](https://tc39.es/ecma262/2016/#sec-samevalue) -> `Object.is`
- [SameValueZero](https://tc39.es/ecma262/2016/#sec-samevaluezero) -> 暂时没有它的实现暴露（Map 和 Set 内部的相等实现）
- [Strict Equality Comparison](https://tc39.es/ecma262/2016/#sec-strict-equality-comparison) -> `===`

## Map 基本操作

- 新建 Map 数据类型：`new Map()`或`new Map([[key1, val1], [key2, val1]])`或`new Map(anotherMapObject)`或其他能返回`[key, value]`格式的一维数组的可迭代对象
- 插入：`Map#set(key, val)`，返回 Map 对象本身，相同的键名的值会覆盖（更新）
- 读取：`Map#get(key)`，键名不存在返回`undefined`
- 移除：`Map#delete(key)`，移除存在的键名返回`true`，移除不存在的键名返回`false`
- 存在：`Map#has(key)`，检测一个键是否存在
- 长度：`Map#size`，这是一个 getter
- 遍历：`Map#forEach((thisVal, thisKey, thisMap) => {}, thisArg)`
- 清空：`Map#clear()`，无返回值
- 获取 key 和 value 的迭代对象：`Map#entries()`，返回的迭代对象按照插入按次生产值`[key, value]`
- 获取仅 key 的迭代对象：`Map#keys()`，返回的迭代对象按照插入按次生产值`key`
- 获取仅 value 的迭代对象：`Map#values()`，返回的迭代对象按照插入按次生产值`value`
- 可从`Array.from(mapObject)`得到 Map 对象对应的二维数组（等价`Array.from(mapObject.entries())`），这与`[...mapObject]`相同。

Map 对象可以进行浅拷贝，即`new Map(anotherMapObject)`。

本质上，Map 让你将一些额外的信息（值）与一个对象（键）相关联，而不需要将这些信息实际存储在对象本身中。

## Set 基本操作

- 新建 Set 数据类型：`new Set()`或`new Set([val1, val2])`或`new Set('string')`或`new Set(anotherSetObject)`或其他能返回`value`格式的可迭代对象
- 插入：`Set#add(value)`，插入，如果已经存在相同的值，忽略本次操作
- 移除：`Set#delete(value)`，移除与给定值相同的值，如果值存在返回 true，否则返回 false
- 存在：`Set#has(value)`，检测值是否存在
- 遍历：`Set#forEach((thisVal, thisKey, thisSet) => {}, thisArg)`
- 清空：`Set#clear()`，无返回值
- 长度：`Set#size`，这是一个 getter
- 获取 key 和 value 的迭代对象：`Set#entries()`，返回的迭代对象按照插入按次生产值`[value, value]`，返回两个相同元素的数组是与`Map#entries()`保持一致
- 获取仅 value 的迭代对象：`Set#values()`或`Set#keys()`，返回的迭代对象按照插入按次生产值`value`

可从`Array.from(setObject)`得到 Set 对象对应的一维数组（即`Array.from(setObject.values())` 或 `[...setObject]`）。

Set 对象可以进行浅拷贝，即`new Set(anotherSetObject)`。

> 2020-11-02
