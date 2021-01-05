import findAfter from 'unist-util-find-after';
import visit from 'unist-util-visit-parents';

const MAX_HEADING_DEPTH = 2;

function sectionize(node, ancestors) {
  const start = node;
  const depth = start.depth;
  const parent = ancestors[ancestors.length - 1];
  const id = node.data.id;

  const isEnd = (node) =>
    (node.type === 'heading' && node.depth <= depth) || node.type === 'export';
  const end = findAfter(parent, start, isEnd);

  const startIndex = parent.children.indexOf(start);
  const endIndex = parent.children.indexOf(end);

  const between = parent.children.slice(
    startIndex,
    endIndex > 0 ? endIndex : undefined
  );

  const section = {
    type: 'section',
    depth: depth,
    children: between,
    data: {
      hName: 'section',
      hProperties: {
        id: `${id}-section`,
      },
    },
  };

  parent.children.splice(startIndex, section.children.length, section);
}

function transform(tree) {
  for (let depth = MAX_HEADING_DEPTH; depth > 0; depth--) {
    visit(
      tree,
      (node) => node.type === 'heading' && node.depth === depth,
      sectionize
    );
  }
}

export const remarkSectionize = () => {
  return transform;
};
