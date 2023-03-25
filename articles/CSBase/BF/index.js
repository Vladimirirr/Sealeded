/**
 * a class for creating a BF language runtime
 */
class BF {
  /**
   * @param {Object} cfg - 配置
   * @param {number} cfg.memSize - 内存容量，默认8字节
   * @param {Function} cfg.stdin - 标准输入，默认window.prompt
   * @param {Function} cfg.stdout - 标准输出，默认console.info
   * @param {boolean} cfg.verbose - 打印执行过程，默认false
   * @param {number} cfg.maxCount - 最大执行次数，默认1e4
   */
  constructor(cfg) {
    // resolve config
    this.cfg = Object.assign({}, BF.defaultCfg, cfg)
    // init data
    this.reset()
  }
  /**
   * run the given code
   * @param {string} code
   * @return {Uint8Array}
   */
  run(code) {
    const maxPtr = this.cfg.memSize - 1
    const maxPos = code.length - 1
    while (this.pos <= maxPos) {
      // 读纸带（纸带 = code）
      const c = code[this.pos]
      switch (c) {
        case '>':
          this.ptr++
          break
        case '<':
          this.ptr--
          break
        case '+':
          this.mem[this.ptr]++
          break
        case '-':
          this.mem[this.ptr]--
          break
        case '.':
          {
            const ch = String.fromCharCode(this.mem[this.ptr])
            this.cfg.stdout(ch)
          }
          break
        case ',':
          {
            const ch = this.cfg.stdin()
            this.mem[this.ptr] = ch.charCodeAt(0) || 0
          }

          break
        case '[':
          if (this.mem[this.ptr]) {
            // begin a loop
            this.lop.unshift(this.pos) // save the beginning position of the loop body
          }
          break
        case ']':
          if (this.mem[this.ptr]) {
            // continue the loop
            this.pos = this.lop[0]
          } else {
            // end the loop
            this.lop.shift()
          }
          break
      }
      this.pos++ // 前移纸带
      this.cnt++ // 执行次数 +1
      // 是否打印当前信息
      if (this.cfg.verbose) {
        this.print(c)
      }
      // 是否越线
      if (this.ptr < 0 || this.ptr > maxPtr) {
        throw Error(`The current pointer value <${this.pos}> is out of bound.`)
      }
      // 是否超限
      if (this.cnt == this.cfg.maxCount) {
        throw Error(`There may be an infinite loop in this code.`)
      }
    }
    return this.mem
  }
  /**
   * reset all the status
   */
  reset() {
    this.pos = 0 // position 纸带的位置
    this.ptr = 0 // pointer 内存的指针的位置
    this.mem = new Uint8Array(this.cfg.memSize) // memory 内存
    this.cnt = 0 // count 已经执行的次数
    this.lop = [] // loop 保存循环的栈
  }
  /**
   * print current running status
   * @description internal method 内部方法
   * @param {string} c - current instruction
   */
  print(c) {
    const padLeftZero = (c, total = 2) => c.padStart(total, '0')
    const hex = (i) => padLeftZero(i.toString(16))
    const formatMem = (mem) => {
      const res = []
      mem.forEach((i) => res.push(hex(i)))
      return res.join(' ')
    }
    const formatPos = (pos) => padLeftZero(pos + '', 3)
    const formatPtr = (ptr) => padLeftZero(ptr + '', 3)
    const formatCnt = (cnt) => padLeftZero(cnt + '', 5)
    const parts = [
      [`%c${c}%c`, 'red'], // instruction
      [`%c${formatMem(this.mem)}%c`, 'hotpink'], // memory
      [`%c[pos.${formatPos(this.pos)}]%c`, 'green'], // position
      [`%c[ptr.${formatPtr(this.ptr)}]%c`, 'green'], // pointer
      [`%c[cnt.${formatCnt(this.cnt)}]%c`, 'green'], // count
    ]
    const content = parts.map((i) => i[0]).join(' ')
    const style = parts.map((i) => [`color: ${i[1]};`, '']).flat()
    console.log(content, ...style)
  }
}
BF.defaultCfg = {
  memSize: 8,
  stdin: window.prompt.bind(window, 'Putchar'),
  stdout: console.info.bind(console),
  verbose: false,
  maxCount: 1e4,
}

export default BF
