/**
 * 比较两个节点样式的不同处，返回一个数组，数组的每一项代表一处不同
 * a 和 b 传入两个待比较的节点
 * @param {Element} a - Element节点
 * @param {Element} b - Element节点
 * @return {({ name: string, a: string | undefined, b: string | undefined })[]}
 */
const diffNodeCss = (a, b) => {
  const aCss = window.getComputedStyle(a)
  const bCss = window.getComputedStyle(b)
  const aLen = aCss.length
  const bLen = bCss.length
  const maxCss = aLen > bLen ? aCss : bCss
  const maxCssLen = maxCss.length
  const diffs = []
  console.time('diffNodeCss')
  for (let i = 0; i < maxCssLen; i++) {
    const currentItemName = maxCss[i]
    const aItemValue = aCss[currentItemName]
    const bItemValue = bCss[currentItemName]
    if (aItemValue != bItemValue) {
      diffs.push({
        name: currentItemName,
        a: aItemValue,
        b: bItemValue,
      })
    }
  }
  console.timeEnd('diffNodeCss')
  return diffs
}

export default diffNodeCss
