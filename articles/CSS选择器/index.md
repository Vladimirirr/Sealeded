# CSS 选择器

## 简单选择器

根据类名、id 名、标签名来选取元素。

## 组合选择器

根据结构层次关系来选取元素。

### 后代选择器`<space>`

选取指定元素全部的子元素（即后代元素）。

### 直接子代选择器`>`

选取指定元素的一级子元素（即直接子代）。

### 相邻选择器`+`

选取**紧随其后**的同级元素。

```css
div + p {
  color: red;
}
```

```html
<header>
  <div>1111<div>
  <p>matched</p>
</header>
```

```html
<header>
  <div>1111<div>
  <div>2222<div>
  <p>DO NOT matched</p>
  <!-- 必须紧随div其后的p -->
</header>
```

### 兄弟选择器`~`

选取指定元素**下面的**全部同级元素。

```css
div ~ p {
  color: red;
}
```

```html
<header>
  <p>DO NOT matched</p>
  <div>1111</div>
  <p>matched</p>
  <p>matched</p>
  <!-- 只有指定元素下面的同级元素能被选取 -->
</header>
```

### 属性选择器

### `[attr]`选择器

### `[attr="value"]`选择器

### `[attr~="value"]`选择器

### `[attr|="value"]`选择器

### `[attr^="value"]`选择器

### `[attr$="value"]`选择器

### `[attr*="value"]`选择器

## 伪类与伪元素

### 伪类

选取特定状态的元素。

#### `:nth-child(n)` & `:nth-last-child(n)` & `:nth-of-type(n)` & `:nth-last-of-type(n)`

备注：n = n >= 1 的整数

- `:nth-child(n)`：找到它修饰的元素的全部同级兄弟元素，选取其中的第 n 个元素
- `:nth-last-child(n)`：同上，只不过 n 倒数选取
- `:nth-of-type(n)`：找到它修饰的元素的全部同级的同类型的兄弟元素，选取其中的第 n 个元素
- `:nth-last-of-type(n)`：同上，只不过 n 倒数选取

#### `:first-child` & `:last-child` & `:first-of-type` & `:last-of-type`

- `:first-child` === `:nth-child(1)`
- `:last-child` === `:nth-last-child(1)`
- `:first-of-type` === `:nth-of-type(1)`
- `:last-of-type` === `:nth-last-of-type(1)`

### 伪元素

选取元素的一部分并为其设置样式。

#### `::after`

在指定的元素之后插入内容。

#### `::before`

在指定的元素之前插入内容。

#### `::first-letter`

选取指定元素的首字母。

#### `::first-line`

选取指定元素的首行。

#### `::selection`

选取用户选中的元素内容。
