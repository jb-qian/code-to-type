import * as ts from 'typescript';
import { DEFAULT_TYPE, DEFAULT_KEY, DEFAULT_JSON_KEY, DEFAULT_NUMBER_KEY, OPEN_BRACE_TOKEN, CLOSE_BRACE_TOKEN } from './config';
import { createType, pascalize } from './utils';
import * as libFiles from './lib/index';
import { mergeNodeTypeToString } from './merge';

export enum TypeNames {
    object = 'object',
    array = 'array',
    primitive = 'primitive',
}

type DefaultType<T> = {
    key: string;
    docStart: string[];
    docEnd: string[];
    type: T;
    value: NodeType[];
    braceToken?: (PrimitiveType | undefined)[];
};

export type ObjectType = DefaultType<TypeNames.object>;
export type ArrayType = DefaultType<TypeNames.array>;
export type PrimitiveType = Omit<DefaultType<TypeNames.primitive>, 'value'> & { value: string[] };
export type NodeType = ObjectType | ArrayType | PrimitiveType;

// 加载类型资源
const cachedSourceFiles: { [key: string]: ts.SourceFile } = {};
for (const sourceFile of getLibSourceFiles()) {
    cachedSourceFiles[sourceFile.fileName] = sourceFile;
}
function getLibSourceFiles() {
    const _libFiles = libFiles as any;
    return Object.keys(_libFiles)
        .map(key => _libFiles[key])
        .map(libFile => ts.createSourceFile(libFile.fileName, libFile.text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS));
}

/**
 * 获取 ts 检查器
 */
export function getTypeChecker(filePath: string, sourceFile: ts.SourceFile, scriptTarget: ts.ScriptTarget) {
    const options: ts.CompilerOptions = { strict: true, target: scriptTarget, allowJs: true, module: ts.ModuleKind.ESNext };
    const files: { [name: string]: ts.SourceFile | undefined } = { [filePath]: sourceFile, ...cachedSourceFiles };

    const compilerHost = {
        getSourceFile: (fileName: string) => {
            return files[fileName];
        },
        getDefaultLibFileName: (defaultLibOptions: ts.CompilerOptions) => '/' + ts.getDefaultLibFileName(defaultLibOptions),
        writeFile: () => {},
        getCurrentDirectory: () => {
            return '/';
        },
        getDirectories: (path: string) => [],
        fileExists: (fileName: string) => !!files[fileName],
        readFile: (fileName: string) => !!files[fileName] ? files[fileName]!.getFullText() : undefined,
        getCanonicalFileName: (fileName: string) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '',
        getEnvironmentVariable: () => '',
    };
    const program = ts.createProgram([...Object.keys(files)], options, compilerHost);
    return program.getTypeChecker();
}

/**
 * 获取 ts sourceFile 与 检查器
 */
export function getSourceFile(code: string) {
    const filePath = 'ts-type.js';
    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const typeChecker = getTypeChecker(filePath, sourceFile, ts.ScriptTarget.Latest);
    return { sourceFile, typeChecker };
}

/**
 * 获取表达式字符串
 * @param code 代码字符串
 * @returns 如果是 {} / [] 就返回一个表达式声明
 */
export function getObjectCodeString(node: ts.Node) {
    if (ts.isBlock(node) || ts.isExpressionStatement(node)) {
        const text = node.getText();
        const fullText = node.getFullText();
        return fullText.replace(text, `const ${DEFAULT_KEY} = ${text}`);
    } else {
        return node.getFullText();
    }
}

/**
 *
 * @param node ts node 类型
 * @returns node 数组
 */
export function nodeForEachChild(node: ts.Node) {
    const nodes: ts.Node[] = [];
    node.forEachChild(child => {
        nodes.push(child);
    });
    return nodes;
}

/**
 * 过滤无效的 node 节点
 * @param nodes ts.Node
 * @returns ts.Node
 */
export function getEffectiveNode(nodes: ts.Node[]) {
    return nodes.filter(node => node && node.kind !== ts.SyntaxKind.EndOfFileToken && node.kind !== ts.SyntaxKind.EmptyStatement);
}

/**
 * 获取注释（前）
 */
