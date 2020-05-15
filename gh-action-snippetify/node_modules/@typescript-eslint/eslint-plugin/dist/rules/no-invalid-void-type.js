"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'no-invalid-void-type',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallows usage of `void` type outside of generic or return types',
            category: 'Best Practices',
            recommended: false,
        },
        messages: {
            invalidVoidForGeneric: '{{ generic }} may not have void as a type variable',
            invalidVoidNotReturnOrGeneric: 'void is only valid as a return type or generic type variable',
            invalidVoidNotReturn: 'void is only valid as a return type',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowInGenericTypeArguments: {
                        oneOf: [
                            { type: 'boolean' },
                            {
                                type: 'array',
                                items: { type: 'string' },
                                minLength: 1,
                            },
                        ],
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{ allowInGenericTypeArguments: true }],
    create(context, [{ allowInGenericTypeArguments }]) {
        const validParents = [
            experimental_utils_1.AST_NODE_TYPES.TSTypeAnnotation,
        ];
        const invalidGrandParents = [
            experimental_utils_1.AST_NODE_TYPES.TSPropertySignature,
            experimental_utils_1.AST_NODE_TYPES.CallExpression,
            experimental_utils_1.AST_NODE_TYPES.ClassProperty,
            experimental_utils_1.AST_NODE_TYPES.Identifier,
        ];
        if (allowInGenericTypeArguments === true) {
            validParents.push(experimental_utils_1.AST_NODE_TYPES.TSTypeParameterInstantiation);
        }
        return {
            TSVoidKeyword(node) {
                var _a;
                /* istanbul ignore next */
                if (!((_a = node.parent) === null || _a === void 0 ? void 0 : _a.parent)) {
                    return;
                }
                if (validParents.includes(node.parent.type) &&
                    !invalidGrandParents.includes(node.parent.parent.type)) {
                    return;
                }
                if (node.parent.type === experimental_utils_1.AST_NODE_TYPES.TSTypeParameterInstantiation &&
                    node.parent.parent.type === experimental_utils_1.AST_NODE_TYPES.TSTypeReference &&
                    Array.isArray(allowInGenericTypeArguments)) {
                    const sourceCode = context.getSourceCode();
                    const fullyQualifiedName = sourceCode
                        .getText(node.parent.parent.typeName)
                        .replace(/ /gu, '');
                    if (!allowInGenericTypeArguments
                        .map(s => s.replace(/ /gu, ''))
                        .includes(fullyQualifiedName)) {
                        context.report({
                            messageId: 'invalidVoidForGeneric',
                            data: { generic: fullyQualifiedName },
                            node,
                        });
                    }
                    return;
                }
                context.report({
                    messageId: allowInGenericTypeArguments
                        ? 'invalidVoidNotReturnOrGeneric'
                        : 'invalidVoidNotReturn',
                    node,
                });
            },
        };
    },
});
//# sourceMappingURL=no-invalid-void-type.js.map