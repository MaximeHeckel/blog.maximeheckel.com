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
    margin-left: auto;
    margin-right: auto;
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

export const HighlightedValue = styled('div')`
  border-radius: var(--border-radius-0);
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
  margin: 30px 0px;

  @media (min-width: 1100px) {
    position: relative;
    max-width: 1000px;
    width: calc(100% + 300px);
    margin: 30px -150px;
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
    border-radius: var(--border-radius-0);
    padding: 5px;
  }
`;
