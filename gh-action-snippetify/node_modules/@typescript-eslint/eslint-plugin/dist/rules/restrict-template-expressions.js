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
const ts = __importStar(require("typescript"));
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'restrict-template-expressions',
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce template literal expressions to be of string type',
            category: 'Best Practices',
            recommended: false,
            requiresTypeChecking: true,
        },
        messages: {
            invalidType: 'Invalid type of template literal expression.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowNumber: { type: 'boolean' },
                    allowBoolean: { type: 'boolean' },
                    allowAny: { type: 'boolean' },
                    allowNullable: { type: 'boolean' },
                },
            },
        ],
    },
    defaultOptions: [{}],
    create(context, [options]) {
        const service = util.getParserServices(context);
        const typeChecker = service.program.getTypeChecker();
        function isUnderlyingTypePrimitive(type) {
            if (util.isTypeFlagSet(type, ts.TypeFlags.StringLike)) {
                return true;
            }
            if (options.allowNumber &&
                util.isTypeFlagSet(type, ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike)) {
                return true;
            }
            if (options.allowBoolean &&
                util.isTypeFlagSet(type, ts.TypeFlags.BooleanLike)) {
                return true;
            }
            if (options.allowAny && util.isTypeFlagSet(type, ts.TypeFlags.Any)) {
                return true;
            }
            if (options.allowNullable &&
                util.isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined)) {
                return true;
            }
            return false;
        }
        return {
            TemplateLiteral(node) {
                // don't check tagged template literals
                if (node.parent.type === experimental_utils_1.AST_NODE_TYPES.TaggedTemplateExpression) {
                    return;
                }
                for (const expression of node.expressions) {
                    if (!isUnderlyingExpressionTypeConfirmingTo(expression, isUnderlyingTypePrimitive)) {
                        context.report({
                            node: expression,
                            messageId: 'invalidType',
                        });
                    }
                }
            },
        };
        function isUnderlyingExpressionTypeConfirmingTo(expression, predicate) {
            return rec(getExpressionNodeType(expression));
            function rec(type) {
                if (type.isUnion()) {
                    return type.types.every(rec);
                }
                if (type.isIntersection()) {
                    return type.types.some(rec);
                }
                return predicate(type);
            }
        }
        /**
         * Helper function to extract the TS type of an TSESTree expression.
         */
        function getExpressionNodeType(node) {
            const tsNode = service.esTreeNodeToTSNodeMap.get(node);
            return util.getConstrainedTypeAtLocation(typeChecker, tsNode);
        }
    },
});
//# sourceMappingURL=restrict-template-expressions.js.map