function getDocStart(sourceFile: ts.Node, node: ts.Node) {
    const fullText = sourceFile.getFullText();
  	const fullStart = node.getFullStart();
    const commentRangesh = ts.getLeadingCommentRanges(fullText, fullStart) || [];
    return commentRangesh.map(range => fullText.slice(range.pos, range.end));
}

/**
 * 获取注释（后）
 */
function getDocEnd(sourceFile: ts.Node, node: ts.Node) {
    const fullText = sourceFile.getFullText();
  	const fullStart = node.getFullStart();
    const commentRangesh = ts.getTrailingCommentRanges(fullText, fullStart) || [];
    return commentRangesh.map(range => fullText.slice(range.pos, range.end));
}

/**
 * 获取注释
 * @param sourceFile ts.SourceFile
 * @param node 当前 node 节点
 * @returns 注释数组
 */
function getDoc(sourceFile: ts.Node, node: ts.Node) {
    return [getDocStart(sourceFile, node), getDocEnd(sourceFile, node)];
}

type CreatePrimitiveTypeConfig = Omit<ObjectType, 'type' | 'value' | 'docStart' | 'docEnd'> & Partial<Record<'docStart' | 'docEnd', string[]>>
/**
 * 创建一个基本类型（快捷）
 */
export function createPrimitiveType(config: CreatePrimitiveTypeConfig, value: string) {
    return createType({
        type: TypeNames.primitive,
        docStart: [],
        docEnd: [],
        ...config,
        value: [value],
    });
}

/**
 * 获取 nodeType
 * @param sourceFile 根节点
 * @param typeChecker 类型检查器
 * @returns NodeType
 */
