export const isObject = (x: any) =>
  Object.prototype.toString.call(x) === "[object Object]";
