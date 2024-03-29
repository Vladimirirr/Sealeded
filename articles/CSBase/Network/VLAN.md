# VLAN

VLAN(Virtual Local Area Network) 将一个局域网在逻辑上划成多个广播域的技术，同一个 VLAN 的终端在交换器下能互访，不同 VLAN 的终端将被隔离，提高安全性。

交换器转发帧靠的是 MAC 地址表，而 MAC 由自学习生成。

## 举例

如下图，PC1 和 PC2 在不同的 VLAN 下，回答 VLAN 是如何实现隔离的：

```txt
PC1 ----[[switch]]---- PC2
```

答：PC1 在封包时会发一个 ARP 包出去，查询 PC2 的 MAC 地址，但是 VLAN 已经将交换器的广播域划区了，而 ARP 不能穿越广播域，因此此 ARP 请求就回不来了，导致封包失败。

## 字段

VLAN 的信息在以太网帧的 S.MAC 和 Type 中间 4 字节的 tag 字段，其中：

1. 前 2 字节是 protocol identifier，VLAN 的值是 0x8100，表示一个带 VLAN 的帧
2. 接下来的 3bit 是 priority，取值 0 ~ 7，当交换器发生堵塞时的通过策略
3. 接下来的 1bit 表示此以太网帧是否是经典格式，0 是，1 否（FDDI 帧、令牌环网络帧）
4. 剩下的 12bit 是 VLAN ID，取值 0 ~ 4095（0 和 4095 被永久保留）

## 交换器的接口类型

- 终端与交换器相连的链路叫做：Access（接入链路）
- 交换器间相连的链路叫做：Trunk（干道链路）

### Access 接口

#### 收（终端 -> 交换器）

1. 收到不带 tag 的帧，打上 tag（接口的 VLAN ID）
2. 收到带 tag 的帧，检查其 VLAN ID，若和接口相同，就收下，不然丢掉

#### 发（终端 <- 交换器）

1. 发送前将 tag 字段从帧移除（终端不认识带 VLAN 的帧）

### Trunk 接口

#### 收

1. 收到不带 tag 的帧，打上 tag（接口的 VLAN ID），再去接口的 VLAN 表里匹配，存在的话就接收，不然丢掉
2. 收到带 tag 的帧，检查其 VLAN ID，若存在在接口的表里，就接收，不然丢掉

#### 发

1. 检查 VLAN ID 是否存在在接口的 VLAN 表里，存在就放行，不然丢掉
