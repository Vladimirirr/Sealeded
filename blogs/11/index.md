# 编码

## 常见编码

有 UCS-2、UCS-4、UTF-8、UTF-16、UTF-32、ASCII 等等。

ISO（国际标准化组织）制订一个包含地球全部语种在内的字符集，项目叫做 Unicode（Universal Multiple-Octet Coded Character Set，简称 UCS），它从 0 对全球的语种的每一个字符取号，前 128 个字符就是最早的 ASCII。其中 UCS-2, UCS-4, UTF-8, UTF-16, UTF-32, GBK, Big5, Shift-JIS 等等都是对 Unicode 的编码实现，前 5 种是全球标准的实现

### UCS-2

UCS-2：对每个字符都采取 2 个字节的编码方式

### UCS-4

UCS-4：4 个字节表示一个字符，其实真正只占了 31 位，最高位一直 0，2^31=0x80000000，因此 UCS-4 的范围是[0x00000000, 0x7FFFFFFF]，现在的 Unicode 只取到 0x10FFFF，这个范围已经包含了目前地球已知的全部语种字符。我们把每 65536 个字符称作一个平面，其中[0,65535]称基本多文种平面(Basic Multilingual Plane，简称 BMP)，[65536,0x10FFFF]还有 16 个平面，因此[0,0x10FFFF]一共有 17 个平面

### UTF-8

UTF-8：可变编码，目前最受欢迎

### UTF-16

UTF-16：是对 UCS-2 的强化，其中基本平面的字符与 UCS-2 相同，接下来一直到 0x10FFFF 的字符是 UTF-16 新增的字符集，占 4 个字节。因此 UTF-16 中引出了代理对的概念，在 UTF-16 中要表示剩下的 16 个平面的字符时，在基本平面的 0xD800~0xDFFF 这些码点设代理，一共可以代理 1024 的平方个字符（0xD800~0xDBFF 共 1024 个，0xDC00~0xDFFF 共 1024 个），正好是剩下的 16 个平面的范围

### UTF-32

UTF-32：同 UCS-4，始终 4 字节表示一个字符

## 表格（备注内容）

附 1：（平面）

<table>
<tbody>
<tr>
<td>平面：</td>
<td>范围：</td>
<td>英文：</td>
<td>中文：</td>
</tr>
<tr>
<td>0号平面</td>
<td>U+0000~FFFF</td>
<td>Basic Multilingual Plane</td>
<td>基本多文种平面，简称BMP</td>
</tr>
<tr>
<td>1号平面</td>
<td>U+10000~1FFFF</td>
<td>Supplementary Multilingual Plane</td>
<td>多文种补充平面，简称SMP</td>
</tr>
<tr>
<td>2号平面</td>
<td>U+20000~2FFFF</td>
<td>Supplementary Idographic Plane</td>
<td>表意文字补充平面，简称SIP</td>
</tr>
<tr>
<td>3号平面</td>
<td>U+30000~3FFFF</td>
<td>Tertiary Ideographic Plane</td>
<td>表意文字第三平面，简称TIP</td>
</tr>
<tr>
<td>4~13号平面</td>
<td>U+40000~DFFFF</td>
<td>None</td>
<td>保留</td>
</tr>
<tr>
<td>14号平面</td>
<td>U+E0000~EFFFF</td>
<td>Supplementary Special-purpose Plane</td>
<td>特殊目的补充平面，简称SSP</td>
</tr>
<tr>
<td>15号平面</td>
<td>U+F0000~FFFFF</td>
<td>Private Use Area A</td>
<td>私有平面A，简称PUA-A</td>
</tr>
<tr>
<td>16号平面</td>
<td>U+100000~10FFFF</td>
<td>Private Use Area B</td>
<td>私有平面B，简称PUA-B</td>
</tr>
</tbody>
</table>

附 2：（UTF-8 转换格式）

<table>
<tbody>
<tr>
<td>Unicode范围：</td>
<td>UTF-8表示格式：</td>
<td>字节数：</td>
<td>备注：</td>
</tr>
<tr>
<td>0000~007F</td>
<td>0XXX XXXX</td>
<td>1</td>
<td>ASCII</td>
</tr>
<tr>
<td>0080~07FF</td>
<td>110X XXXX 10XX XXXX{1}</td>
<td>2</td>
<td>ASCII衍生（德语、法语、等）</td>
</tr>
<tr>
<td>0800~FFFF</td>
<td>1110 XXXX 10XX XXXX{2}</td>
<td>3</td>
<td>基本平面（基本涵盖了全球语种）</td>
</tr>
<tr>
<td>1 0000~1F FFFF</td>
<td>1111 XXXX 10XX XXXX{3}</td>
<td>4</td>
<td>Unicode6.1定义的范围是[0,10FFFF]</td>
</tr>
<tr>
<td>20 0000~3FF FFFF</td>
<td>1111 10XX 10XX XXXX{4}</td>
<td>5</td>
<td>空</td>
</tr>
<tr>
<td>400 0000~7FFF FFFF</td>
<td>1111 110X 10XX XXXX{5}</td>
<td>6</td>
<td>字符集的极限</td>
</tr>
</tbody>
</table>

## 示例

字符串 `a 我易` 在不同实现下的字节：

- UTF-8：`(61) (E6 88 91) (E6 98 93)`
- UTF-8 BOM：`(EF BB BF) (61) (E6 88 91) (E6 98 93)`
- GBK：`(61) (CE D2) (D2 D7)`
- UCS-2：`(FF FE) (61 00) (11 62) (13 66)`
- UCS-2 BE：`(FE FF) (00 61) (62 11) (66 13)`
- UTF-16：`(FF FE) (61 00) (11 62) (13 66)`
- UTF-16 BE：`(FE FF) (00 61) (62 11) (66 13)`
- UTF-32：`(FF FE 00 00) (61 00 00 00) (11 62 00 00) (13 66 00 00)`
- UTF-32 BE：`(00 00 FE FF) (00 00 00 61) (00 00 62 11) (00 00 66 13)`

字符串 `a 我\u{1D306}` 在不同实现下的字节，其中 `\u{1D306} === 𝌆` 是一个非基本平面的字符：

- UTF-8：`(61) (E6 88 91) (F0 9D 8C 86)`
- UTF-16：`(FF FE) (61 00) (11 62) (34 D8 06 DF)`
- UTF-32：`(FF FE 00 00) (61 00 00 00) (11 62 00 00) (06 D3 01 00)`

> 2019-03-15
