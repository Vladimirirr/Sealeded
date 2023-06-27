# Examples

## Exchange data with objects array

`WebAssemblyScript`:

```ts
class Person {
  name: string = ''
  age: i32 = 0
}
export function getPersonsAge(arr: Person[]): i32 {
  var sum: i32 = 0
  for (let i: i32 = 0; i < arr.length; i++) sum += arr[i].age
  return sum
}
export function addPersonsAge(arr: Person[]): Person[] {
  // 命令式，建议此方式
  for (let i: i32 = 0; i < arr.length; i++) arr[i].age++
  return arr
}
export function addPersonsAge2(arr: Person[]): Person[] {
  // 函数式，额外的内存消耗，但倾向 JavaScript 或 TypeScript
  return arr.map<Person>((i: Person) => {
    const item = new Person()
    item.name = i.name
    item.age = i.age + 1
    return item
  })
}
```

`test.js`:

```js
const arr = [
  { name: 'jack', age: 20 },
  { name: 'nat', age: 22 },
]
// arr 的内容会被深拷贝到 wasm 的内存里
console.log(getPersonsAge(arr))
```
