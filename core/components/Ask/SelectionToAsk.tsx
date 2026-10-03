import { Popover } from '@base-ui/react/popover';
import { styled } from '@maximeheckel/design-system';
import { motion, useReducedMotion } from 'motion/react';
import { PointerEvent, RefObject, useEffect, useState } from 'react';

import { useOptionalAsk } from './AskContext';

interface SelectionToAskProps {
  articleRef: RefObject<HTMLElement | null>;
  title: string;
}

const excluded =
  'pre, button, input, textarea, select, [contenteditable], [role="dialog"], [role="textbox"], .sp-wrapper, .cm-editor, .monaco-editor, [data-ask-selection-ignore]';

const Action = styled('button', {
  appearance: 'none',
  cursor: 'pointer',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  border: '1px solid oklch(from var(--text-primary) l c h / 0.12)',
  borderRadius: 'var(--border-radius-2)',
  padding: 'var(--space-2) var(--space-3)',
  fontFamily: 'inherit',
  fontSize: 'var(--font-size-1)',
  '&:hover': { background: 'var(--code-snippet-background)' },
  '&:focus-visible': { outline: '2px solid var(--accent)', outlineOffset: 2 },
});

export const SelectionToAsk = ({ articleRef, title }: SelectionToAskProps) => {
  const openAsk = useOptionalAsk();
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<{
    text: string;
    range: Range;
    contextElement: HTMLElement;
  } | null>(null);

  useEffect(() => {
    if (!openAsk) return;

    let selecting = false;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      if (selecting) return;
      const selection = window.getSelection();
      const article = articleRef.current;
      const text = selection?.toString().trim();
      if (!article || !selection || !text || selection.rangeCount !== 1) {
        setSelected(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (
        !article.contains(range.startContainer) ||
        !article.contains(range.endContainer) ||
        Array.from(article.querySelectorAll(excluded)).some((element) =>
          range.intersectsNode(element)
        )
      ) {
        setSelected(null);
        return;
      }
      setSelected({ text, range: range.cloneRange(), contextElement: article });
    };

    const startSelection = (event: globalThis.PointerEvent) => {
      if (
        !(event.target instanceof Node) ||
        !articleRef.current?.contains(event.target)
      )
        return;
      clearTimeout(releaseTimer);
      selecting = true;
      setSelected(null);
    };
    const finishSelection = () => {
      if (!selecting) return;
      // Wait until the release/click gesture has finished before opening a popover.
      // Otherwise its outside-press handler can dismiss it on that same gesture.
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        selecting = false;
        update();
      }, 0);
    };
    const cancelSelection = () => {
      clearTimeout(releaseTimer);
      selecting = false;
      setSelected(null);
    };

    document.addEventListener('pointerdown', startSelection);
    document.addEventListener('pointerup', finishSelection);
    document.addEventListener('pointercancel', cancelSelection);
    document.addEventListener('selectionchange', update);
    return () => {
      clearTimeout(releaseTimer);
      document.removeEventListener('pointerdown', startSelection);
      document.removeEventListener('pointerup', finishSelection);
      document.removeEventListener('pointercancel', cancelSelection);
      document.removeEventListener('selectionchange', update);
    };
  }, [articleRef, openAsk]);

  return (
    <Popover.Root
      open={!!selected}
      onOpenChange={(open) => {
        if (!open) setSelected(null);
      }}
    >
      {selected ? (
        <Popover.Portal>
          <Popover.Positioner
            side="top"
            sideOffset={8}
            positionMethod="fixed"
            anchor={{
              getBoundingClientRect: () =>
                selected.range.getBoundingClientRect(),
              getClientRects: () => selected.range.getClientRects(),
              contextElement: selected.contextElement,
            }}
            style={{ zIndex: 100 }}
          >
            <Popover.Popup initialFocus={false} finalFocus={false}>
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
              >
                <Action
                  type="button"
                  onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    openAsk?.({
                      id: `${window.location.pathname}:selection:${selected.text}`,
                      kind: 'selection',
                      text: selected.text,
                      title,
                      sourceUrl: window.location.href,
                    });
                    setSelected(null);
                    window.getSelection()?.removeAllRanges();
                  }}
                >
                  Send to Ask
                </Action>
              </motion.div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      ) : null}
    </Popover.Root>
  );
};
