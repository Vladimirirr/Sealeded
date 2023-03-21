/**
 * 获取一个对象的继承链 (Prototype Chaining)
 * @param {Object} o - 对象
 * @param {boolean} isContent - 显示名称还是实体
 * @return {Array}
 */
const getPrototypeChaining = (o, isContent) => {
  const res = []
  const getItem = (item) => (isContent ? item : item.constructor.name)
  // 兼容全部（包括旧的）浏览器，标准方法是 Object.getPrototypeOf
  // __proto__ 在 getPrototypeOf 出现前就已被各大浏览器实现
  // 现代浏览器的 __proto__ 其实是包装 getPrototypeOf 的 getter 与 setter
  while ((o = o.__proto__)) res.push(getItem(o))
  return res
}

export default getPrototypeChaining
