import * as prettier from 'prettier';
import { DEFAULT_KEY } from './config';
import { mergeNodeTypeToString } from './merge';
import {
    getSourceFile,
    nodeForEachChild,
    createTypeString,
    getObjectCodeString,
    getNodeType,
    getEffectiveNode,
} from './type';
import {
    getId,
    pascalize,
} from './utils';

/**
 * 获取字符串的类型
 * @param code 代码字符串
 * @returns ts 类型的数组
 */
export function getTypeStructure(code: string, options: Partial<{ spaces: number, export: boolean }> = {}) {
    const { sourceFile } = getSourceFile(code);
    // 存一下名称，防止引用类型
    const names: string[] = [];
    // 代码分块
    const nodeTypes = getEffectiveNode(nodeForEachChild(sourceFile)).map(node => {
        const { sourceFile, typeChecker } = getSourceFile(getObjectCodeString(node));
        const { doc, nodeType } = getNodeType(sourceFile, typeChecker, names);
        const typeString = mergeNodeTypeToString(nodeType);
        const name = nodeType.key === DEFAULT_KEY || !/^[a-z]/i.test(nodeType.key) ? getId() : pascalize(nodeType.key);
        names.push(name);
        return createTypeString(doc, name, typeString, options.export);
    });
    return nodeTypes.map(type => {
        return prettier.format(type, { parser: 'typescript', tabWidth: options.spaces ?? 4 });
    });
}
