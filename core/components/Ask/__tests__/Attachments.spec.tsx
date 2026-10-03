import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import Code from '../../Code';
import CodeBlock from '../../Code/CodeBlock';
import { AskProvider, useAsk } from '../AskContext';
import { AttachmentPills } from '../AttachmentPills';
import { useAICompletion } from '../useAICompletion';

vi.mock('../useAICompletion', () => ({ useAICompletion: vi.fn() }));
vi.mock('../Answer', () => ({ Answer: () => null }));

const code = 'const color = "blue";\nconst opacity = 0.5;';
const submitQuery = vi.fn();

beforeEach(() => {
  submitQuery.mockReset();
  vi.mocked(useAICompletion).mockReturnValue({
    query: '',
    streamData: '',
    sources: undefined,
    status: 'initial',
    error: null,
    submitQuery,
    reset: vi.fn(),
    abort: vi.fn(),
  });
});

const OpenAsk = () => {
  const openAsk = useAsk();
  return <button onClick={() => openAsk()}>Open Ask</button>;
};

const renderCode = (metastring = 'title=Example') =>
  render(
    <AskProvider>
      <OpenAsk />
      <CodeBlock
        codeString={code}
        language="javascript"
        metastring={metastring}
      />
    </AskProvider>
  );

it('attaches titled code without submitting', async () => {
  renderCode();
  fireEvent.click(screen.getByRole('button', { name: 'Send to Ask' }));
  const input = await screen.findByRole('textbox', {
    name: 'Ask a question',
  });
  await waitFor(() => expect(input).toHaveFocus());
  expect(submitQuery).not.toHaveBeenCalled();
  const pill = screen.getByLabelText('Attached context');
  expect(pill).toHaveTextContent('const color = "blue"; …');
  expect(pill).not.toHaveTextContent('opacity');
  expect(pill.querySelector('.token.keyword')).toHaveTextContent('const');
  fireEvent.change(input, { target: { value: 'Explain this' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  expect(submitQuery).toHaveBeenCalledWith(
    'Explain this',
    [expect.objectContaining({ kind: 'code', code, language: 'javascript' })],
    [],
    { kind: 'page', path: '/' }
  );
  expect(screen.queryByLabelText('Attached context')).not.toBeInTheDocument();
});

it('deduplicates repeated sends and preserves the draft and pill across minimizing', async () => {
  renderCode();
  const send = screen.getByRole('button', { name: 'Send to Ask' });
  fireEvent.click(send);
  const input = await screen.findByRole('textbox', { name: 'Ask a question' });
  fireEvent.change(input, { target: { value: 'My draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Minimize Ask' }));
  fireEvent.click(send);
  await waitFor(() =>
    expect(
      screen.getByRole('textbox', { name: 'Ask a question' })
    ).toHaveFocus()
  );
  expect(screen.getByRole('textbox', { name: 'Ask a question' })).toHaveValue(
    'My draft'
  );
  expect(
    screen.getAllByRole('button', { name: 'Remove Example' })
  ).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Remove Example' }));
  expect(screen.queryByLabelText('Attached context')).not.toBeInTheDocument();
  expect(input).toHaveValue('My draft');
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
  expect(submitQuery).toHaveBeenCalledWith('My draft', [], [], {
    path: '/',
    kind: 'page',
  });
});

it('preserves attachments when closing and keeps browser selection independent', async () => {
  renderCode();
  const send = screen.getByRole('button', { name: 'Send to Ask' });
  fireEvent.click(send);
  await screen.findByRole('textbox', { name: 'Ask a question' });
  window.getSelection()?.removeAllRanges();
  fireEvent(document, new Event('selectionchange'));
  expect(screen.getByLabelText('Attached context')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close Ask' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open Ask' }));
  await screen.findByRole('textbox', { name: 'Ask a question' });
  expect(screen.queryByLabelText('Attached context')).toBeInTheDocument();
});

it('supports selection attachments and unknown code languages', () => {
  const onRemove = vi.fn();
  render(
    <AttachmentPills
      attachments={[
        { id: 'selection', kind: 'selection', text: 'A selected\npassage' },
        {
          id: 'code',
          kind: 'code',
          code: 'unknown syntax',
          language: 'unknown',
        },
      ]}
      onRemove={onRemove}
    />
  );
  const context = screen.getByLabelText('Attached context');
  expect(context).toHaveTextContent('A selected passage');
  expect(context).toHaveTextContent('unknown syntax');
  fireEvent.click(
    within(context).getByRole('button', { name: 'Remove selected passage' })
  );
  expect(onRemove).toHaveBeenCalledWith('selection');
});

it('reveals untitled snippet actions on hover and keyboard focus without adding a header', async () => {
  renderCode('');
  const actions = screen.getByRole('group', { name: 'Code actions' });
  const snippet = actions.parentElement!;
  expect(actions.style.pointerEvents).toBe('none');
  expect(screen.queryByTestId('codesnippet-title')).not.toBeInTheDocument();

  fireEvent.pointerEnter(snippet);
  expect(actions.style.pointerEvents).toBe('auto');
  fireEvent.pointerLeave(snippet);
  expect(actions.style.pointerEvents).toBe('none');

  const send = within(actions).getByRole('button', { name: 'Send to Ask' });
  const copy = within(actions).getByRole('button', {
    name: 'Copy code to clipboard',
  });
  fireEvent.focus(send);
  expect(actions.style.pointerEvents).toBe('auto');
  fireEvent.blur(send, { relatedTarget: copy });
  expect(actions.style.pointerEvents).toBe('auto');
  fireEvent.blur(copy, { relatedTarget: document.body });
  expect(actions.style.pointerEvents).toBe('none');

  fireEvent.click(send);
  await screen.findByRole('textbox', { name: 'Ask a question' });
  expect(screen.getByLabelText('Attached context')).toHaveTextContent(
    'const color'
  );
});

it('collapses more than two attachments into one summary counted by type', () => {
  const attachments = [
    ...Array.from({ length: 3 }, (_, index) => ({
      id: `code-${index}`,
      kind: 'code' as const,
      code,
      language: 'javascript',
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      id: `selection-${index}`,
      kind: 'selection' as const,
      text: 'Selected passage',
    })),
  ];
  const onRemoveAll = vi.fn();
  const { rerender } = render(
    <AttachmentPills attachments={attachments} onRemoveAll={onRemoveAll} />
  );
  expect(
    screen.getByText('3 code snippets and 2 highlights')
  ).toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(1);
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove all attachments' })
  );
  expect(onRemoveAll).toHaveBeenCalledOnce();

  rerender(<AttachmentPills attachments={attachments.slice(2)} inMessage />);
  expect(
    screen.getByText('1 code snippet and 2 highlights')
  ).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();

  rerender(<AttachmentPills attachments={attachments.slice(0, 3)} />);
  expect(screen.getByText('3 code snippets')).toBeInTheDocument();

  rerender(<AttachmentPills attachments={attachments.slice(0, 2)} />);
  expect(screen.queryByText('2 code snippets')).not.toBeInTheDocument();
  expect(screen.getAllByText('…')).toHaveLength(2);
});

