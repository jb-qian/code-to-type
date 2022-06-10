// 引用类型与空数据
export type Empty = any;

export type Empty2 = number;

/**
 * 测试 export
 */
export type MethodDeclaration = {
    set?: () => { name: string };
    empty?: Empty;
    // 引用值
    empty2: Empty2 | string;
    // 没有值的引用
    empty3?: any;
}[];
