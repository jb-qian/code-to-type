// 引用类型与空数据
let empty;
let empty2 = 1;

/**
 * 测试 export
 */
export const MethodDeclaration = [{
    set() {
        return { name: '' }
    },
    empty,
    // 引用值
    empty2,
}, {
    empty2: '',
    // 没有值的引用
    empty3,
}];
