import { DEFAULT_NUMBER_KEY, CLOSE_BRACE_TOKEN, OPEN_BRACE_TOKEN } from './config';
import { ArrayType, createNodeString, NodeType, ObjectType, PrimitiveType, TypeNames } from './type';
import { createType, isTypeArray, isTypeObject, isTypePrimitive, joinArray, joinObject, joinPrimitive } from './utils';

type ClassificationType = {
    array: ArrayType[];
    object: ObjectType[];
    primitive: PrimitiveType[]
};

/**
 * 分类数据
 * @param nodeTypes 多个 nodeType
 * @returns 分类后的数据
 */
function classification(nodeTypes: NodeType[]) {
    const types: ClassificationType = {
        array: [],
        object: [],
        primitive: [],
    };
    nodeTypes.forEach(nodeType => {
        if (isTypeArray(nodeType)) {
            types.array.push(nodeType);
        } else if (isTypeObject(nodeType)) {
            types.object.push(nodeType);
        } else if (isTypePrimitive(nodeType)) {
            types.primitive.push(nodeType);
        }
    });
    return types;
}

/**
 * 合并 nodeType 并创建字符串
 * @param nodeType NodeType
 * @returns NodeType
 */
export function mergeNodeTypeToString(nodeType: NodeType): string {
    if (isTypeArray(nodeType)) {
        return _mergeArrayType(nodeType);
    } else if (isTypeObject(nodeType)) {
        return _mergeObjectType(nodeType);
    }
    return _mergePrimitiveType(nodeType);

    function _mergeArrayType(...nodeTypes: ArrayType[]): string {
        if (!nodeTypes.length) {
            return '';
        }
        const arrayNode = createType({
            type: TypeNames.array,
            key: DEFAULT_NUMBER_KEY,
            docStart: [],
            docEnd: [],
            value: [],
        });
        nodeTypes.forEach(node => {
            node.value.forEach((n, i) => {
                // TODO: 数组类型注释 暂未解决
                arrayNode.docStart.push(node.docStart[i] || '');
                arrayNode.docEnd.push(node.docEnd[i] || '');
                arrayNode.value.push(n);
            });
        });
        const { object, array, primitive } = classification(arrayNode.value);
        // 创建
        return joinArray([
            _mergeObjectType(...object),
            _mergeArrayType(...array),
            _mergePrimitiveType(...primitive)
        ]);
    }

    function _createDoc(nodes: (NodeType | undefined)[], key: 'docStart' | 'docEnd') {
        return [...new Set(nodes.map(node => node?.[key]).flat())].join(key === 'docStart' ? '\n' : ' ');
    }

    function _mergeObjectType(...nodeTypes: ObjectType[]): string {
        if (!nodeTypes.length) {
            return '';
        }
        // 拿到所有的 key
        const keys = nodeTypes.reduce<string[]>((keys, current) => {
            current.value.forEach(node => {
                if (!keys.includes(node.key)) {
                    keys.push(node.key);
                }
            });
            return keys;
        }, []);
        const objects: string[] = [];
        keys.forEach(key => {
            const nodes = nodeTypes.map(node => node.value.find(n => n.key === key)).filter(_ => _) as NodeType[];
            const values: string[] = [];
            const { object, array, primitive } = classification(nodes);
            values.push(_mergeObjectType(...object), _mergeArrayType(...array), _mergePrimitiveType(...primitive));
            // key 值
            const k = `${key}${nodes.length < nodeTypes.length ? '?' : ''}`;
            // 注释
            const docStart = _createDoc(nodes, 'docStart');
            // 尾注释
            const docEnd = _createDoc(nodes, 'docEnd');
            objects.push(
                createNodeString(docStart, docEnd, k, joinPrimitive(values)),
            );
        });

        const braceTokens = nodeTypes.map(n => n.braceToken).flat();

        const openTokens = braceTokens.filter(n => n?.key === OPEN_BRACE_TOKEN);
        const openTokensDocStart = _createDoc(openTokens, 'docStart');
        const openTokensDocEnd = _createDoc(openTokens, 'docEnd');
        objects.unshift(
            createNodeString(openTokensDocStart, openTokensDocEnd, DEFAULT_NUMBER_KEY, '{'),
        );
        const closeTokens = braceTokens.filter(n => n?.key === CLOSE_BRACE_TOKEN);
        const closeTokensDocStart = _createDoc(closeTokens, 'docStart');
        const closeTokensDocEnd = _createDoc(closeTokens, 'docEnd');
        objects.push(
            createNodeString(closeTokensDocStart, closeTokensDocEnd, DEFAULT_NUMBER_KEY, '}'),
        );

        return joinObject(objects);
    }
    function _mergePrimitiveType(...nodeTypes: PrimitiveType[]): string {
        if (!nodeTypes.length) {
            return '';
        }
        const primitiveNode = createType({
            type: TypeNames.primitive,
            key: '',
            docStart: [],
            docEnd: [],
            value: [],
        });
        nodeTypes.forEach(node => {
            primitiveNode.value.push(...node.value);
        });
        // 创建
        return createNodeString('', '', DEFAULT_NUMBER_KEY, joinPrimitive([...new Set(primitiveNode.value)]));
    }
}
