import * as path from 'path';
import * as fs from 'fs';
import { getTypeStructure } from '../src';

function check(dir: string) {
    const data = fs.readFileSync(path.join(dir, 'index.ts'));
    const type = fs.readFileSync(path.join(dir, 'type.d.ts'));
    const nodeTypes = getTypeStructure(data.toString(), { export: true }).join('\n');
    const re = /KType\d+/gm;
    const name = 'KType';
    return {
        node: nodeTypes.replace(re, name),
        type: type.toString().replace(re, name),
    }
}

describe("转换函数测试", () => {
    test("export default 转换", () => {
        const { node, type } = check('test/export-default');
        expect(node).toBe(type);
    });
    test("export 转换", () => {
        const { node, type } = check('test/export');
        expect(node).toBe(type);
    });
    test("function 转换", () => {
        const { node, type } = check('test/function');
        expect(node).toBe(type);
    });
    test("json 转换", () => {
        const { node, type } = check('test/json');
        expect(node).toBe(type);
    });
    test("more 转换", () => {
        const { node, type } = check('test/more');
        expect(node).toBe(type);
    });
    test("primitive 转换", () => {
        const { node, type } = check('test/primitive');
        expect(node).toBe(type);
    });
});
