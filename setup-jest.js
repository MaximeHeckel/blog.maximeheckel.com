import '@testing-library/jest-dom/extend-expect';

global.___loader = {
  enqueue: jest.fn(),
};

window.SVGElement.prototype.getTotalLength = () => jest.fn();
