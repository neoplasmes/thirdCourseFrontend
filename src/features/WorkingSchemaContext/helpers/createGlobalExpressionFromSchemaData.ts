import { ExpressionNode, ExpressionNodeType, SchemaDataEntryBase } from '@model/treeModel';

/**
 * Метод используемый для создания глобального дерева-выражения XSD-схемы.
 * Возвращаемый результат используется в дальнейшем для создания вирутального дерева
 * Это надо оптимизировать 100%
 * @param schemaData
 * @returns
 */
export const createGlobalExpressionFromSchemaData = <K extends SchemaDataEntryBase>(
    schemaData: Readonly<Record<string, K>>
) => {
    // Данные копируются потому что потому
    const datacopy: Record<string, K> = JSON.parse(JSON.stringify(schemaData));
    console.log(schemaData);

    const aaa = (node: ExpressionNode, parent: string) => {
        let newParent = parent;

        if (node.type === ExpressionNodeType.LEAF) {
            const nodeKey = `${parent}/${node.value}`;
            if (!datacopy[nodeKey]) {
                return;
            }

            if (Object.keys(datacopy[nodeKey].expression).length > 0) {
                node.children.push(datacopy[nodeKey].expression);
            }
            newParent = node.value;
            node.value = nodeKey;
        }

        if (node.children) {
            for (const child of node.children) {
                aaa(child, newParent);
            }
        }

        console.log(node.value);
    };

    let startPoint;
    let startPointName;
    for (const key in datacopy) {
        if (key.startsWith('begin-c/')) {
            if (startPoint && startPointName) {
                throw new Error('second root occurred');
            }

            startPoint = datacopy[key];
            startPointName = key;
        }
    }

    if (!startPoint || !startPointName) {
        throw new Error('invalid schema data');
    }

    for (const child of [startPoint.expression]) {
        aaa(child, startPointName?.split('/')[1]);
    }

    const normalizedRoot: ExpressionNode = {
        type: ExpressionNodeType.LEAF,
        minOccurs: 1,
        maxOccurs: 1,
        probability: 1,
        value: startPointName,
        children: [startPoint.expression],
    };

    return normalizedRoot;
};
