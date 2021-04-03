import styled from '@emotion/styled';

export const TransitionGridWrapper = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 32px;

  @media (max-width: 950px) {
    padding: 0;
  }

  > div {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
`;

export const AnimationCard = styled('div')`
  background: var(--maximeheckel-colors-foreground);
  color: var(--maximeheckel-colors-typeface-1);
  font-weight: 500;
  backdrop-filter: blur(6px);
  border-radius: var(--border-radius-2);
  margin: 0 auto;
  overflow: hidden;
  box-shadow: var(--maximeheckel-shadow-2);
  margin: 30px 0px;

  .snippet {
    margin: 0px auto;
  }

  pre {
    background-color: transparent !important;
  }
`;

export const AnimationCardContent = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: 450px;
  padding: 12px 0px;
`;

export const AnimationCardHeader = styled('div')`
  min-height: 45px;
  padding: 15px 14px;
  width: 100%;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
`;

export const HighlightedValue = styled('div')`
  border-radius: 4px;
  background-color: var(--maximeheckel-colors-emphasis);
  color: var(--maximeheckel-colors-brand);
  border: 1px solid var(--maximeheckel-colors-brand);
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 6px;
  padding-right: 6px;
  font-family: Fira Code;
  display: inline;
`;

export const Wrapper = styled('div')`
  margin: 16px 0px;

  @media (min-width: 1100px) {
    position: relative;
    max-width: 1000px;
    width: calc(100% + 300px);
    margin: 16px -150px;
  }
`;

export const Form = styled('form')`
  margin: 20px 0;
  width: 70%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 14px;

  label {
    margin-bottom: 8px;
  }

  input {
    margin-bottom: 8px;
  }

  select {
    border: 1px solid var(--maximeheckel-colors-brand);
    box-shadow: none;
    background-color: var(--maximeheckel-colors-emphasis);
    color: var(--maximeheckel-colors-brand);
    height: 30px;
    border-radius: 4px;
    padding: 5px;
  }
`;