export function getNodeType(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, names: string[]) {
    const [docStart] = getDoc(sourceFile, sourceFile);
    return {
        doc: docStart.join('\n'),
        nodeType: _getNodeType(sourceFile).value || createPrimitiveType({
            key: DEFAULT_KEY,
        }, DEFAULT_TYPE),
    };

    /**
     * 获取节点类型
     * @param node ts.Node
     * @returns 节点类型
     */
    function _getType(node: ts.Node): string {
        if ([
            ts.SyntaxKind.NumericLiteral,
            ts.SyntaxKind.StringLiteral,
            ts.SyntaxKind.FalseKeyword,
            ts.SyntaxKind.TrueKeyword,
            ts.SyntaxKind.PrefixUnaryExpression,
            ts.SyntaxKind.CallExpression,
            ts.SyntaxKind.NoSubstitutionTemplateLiteral,
        ].includes(node.kind)) {
            try {
                return eval(`typeof ${node.getText()}`);
            } catch (error) {
                return DEFAULT_TYPE;
            }
        } else if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) {
            return `(${getFunctionType(node)})`;
        }
        // 兜底方案
        const type = typeChecker.typeToString(typeChecker.getTypeAtLocation(node));
        return type !== '{}' ? type : DEFAULT_TYPE;
    }

    /**
     * 创建 type 数据结构
     * @param key 创建 type 数据结构
     * @param value
     * @returns
     */
    function _createType(key: string, name: ts.Node, value: ts.Node): NodeType {
        const [docStart, docEnd] = getDoc(sourceFile, name);
        if (ts.isObjectLiteralExpression(value)) { // 如果是对象
            const children = value.getChildren();
            const openBraceToken = children[0];
            const syntaxList = children[1];
            const closeBraceToken = children[2];
            const types = syntaxList.getChildren().map(n => {
                return _getNodeType(n).value;
            }).filter(Boolean) as NodeType[];

            function getOpenBraceToken() {
                const [docStart, docEnd] = getDoc(sourceFile, openBraceToken);
                return createPrimitiveType({
                    key: OPEN_BRACE_TOKEN,
                    docStart,
                    docEnd,
                }, '{');
            }
            function getCloseBraceToken() {
                const [docStart, docEnd] = getDoc(sourceFile, closeBraceToken);
                return createPrimitiveType({
                    key: CLOSE_BRACE_TOKEN,
                    docStart,
                    docEnd,
                }, '}');
            }

            return createType({
                type: TypeNames.object,
                key,
                docStart,
                docEnd,
                braceToken: [
                    getOpenBraceToken(),
                    getCloseBraceToken(),
                ],
                value: types.length ? types : [createPrimitiveType({
                    key: DEFAULT_JSON_KEY,
                }, DEFAULT_TYPE)],
            });
        } else if (ts.isArrayLiteralExpression(value)) { // 如果是数组
            const types = value.elements.map(n => _createType(DEFAULT_NUMBER_KEY, n, n));
            return createType({
                type: TypeNames.array,
                key,
                docStart,
                docEnd,
                value: types.length ? types : [createPrimitiveType({
                    key: DEFAULT_NUMBER_KEY,
                }, DEFAULT_TYPE)],
            });
        } else {
            return createPrimitiveType({
                key,
                docStart,
                docEnd,
            }, _getType(value));
        }
    }

    /**
     * 获取多种函数类型
     * @param body ts.Fn
     * @returns 函数类型
     */
    function getFunctionType(node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration) {
        const paramTypes = node.parameters.map(p => `${p.name.getText()}${p.questionToken ? '?' : ''}: ${p.type ? _getType(p.type) : DEFAULT_TYPE}`)
        const returnType = node.body && ts.isBlock(node.body) ? (node.body.statements.find(n => ts.isReturnStatement(n)) as ts.ReturnStatement)?.expression : node.body;
        return `(${paramTypes.join(',')}) => ${returnType ? mergeNodeTypeToString(_createType('0', returnType, returnType)) : DEFAULT_TYPE}`;
    }

    /**
     * 获取节点类型
     * @param node ts.Node
     * @returns NodeType
     */
    function _getNodeType(node: ts.Node, nodeType: { value?: NodeType } = {}) {
        if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) {
            const name = node.name;
            const value = node.initializer;
            // 如果没有value
            if (!value) {
                nodeType.value = createPrimitiveType({
                    key: name.getText(),
                }, DEFAULT_TYPE);
            } else {
                nodeType.value = _createType(name.getText(), name, value);
            }
        } else if (ts.isShorthandPropertyAssignment(node)) { // 引用类型
            const [docStart, docEnd] = getDoc(sourceFile, node.name);
            const key = node.name.getText();
            const typeName = pascalize(key);
            nodeType.value = createPrimitiveType({
                key,
                docStart,
                docEnd,
            }, names.includes(typeName) ? typeName : DEFAULT_TYPE);
        } else if (ts.isMethodDeclaration(node)) {
            const [docStart, docEnd] = getDoc(sourceFile, node.name);
            nodeType.value = createPrimitiveType({
                key: node.name.getText(),
                docStart,
                docEnd,
            }, _getType(node));
        } else if (ts.isExportAssignment(node)) { // 带有导出的情况
            const [docStart, docEnd] = getDoc(sourceFile, node);
            nodeType.value = createPrimitiveType({
                key: DEFAULT_KEY,
                docStart,
                docEnd,
            }, _getType(node.expression));
        } else if (ts.isFunctionDeclaration(node)) { // 函数
            const [docStart, docEnd] = getDoc(sourceFile, node);
            nodeType.value = createPrimitiveType({
                key: node.name?.getText() || DEFAULT_KEY,
                docStart,
                docEnd,
            }, getFunctionType(node));
        } else {
            node.getChildren().forEach((next) => {
                _getNodeType(next, nodeType);
            });
        }
        return nodeType;
    }
}

/**
 * 创建一个 type 字符串
 * @param name name
 * @param value value
 * @returns ts type string
 */
export function createTypeString(doc: string, name: string, value: string, exp: boolean = false) {
    return `${doc ? `${doc}\n` : ''}${exp ? 'export ' : ''}type ${name} = ${value};`;
}

/**
 * 创建节点 字符串，包含注释
 * @param docStart 头注释
 * @param docEnd 尾注释
 * @param key key值
 * @param value value值
 * @returns 组合字符串
 */
export function createNodeString(docStart: string, docEnd: string, key: string, value: string) {
    const doc = [docEnd, docStart ? `\n${docStart}\n` : docEnd ? '\n' : ''].filter(d => !!d).join('');
    if (/^\d+$/.test(key)) {
        return `${doc}${value}`;
    }
    return `${doc}${key}: ${value};`;
}
