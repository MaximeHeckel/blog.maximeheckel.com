import Card from '../Card';
import { CardHeader } from '../Styles';
import { isHeaderElement } from '../utils';

describe('Card - utils', () => {
  it('isHeaderElement', () => {
    const Component1 = <CardHeader />;
    // @ts-ignore
    const Component2 = <Card />;

    expect(isHeaderElement(Component1)).toBeTruthy();
    expect(isHeaderElement(Component2)).toBeFalsy();
  });
});
