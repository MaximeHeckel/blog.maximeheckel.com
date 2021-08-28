import Radio from '../Radio';
import { isRadioItemElement } from '../utils';

describe('Radio - utils', () => {
  it('isRadioItemElement', () => {
    // @ts-ignore
    const Component1 = <Radio.Item />;
    // @ts-ignore
    const Component2 = <Radio.Group />;

    expect(isRadioItemElement(Component1)).toBeTruthy();
    expect(isRadioItemElement(Component2)).toBeFalsy();
  });
});
