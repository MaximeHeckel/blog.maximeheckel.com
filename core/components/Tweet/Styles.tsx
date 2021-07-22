import styled from '@emotion/styled';

export const TweetWrapper = styled('div')`
  color: var(--maximeheckel-colors-typeface-primary);
  border-radius: var(--border-radius-2);
  background-color: var(--maximeheckel-colors-foreground);
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  width: 100%;

  border: solid 1px var(--maximeheckel-border-color);
  box-shadow: var(--maximeheckel-shadow-1);

  @media (max-width: 700px) {
    /**
     * Make it fullbleed! 
     */
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;

    border-radius: 0px;
  }

  a {
    text-decoration: none;
    color: var(--maximeheckel-colors-typeface-tertiary) !important;
  }
`;

export const Avatar = styled('a')`
  display: flex;
  height: 46px;
  width: 46px;
`;

export const Name = styled('a')`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;

  span:first-of-type {
    display: flex;
    align-items: center;
    font-weight: 700;
    color: var(--maximeheckel-colors-typeface-primary);
  }
`;

export const Body = styled('p')`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
`;

export const ImageGrid = styled('div')`
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  -moz-column-gap: 0.5rem;
  column-gap: 0.5rem;
  row-grap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const SingleImageWrapper = styled('div')`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const ActionIcons = styled('a')`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`;
