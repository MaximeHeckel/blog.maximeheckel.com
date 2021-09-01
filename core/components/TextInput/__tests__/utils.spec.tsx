import { validateEmail } from '../utils';

describe('TextInput - utils', () => {
  it('validateEmail returns true if the email is valid', () => {
    expect(validateEmail('hello@maximeheckel.com')).toBeTruthy();
    expect(validateEmail('hello@maximeheckel')).toBeFalsy();
  });
});
