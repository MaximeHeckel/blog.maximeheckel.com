import visit from 'unist-util-visit';

const transform = (tree) => {
  visit(tree, 'element', (node) => {
    if (node.tagName === 'code' && node.data && node.data.meta) {
      node.properties.metastring = node.data.meta;
    }
  });
};

export const remarkMeta = () => {
  return transform;
};
