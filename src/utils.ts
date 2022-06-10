import { ArrayType, ObjectType, PrimitiveType, TypeNames } from './type';

/**
 * 过滤后是空的数组
 * @param target 未知类型的数组
 */
export function isEmptyArray<T>(target: (T | null | undefined | '')[]): true | T[] {
    const _target = target.filter(t => t) as T[];
    return _target.length === 0 ? true : _target;
}
function camelize(key: string) {
    key = key.replace(/[\-_\s\"\']+(.)?/g, (_match, chr) => chr ? chr.toUpperCase() : '');
    return key.substr(0, 1).toLowerCase() + key.substr(1);
};
/**
 * 首字母大写
 */
export function pascalize(key: string) {
    if (key.length === 1) {
        return key;
    }
    const camelized = camelize(key);
    return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
};
/**
 * 获取 id
 * @returns 随机的id字符串
 */
export function getId() {
    return `KType${Math.random().toString().replace('.', '').substring(1, 3)}${Math.random().toString().replace('.', '').substring(2, 4)}`;
}

/**
 * 拼接数组
 */
export function joinArray(typeStrs: string[]) {
    const target = isEmptyArray(typeStrs);
    if (target === true) {
        return '';
    }
    return `(${joinPrimitive(target)})[]`;
}
/**
 * 拼接对象
 */
export function joinObject(typeStrs: string[]) {
    const target = isEmptyArray(typeStrs);
    if (target === true) {
        return '';
    }
    return target.join('');
}
/**
 * 拼接基本类型
 */
export function joinPrimitive(typeStrs: string[]) {
    const target = isEmptyArray(typeStrs);
    if (target === true) {
        return '';
    }
    return target.join('|');
}
/**
 * 如果是对象类型
 * @param nodeType 可选的只有 string | NodeType
 * @returns is ObjectType
 */
export function isTypeObject(nodeType: any): nodeType is ObjectType {
    if (typeof nodeType === 'string') {
        return false;
    }
    return nodeType.type === TypeNames.object;
}
/**
 * 判断是数组类型
 * @param nodeType 可选的只有 string | NodeType
 * @returns is ArrayType
 */
export function isTypeArray(nodeType: any): nodeType is ArrayType {
    if (typeof nodeType === 'string') {
        return false;
    }
    return nodeType.type === TypeNames.array;
}
/**
 * 判断是基本类型
 * @param nodeType 可选的只有 string | NodeType
 * @returns is PrimitiveType
 */
export function isTypePrimitive(nodeType: any): nodeType is PrimitiveType {
    if (typeof nodeType === 'string') {
        return false;
    }
    return nodeType.type === TypeNames.primitive;
}
/**
 * 创建 type 数据结构
 * @param type 对象 / 数组 / 基础
 * @param key 字符串
 * @param doc 注释
 * @param value 子集
 * @returns 集合
 */
export function createType(config: ObjectType): ObjectType;
export function createType(config: ArrayType): ArrayType;
export function createType(config: PrimitiveType): PrimitiveType;
export function createType(config: ObjectType | ArrayType | PrimitiveType) {
    return config;
}
