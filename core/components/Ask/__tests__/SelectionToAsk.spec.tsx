import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';

import { SelectionToAsk } from '../SelectionToAsk';

const openAsk = vi.fn();
vi.mock('../AskContext', () => ({ useOptionalAsk: () => openAsk }));

const Fixture = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={ref}>
        <p>Selected passage</p>
        <pre>const code = 1;</pre>
        <div contentEditable suppressContentEditableWarning>
          Editor text
        </div>
        <p>Another passage</p>
      </div>
      <p>Outside article</p>
      <SelectionToAsk articleRef={ref} title="Article title" />
    </>
  );
};

const select = (start: string, end = start, release = true) => {
  fireEvent.pointerDown(screen.getByText(start));
  const range = document.createRange();
  range.setStart(screen.getByText(start).firstChild!, 0);
  range.setEnd(screen.getByText(end).firstChild!, end.length);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  fireEvent(document, new Event('selectionchange'));
  if (release) fireEvent.pointerUp(screen.getByText(end));
};

beforeEach(() => {
  openAsk.mockReset();
  window.getSelection()?.removeAllRanges();
  Range.prototype.getBoundingClientRect = () => new DOMRect(100, 100, 150, 20);
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
});

it('attaches selected prose with its source without submitting a question', async () => {
  render(<Fixture />);
  select('Selected passage');
  const action = await screen.findByRole('button', { name: 'Send to Ask' });
  expect(openAsk).not.toHaveBeenCalled();
  fireEvent.pointerDown(action);
  fireEvent.click(action);
  expect(openAsk).toHaveBeenCalledWith({
    id: expect.any(String),
    kind: 'selection',
    text: 'Selected passage',
    title: 'Article title',
    sourceUrl: window.location.href,
  });
  expect(screen.queryByRole('button', { name: 'Send to Ask' })).toBeNull();
  expect(window.getSelection()?.toString()).toBe('');
});

it('dismisses the action when the browser selection is cleared', async () => {
  render(<Fixture />);
  select('Selected passage');
  await screen.findByRole('button', { name: 'Send to Ask' });
  window.getSelection()?.removeAllRanges();
  fireEvent(document, new Event('selectionchange'));
  expect(screen.queryByRole('button', { name: 'Send to Ask' })).toBeNull();
  expect(openAsk).not.toHaveBeenCalled();
});

it.each([
  ['Outside article', 'Outside article'],
  ['const code = 1;', 'const code = 1;'],
  ['Editor text', 'Editor text'],
  ['Selected passage', 'Another passage'],
  ['Another passage', 'Outside article'],
])('ignores excluded selections from %s to %s', async (start, end) => {
  render(<Fixture />);
  select(start, end);
  await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
  expect(screen.queryByRole('button', { name: 'Send to Ask' })).toBeNull();
});

it('dismisses the action with Escape without attaching the passage', async () => {
  render(<Fixture />);
  select('Selected passage');
  await screen.findByRole('button', { name: 'Send to Ask' });
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('button', { name: 'Send to Ask' })).toBeNull();
  expect(openAsk).not.toHaveBeenCalled();
});

it('waits for the selection gesture to finish and stays clickable after release', async () => {
  render(<Fixture />);
  select('Selected passage', 'Selected passage', false);
  expect(screen.queryByRole('button', { name: 'Send to Ask' })).toBeNull();
  fireEvent.pointerUp(screen.getByText('Selected passage'));
  fireEvent.click(screen.getByText('Selected passage'));
  const action = await screen.findByRole('button', { name: 'Send to Ask' });
  fireEvent.pointerDown(action);
  fireEvent.pointerUp(action);
  fireEvent.click(action);
  expect(openAsk).toHaveBeenCalledOnce();
});

it('still supports keyboard selections', async () => {
  render(<Fixture />);
  const range = document.createRange();
  range.selectNodeContents(screen.getByText('Selected passage'));
  window.getSelection()!.addRange(range);
  fireEvent(document, new Event('selectionchange'));
  expect(
    await screen.findByRole('button', { name: 'Send to Ask' })
  ).toBeInTheDocument();
});
