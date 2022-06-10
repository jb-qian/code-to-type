// 测试数据
const testJson = [
    {
        // 测试注释
        selectMode: false,
        /* 测试这种注释 */
        selectedItem: Map,
        /**
        * 测试这种注释 啊啊
        */
        map: new Map(),
        // 空数组
        list: [], // 末尾注释测试
        title: 'title',
        // 正则
        regExp: /\d+/,
        // 空对象
        object: {},
        searchForm: {
            symbol: Symbol,
            set: function(num: string) { return Number(num).toString(); },
            date: Date,
            getTime: new Date().toString(),
            operationStatus: [1, 2, { name: 'z' }],
            boolean: !!9,
            int: ~~9.0,
            number: -9.0,
            string: '' + 9.0, // 最后一个注释测试
        },
        // 数组测试
        batchForm: [
            {
                // 数组属性测试
                operateStartTime: '',
                operateEndTime: '',
            }, {
                // 数组属性测试 2
                operateStartTime: 1,
            },
            // 夹杂个其他类型
            function name(params: number) {
                return [params + ''];
            },
            () => Promise, // 数组结尾,
            function() {
                const test = 1;
                return test + '';
            },
        ],
        // 刻意写个错误的
        filter: PAGE,
        // 特殊的方式
        topicName() {
            return {
                a8: {
                    a: 1
                },
                b9: 1,
                c0: 1,
                d4: 2,
                e6: 4,
                r: 5,
                ua: 6,
                oc: 1,
                de: 3,
                a: 1,
                bc: 1,
                caa: 1,
                d3: 2,
                e2: 4,
                r4: 5,
                u: 6,
                o: 1,
                d: 3,
                h: 5,
                z: 1,
                nm: 5,
                c: 4,
                cc: 4,
                ccc: 4,
                cccc: 5
            }
        },
    }, {
        topicName: {
            // 整一堆乱七八糟的数据
            vue: [[1], [[1], [[{ op: { ag: [{ v: 1 }], vg: { o: 1 } } }]]], [{ c: 1 }], 1], // 1
            react: [[1], ''],
        },
        empty: [
            // 基本类型注释
            1,
            // 基本类型注释
            1
        ]
    }, {
        topicName: {
            // 整一堆数据
            vue: [[1], [''], 1], // 2
            react: [['']],
        },
        // 空数据测试
        empty: [
            // 这里是个数组
            [ [ ], [ {} ], 1, '', '', 1 ], {  }
        ]
    },
    [
        {
            json: 1,
            name: '?'
        }
    ],
    [
        {
            json: ''
        },
        'string'
    ],
];
