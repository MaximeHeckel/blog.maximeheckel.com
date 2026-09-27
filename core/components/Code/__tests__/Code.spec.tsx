import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { it, describe, expect } from 'vitest';

import Code from '../';
import { preToCodeBlock, calculateLinesToHighlight, hasTitle } from '../utils';

describe('Code', () => {
  it('Renders diff changes while preserving headers, context, and prefixes', async () => {
    const source = [
      '--- before.js',
      '+++ after.js',
      '@@ -1,2 +1,3 @@',
      ' const unchanged = true;',
      '-const roughness = 0.8;',
      '+const roughness = 0.2;',
      '+',
      ' const end = true;',
    ].join('\n');
    const { container, getAllByTestId } = render(
      <Code>
        <code className="language-diff">{source}</code>
      </Code>
    );

    await waitFor(() => {
      expect(getAllByTestId('line')).toHaveLength(8);
    });

    const lines = getAllByTestId('line');
    expect(lines[4]).toHaveAttribute('data-diff', 'removed');
    expect(lines[5]).toHaveAttribute('data-diff', 'added');
    expect(lines[6]).toHaveAttribute('data-diff', 'added');
    for (const index of [0, 1, 2, 3, 7]) {
      expect(lines[index]).not.toHaveAttribute('data-diff');
    }
    expect(container.querySelector('.token.prefix.deleted')).toHaveTextContent(
      '-'
    );
    expect(container.querySelector('.token.prefix.inserted')).toHaveTextContent(
      '+'
    );
    expect(
      getAllByTestId('content-line')
        .map((token) => token.textContent)
        .join('')
    ).toBe(source.replaceAll('\n', ''));
  });

  it('Does not treat JavaScript operators as diff markers', async () => {
    const { container, getAllByTestId } = render(
      <Code>
        <code className="language-javascript">{'++count;\n--count;'}</code>
      </Code>
    );

    await waitFor(() => {
      expect(getAllByTestId('line')).toHaveLength(2);
    });
    expect(container.querySelector('[data-diff]')).not.toBeInTheDocument();
    expect(container.querySelector('.token.operator')).toBeInTheDocument();
  });

  it('hasTitle returns the title part of a given metastring if present', () => {
    expect(hasTitle('hello,world,title=Test123')).toBe('Test123');
    expect(hasTitle('hello,world')).toBe('');
  });

  it('calculateLinesToHighlight returns the proper set of lignes to highlight of a given metastring', () => {
    expect(
      calculateLinesToHighlight(
        'javascript {7-12} title=Writing the rule (step 1)'
      )(1)
    ).toBeFalsy();
    expect(
      calculateLinesToHighlight(
        'javascript {7-12} title=Writing the rule (step 1)'
      )(7)
    ).toBeTruthy();

    expect(
      calculateLinesToHighlight('javascript title=Writing the rule (step 1)')(7)
    ).toBeFalsy();
  });

  it('preToCodeBlock returns the proper set of props for our code block components if the children are of type <code>', () => {
    const preProps = {
      children: {
        props: {
          children: 'some code to render',
          mdxType: 'code',
          metastring: 'javascript',
        },
      } as React.ReactNode,
    };
    expect(preToCodeBlock(preProps)).toMatchSnapshot();
  });

  it('Renders a Codeblock component when the proper preProps are passed', async () => {
    const { container } = render(
      <Code>
        {/* @ts-ignore */}
        <div metastring="javascript">var hello="world"</div>
      </Code>
    );

    await waitFor(() => {
      expect(container.querySelector('pre[class="prism-code"]')).toBeDefined();
    });
  });

  it('Renders a Codeblock with title when the proper preProps are passed', async () => {
    const { container, getByTestId } = render(
      <Code>
        {/* @ts-ignore */}
        <div metastring="javascript title=test">some code to render</div>
      </Code>
    );

    await waitFor(() => {
      expect(
        container.querySelector('p[data-testid="codesnippet-title"]')
      ).toHaveTextContent('test');
      expect(container.querySelector('pre[class="prism-code"]')).toBeDefined();
      expect(getByTestId('number-line')).toBeDefined();
      expect(getByTestId('number-line')).toHaveTextContent('1');
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  it('Renders a Codeblock with title and line highlight when the proper preProps are passed', async () => {
    const { container, getAllByTestId } = render(
      <Code>
        {/* @ts-ignore */}
        <div metastring="javascript {1-3} title=test">
          {`some code to render
            some code to render 2
            some code to render 3
            some code to render 4`}
        </div>
      </Code>
    );

    await waitFor(() => {
      expect(
        container.querySelector('p[data-testid="codesnippet-title"]')
      ).toHaveTextContent('test');
      expect(getAllByTestId('number-line')).toHaveLength(4);
      expect(getAllByTestId('highlight-line')).toHaveLength(3);
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });
});
