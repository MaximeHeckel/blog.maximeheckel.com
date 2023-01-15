import { Card, Flex, Icon } from '@maximeheckel/design-system';

import React, { useEffect } from 'react';
import ComponentOrText from '../ComponentOrText';
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  StyledContent,
  StyledSummary,
} from './Details.styles';
import { ContentProps, DetailsProps, SummaryProps } from './types';
import { extractChildren } from './utils';

// Move to utils
export const isElementOfTypeSummary = (child: React.ReactNode) => {
  if (child && React.isValidElement(child)) {
    // @ts-ignore
    return child?.type?.name === Summary.name;
  }

  return false;
};

const Summary = (props: SummaryProps) => {
  const { children } = props;

  return (
    <CollapsibleTrigger asChild>
      <StyledSummary>
        <ComponentOrText
          css={{ paddingRight: 'var(--space-8)' }}
          variant="primary"
        >
          {children}
        </ComponentOrText>
        <Flex
          alignItems="center"
          css={{
            position: 'absolute',
            right: 'var(--space-4)',
            top: 'var(--space-5)',
            borderRadius: '50%',
            background: 'var(--maximeheckel-colors-emphasis)',
            width: 'var(--space-6)',
            height: 'var(--space-6)',
          }}
          justifyContent="center"
        >
          <Icon.X size="5" variant="info" />
        </Flex>
      </StyledSummary>
    </CollapsibleTrigger>
  );
};

Summary.displayName = 'Summary';

const Content = (props: ContentProps) => {
  const { children } = props;

  return (
    <StyledContent>
      <ComponentOrText variant="secondary">{children}</ComponentOrText>
    </StyledContent>
  );
};

Content.displayName = 'Content';

const Details = (props: DetailsProps) => {
  const { children } = props;
  const [open, setOpen] = React.useState(false);
  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { match: SummaryComponent, rest } = extractChildren(
    children,
    isElementOfTypeSummary
  );

  const captureClick = (event: MouseEvent | KeyboardEvent) => {
    if (event.target instanceof Element) {
      // Prevent collapsing the details/summary panel when clicking on the content
      if (contentRef.current && contentRef.current.contains(event.target)) {
        event.preventDefault();
        return;
      }

      setOpen((prev) => !prev);
      // Hijack the close event to let the animation run its course before actually closing the detail panel
      if (detailsRef.current && detailsRef.current.hasAttribute('open')) {
        event.preventDefault();

        setTimeout(() => {
          detailsRef.current?.removeAttribute('open');
        }, 400);
      }
    }
  };

  useEffect(() => {
    const detailsElement = detailsRef.current;

    if (detailsElement) {
      detailsElement.addEventListener('click', captureClick);
    }

    return () => {
      detailsElement?.removeEventListener('click', captureClick);
    };
  }, []);

  return (
    <CollapsibleRoot asChild open={open}>
      <Card css={{ marginBottom: '2.25rem' }} data-card-details>
        <details ref={detailsRef}>
          {SummaryComponent}
          <CollapsibleContent ref={contentRef}>{rest}</CollapsibleContent>
        </details>
      </Card>
    </CollapsibleRoot>
  );
};

Details.Summary = Summary;
Details.Content = Content;

export default Details;
