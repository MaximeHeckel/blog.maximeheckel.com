import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import Callout, { CalloutVariant } from '..';

const variants: CalloutVariant[] = ['info', 'danger', 'warning'];

it.each([
  ['info', 'Note'],
  ['danger', 'Caution'],
  ['warning', 'Warning'],
] as const)(
  'renders %s content with an inline label and decorative icon',
  (variant, label) => {
    render(
      <Callout variant={variant}>
        <p>Helpful context</p>
        <a href="/posts/scrollspy-demystified/">Read more</a>
      </Callout>
    );

    const callout = screen.getByRole('complementary');
    expect(within(callout).getByText('Helpful context')).toBeInTheDocument();
    expect(
      within(callout).getByRole('link', { name: 'Read more' })
    ).toHaveAttribute('href', '/posts/scrollspy-demystified/');
    expect(within(callout).getByText(label)).toBeInTheDocument();
    expect(callout.querySelectorAll('svg')).toHaveLength(1);
    expect(callout.querySelector('svg')?.parentElement).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  }
);

it.each([undefined, null, ''])(
  'defaults to the info icon and Note with an empty label: %j',
  (label) => {
    render(
      <Callout label={label}>
        <p>Helpful context</p>
      </Callout>
    );
    const callout = screen.getByRole('complementary');
    expect(callout.firstElementChild?.querySelector('svg')).toBeInTheDocument();
    expect(callout.firstElementChild?.textContent).toBe('Note');
    expect(within(callout).getByText('Helpful context')).toBeInTheDocument();
  }
);

it.each(variants)('renders a custom %s label beside the icon', (variant) => {
  render(
    <Callout variant={variant} label={<strong>Before you start</strong>}>
      <p>Helpful context</p>
    </Callout>
  );

  const callout = screen.getByRole('complementary');
  expect(within(callout).getByText('Before you start')).toBeInTheDocument();
  expect(within(callout).getByText('Helpful context')).toBeInTheDocument();
  expect(callout.querySelectorAll('svg')).toHaveLength(1);
});
