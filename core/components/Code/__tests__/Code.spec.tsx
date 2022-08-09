/* eslint-disable react/no-unescaped-entities */
import preloadAll from 'jest-next-dynamic';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import Code from '../';
import { preToCodeBlock, calculateLinesToHighlight, hasTitle } from '../utils';

beforeAll(async () => {
  await preloadAll();
});

afterEach(() => {
  cleanup();
});

describe('Code', () => {
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
      },
    };
    expect(preToCodeBlock(preProps)).toMatchSnapshot();
  });

  it('Renders a Codeblock component when the proper preProps are passed', () => {
    const { container, getByTestId } = render(
      <Code>
        <div metastring="javascript">var hello="world"</div>
      </Code>
    );

    expect(container.querySelector('pre[class="prism-code"]')).toBeDefined();
    expect(getByTestId('number-line')).toBeDefined();

    expect(getByTestId('number-line')).toHaveTextContent(1);
  });

  it('Renders a Codeblock with title when the proper preProps are passed', () => {
    const { container, getByTestId } = render(
      <Code>
        <div metastring="javascript title=test">some code to render</div>
      </Code>
    );

    expect(
      container.querySelector('p[data-testid="codesnippet-title"]')
    ).toHaveTextContent('test');
    expect(container.querySelector('pre[class="prism-code"]')).toBeDefined();
    expect(getByTestId('number-line')).toBeDefined();
    expect(getByTestId('number-line')).toHaveTextContent(1);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('Renders a Codeblock with title and line highlight when the proper preProps are passed', () => {
    const { container, getAllByTestId } = render(
      <Code>
        <div metastring="javascript {1-3} title=test">
          {`some code to render
            some code to render 2
            some code to render 3
            some code to render 4`}
        </div>
      </Code>
    );

    expect(
      container.querySelector('p[data-testid="codesnippet-title"]')
    ).toHaveTextContent('test');
    expect(getAllByTestId('number-line')).toHaveLength(4);
    expect(getAllByTestId('highlight-line')).toHaveLength(3);
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});
