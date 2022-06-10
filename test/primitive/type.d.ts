// 测试 没有声明的对象与数组
export type KType5149 = { test: number };

/**
 * 测试数组
 */
export type KType9689 = (
    | {
          name: string; // 测试数据
      }
    | (number | string)[]
    | number
)[];
