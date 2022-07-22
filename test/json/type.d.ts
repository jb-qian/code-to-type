// 测试数据
export type TestJson = (
    | {
          // 测试注释
          selectMode?: boolean;
          /* 测试这种注释 */
          selectedItem?: MapConstructor;
          /**
           * 测试这种注释 啊啊
           */
          map?: Map<any, any>;
          // 空数组
          list?: any[]; // 末尾注释测试
          title?: string;
          // 正则
          regExp?: RegExp;
          // 空对象
          object?: { [key: string]: any; test?: { [key: string]: any } };
          searchForm?: {
              symbol: SymbolConstructor;
              set: (num: string) => any;
              date: DateConstructor;
              getTime: string;
              operationStatus: ({ name: string } | number)[];
              boolean: boolean;
              int: number;
              number: number;
              string: string; // 最后一个注释测试
          };
          // 数组测试
          batchForm?: (
              | {
                    // 数组属性测试
                    // 数组属性测试 2
                    operateStartTime: string | number;
                    operateEndTime?: string;
                }
              | ((params: number) => string[])
              | (() => PromiseConstructor)
              | (() => string)
          )[];
          // 刻意写个错误的
          filter?: any;
          // 特殊的方式
          topicName:
              | {
                    // 整一堆乱七八糟的数据
                    // 整一堆数据
                    vue: (
                        | (
                              | { c: number }
                              | (
                                    | {
                                          op: {
                                              ag: { v: number }[];
                                              vg: { o: number };
                                          };
                                      }[]
                                    | number
                                )[]
                              | number
                              | string
                          )[]
                        | number
                    )[]; // 1 // 2
                    react: ((number | string)[] | string)[];
                }
              | (() => {
                    a8: { a: number };
                    b9: number;
                    c0: number;
                    d4: number;
                    e6: number;
                    r: number;
                    ua: number;
                    oc: number;
                    de: number;
                    a: number;
                    bc: number;
                    caa: number;
                    d3: number;
                    e2: number;
                    r4: number;
                    u: number;
                    o: number;
                    d: number;
                    h: number;
                    z: number;
                    nm: number;
                    c: number;
                    cc: number;
                    ccc: number;
                    cccc: number;
                });
          // 空数据测试
          empty?: (
              | { [key: string]: any }
              | (({ [key: string]: any } | any)[] | number | string)[]
              | number
          )[];
      }
    | ({ json: number | string; name?: string } | string)[]
)[];
