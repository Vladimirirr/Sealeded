# WeakMap 与 WeakSet

WeakMap 仅接收对象作为键。对象被弱持有，意味着如果对象本身被垃圾回收掉，那么在 WeakMap 中的记录也会被移除。这是代码层面观察不到的。
同理，WeakSet 只是弱持有它的值。

由于随时可能给 GC 回收，故不能得到它当前的 items 长度，也不能迭代它。

TODO
