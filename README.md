# china-address-search

一个简单的中国地址匹配算法（附带地址数据）

[在线实例]('https://darrendanielday.github.io/china-address-search/')

[实例源码](./demo/)

- 仅支持中国行政区划内的三级地址（省市县）
- 支持汉字/首拼匹配
- 支持模糊匹配，跨段匹配（单独的省市县，省+市，省+县，市+县均可匹配，且“省”“市”“县”等常见后缀输入可省略）

如果需要兼容较老的浏览器，你可能需要[`Array.prototype.at`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/at)的`polyfill`：

```ts
Array.prototype.at =
  Array.prototype.at ||
  function at(n) {
    // ToInteger() abstract op
    n = Math.trunc(n) || 0;
    // Allow negative indexing from the end
    if (n < 0) n += this.length;
    // OOB access is guaranteed to return undefined
    if (n < 0 || n >= this.length) return undefined;
    // Otherwise, this is just normal property access
    return this[n];
  };
```
