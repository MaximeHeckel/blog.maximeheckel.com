import visit from 'unist-util-visit';

const replace = (source) => ({
  with: (target) => {
    for (let property in source) {
      if (!target.hasOwnProperty(property)) delete source[property];
    }
    Object.assign(source, target);
  },
});

const transform = (tree) => {
  visit(tree, 'image', (node) => {
    if (!node.alt) return;

    const figure = {
      type: 'figure',
      children: [
        {
          type: 'image',
          url: node.url,
          title: null,
          alt: null,
          position: node.position,
        },
        {
          type: 'jsx',
          value: `<figcaption>${node.alt}</figcaption>`,
        },
      ],
      data: {
        hName: 'figure',
      },
    };

    replace(node).with(figure);
  });
};

export const remarkFigure = () => {
  return transform;
};