it('removes all collapsed attachments without clearing the question', async () => {
  render(
    <AskProvider>
      {[1, 2, 3].map((id) => (
        <CodeBlock
          key={id}
          codeString={code}
          language="javascript"
          metastring={`title=Example ${id}`}
        />
      ))}
    </AskProvider>
  );
  for (const button of screen.getAllByRole('button', { name: 'Send to Ask' })) {
    fireEvent.click(button);
  }
  const input = await screen.findByRole('textbox', { name: 'Ask a question' });
  fireEvent.change(input, { target: { value: 'Explain all of these' } });
  fireEvent.click(
    screen.getByRole('button', { name: 'Remove all attachments' })
  );
  expect(screen.queryByLabelText('Attached context')).not.toBeInTheDocument();
  expect(input).toHaveValue('Explain all of these');
  expect(input).toHaveFocus();
});

it('handles a streamed code fence losing and receiving its code content', async () => {
  const snippet = (text?: string) => (
    <AskProvider>
      <Code>
        <code className="language-javascript">{text}</code>
      </Code>
    </AskProvider>
  );
  const { rerender } = render(snippet(code));
  await screen.findByRole('button', { name: 'Send to Ask' });
  rerender(snippet());
  expect(
    screen.queryByRole('button', { name: 'Send to Ask' })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Copy code to clipboard' })
  ).not.toBeInTheDocument();
  rerender(snippet(code));
  await screen.findByRole('button', { name: 'Send to Ask' });
  expect(
    screen.getByRole('button', { name: 'Copy code to clipboard' })
  ).toBeInTheDocument();
});
