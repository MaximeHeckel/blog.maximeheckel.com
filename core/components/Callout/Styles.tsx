import styled from '@emotion/styled';

export const StyledCalloutIconWrapper = styled('div')`
  position: absolute;
  display: flex;
  top: -24px;
  right: -20px;
  border-radius: 50%;
  padding: 8px;
  color: var(--maximeheckel-colors-body);
  border: 8px solid var(--maximeheckel-colors-body);
  background: var(--icon-background, var(--maximeheckel-colors-body));

  &[data-variant^='info'] {
    --icon-background: var(--maximeheckel-colors-brand);
  }

  &[data-variant^='danger'] {
    --icon-background: var(--maximeheckel-colors-danger);
  }
`;

export const StyledCalloutLabelWrapper = styled('div')`
  position: absolute;
  display: flex;
  top: -24px;
  right: -8px;
  border-radius: var(--border-radius-1);
  padding: 8px;
  color: var(--maximeheckel-colors-body);
  font-size: 14px;
  font-weight: 500;
  user-select: none;
  background: var(--icon-background, var(--maximeheckel-colors-body));

  &[data-variant^='info'] {
    --icon-background: var(--maximeheckel-colors-brand);
  }

  &[data-variant^='danger'] {
    --icon-background: var(--maximeheckel-colors-danger);
  }
`;

export const StyledCallout = styled('aside')`
  code {
    background: none;
  }

  *:last-child {
    margin-bottom: 0px;
  }

  // margin-left: -8px;
  // margin-right: -8px;

  position: relative;
  padding: 30px 30px;
  margin-bottom: 2.25rem;
  border: 0px solid;

  border-radius: var(--border-radius-1);
  color: var(--maximeheckel-colors-typeface-primary);

  border: 2px solid var(--maximeheckel-colors-foreground);
  background: var(--callout-background, var(--maximeheckel-colors-emphasis));

  &[data-variant^='info'] {
    --callout-background: var(--maximeheckel-colors-emphasis);
  }

  &[data-variant^='danger'] {
    --callout-background: var(--maximeheckel-colors-danger-emphasis);
  }
`;
