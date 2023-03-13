# get-uuid

获取一个 UUID 字符串。（仅浏览器，兼容全部浏览器。）

性能：（生成 1w 条 UUID 的耗时，单位毫秒，5 次的平均值）

| 方法            | Chrome 113 (dev) | Firefox 110 (stable) |
| --------------- | ---------------- | -------------------- |
| randomUUID      | 24               | 18                   |
| getRandomValues | 120              | 65                   |
| createObjectURL | 2400             | 700                  |
| random          | 33               | 30                   |

参见 `test.html` 的示例以学习如何操作。
