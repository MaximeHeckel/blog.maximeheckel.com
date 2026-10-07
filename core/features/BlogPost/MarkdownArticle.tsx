import { styled } from '@maximeheckel/design-system';
import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { alphanumericChars } from '@core/components/ScrambledText';

interface MarkdownArticleProps {
  markdown: string;
  animateReveal: boolean;
}

const Source = styled('pre', {
  margin: 0,
  padding: 'var(--space-12) 0 var(--space-13)',
  width: '100%',
  minWidth: 0,
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--font-size-1)',
  fontWeight: 'var(--font-weight-400)',
  lineHeight: 1.8,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  tabSize: 2,
  '& code': { font: 'inherit' },
});

// Share one animation clock across the opening lines. The rest of the source
// stays immediately available, even for articles with thousands of lines.
const OpeningLines = ({ lines }: { lines: string[] }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: 1.1,
      ease: 'linear',
      onUpdate: setProgress,
    });
    return () => controls.stop();
  }, []);

  return lines.map((line, index) => {
    const lineProgress = Math.min(
      1,
      Math.max(0, (progress - index * 0.012) / 0.65)
    );
    const end = Math.floor(line.length * lineProgress);
    const scramble = line
      .slice(end, end + 3)
      .replace(
        /\S/g,
        () =>
          alphanumericChars[
            Math.floor(Math.random() * alphanumericChars.length)
          ]
      );

    return (
      <span key={index} style={{ display: 'block', position: 'relative' }}>
        <span style={{ visibility: 'hidden' }}>{line || '\u00a0'}</span>
        <span style={{ position: 'absolute', inset: 0 }}>
          {lineProgress === 1
            ? line
            : lineProgress === 0
              ? ''
              : line.slice(0, end) + scramble}
        </span>
      </span>
    );
  });
};

export const MarkdownArticle = ({
  markdown,
  animateReveal,
}: MarkdownArticleProps) => {
  const reducedMotion = useReducedMotion();
  const [revealing, setRevealing] = useState(animateReveal);

  useEffect(() => {
    if (!animateReveal || reducedMotion) return;
    const timer = setTimeout(() => setRevealing(false), 1150);
    return () => clearTimeout(timer);
  }, [animateReveal, reducedMotion]);

  const animateOpening = revealing && !reducedMotion;
  const lines = markdown.split('\n');
  const opening = lines.slice(0, 24);

  return (
    <Source
      aria-label="Article Markdown source"
      data-animate-reveal={animateOpening}
    >
      {animateOpening ? (
        <>
          <code
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
            }}
          >
            {markdown}
          </code>
          <span aria-hidden="true">
            <OpeningLines lines={opening} />
            {lines.slice(24).join('\n')}
          </span>
        </>
      ) : (
        <code>{markdown}</code>
      )}
    </Source>
  );
};
