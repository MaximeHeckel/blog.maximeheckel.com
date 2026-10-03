import { expect, it } from 'vitest';

import { AskMessage, boundAskHistory } from '../askConversation';

const turn = (id: number, content = 'Question'): AskMessage[] => [
  { id: `${id}-user`, role: 'user', content, attachments: [] },
  { id: `${id}-assistant`, role: 'assistant', content: 'Answer', sources: [] },
];

it('retains the six most recent complete turns', () => {
  const messages = Array.from({ length: 8 }, (_, index) => turn(index)).flat();
  expect(boundAskHistory(messages)).toEqual(messages.slice(4));
});

it('bounds serialized history including attachments without cutting a turn', () => {
  const large = turn(1);
  if (large[0].role === 'user')
    large[0].attachments = [
      { id: 'code', kind: 'code', code: 'x'.repeat(24000), language: 'js' },
    ];
  const recent = turn(2);
  expect(boundAskHistory([...turn(0), ...large, ...recent])).toEqual(recent);
});

it('does not pass malformed message ordering to the model', () => {
  expect(boundAskHistory(turn(1).reverse())).toEqual([]);
});
