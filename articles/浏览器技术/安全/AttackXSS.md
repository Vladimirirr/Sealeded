# XSS

XSS (Cross Site Scripting)，本来缩写是 CSS，但是与样式表重名，因此叫做 XSS，况且字符 X 在一定程度下也有攻击的含义。

XSS 是 Web 安全里最重大的安全问题，最早此攻击的案例都是跨站的（名字由此得来），但是随着前端日益复杂，跨不跨站已经不是此攻击的标志性特征了。

简答来说，XSS 就是黑客向 HTML 里注入一些恶意代码，从而攻击受害者或借受害者去攻击其他受害者（跳板、肉鸡）。

最简单的例子：

```php
<?php
$saySomething = $_GET("saySomething");
echo "<p>".$saySomething."</p>";

>
```

此处没有对传入的参数做校验，不妙！如果有坏蛋传入了一串 `http://www.mysite.me/testXSS.php?saySomething=<script>alert('XSS Hijacked.')</script>` 就很危险。

## XSS 类型

### 反射

简单地把前端输入的内容反射给浏览器。黑客需要诱导受害者操作一些恶意的链接才能攻击成功。

### 存储

和反射攻击方式类似，只不过前端输入的内容被存储在了 Server 端，此种 XSS 有很强的稳定性。

比如，一包含恶意代码的博文被发表（博文内容已经保存在 Server 上），任何查看此博文的都是潜在受害者。

### DOM-based

修改 DOM 节点导致的 XSS 攻击：

```html
<!--
  如果输入的内容是 `"><img src onerror="alert(1122)" /><a href="`
  相当 `<a href=""><img src onerror="alert(1122)" /><a href="">Click for navigating.</a>`

  或者

  如果输入的内容是 `" onclick="alert(1122)" "`
  相当 `<a href="" onclick="alert(1122)" "">Click for navigating.</a>`

-->
<input type="text" id="linkInput" value="./hello.html" />
<input type="button" value="create you own hyperlink" onclick="doCreate()" />
<div id="display"></div>
<script>
  window.doCreate = () => {
    const value = document.getElementById('linkInput').value
    const displayEl = document.getElementById('display')

    // 未做任何处理直接插入，很危险！
    const str = `<a href="${value}">Click for navigating.</a>`
    // 需要谨慎对待任何的 innerHTML
    displayEl.innerHTML = str
  }
</script>
```
