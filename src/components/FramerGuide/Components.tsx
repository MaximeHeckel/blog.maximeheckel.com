import styled from 'gatsby-theme-maximeheckel/src/utils/styled';

export const TransitionGridWrapper = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
  width: 100vw;
  padding: 0 150px;

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
  background: ${p => p.theme.colors.prism.plain.backgroundColor}70;
  color: ${p => p.theme.bodyColor};
  font-weight: 500;
  backdrop-filter: blur(6px);
  border-radius: 25px;
  margin: 0 auto;
  overflow: hidden;
  box-shadow: ${p => p.theme.boxShadow};
  margin: 30px 0px;

  .snippet {
    margin: 0px;
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
  font-weight: 600;
  font-size: 18px;
`;

export const HighlightedValue = styled('div')`
  border-radius: 4px;
  background-color: rgba(81, 132, 249, 0.15);
  color: ${p => p.theme.colors.blue};
  border: 1px solid ${p => p.theme.colors.blue};
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 6px;
  padding-right: 6px;
  font-family: Fira Code;
  display: inline;
`;

export const Wrapper = styled('div')`
  max-width: 900px;
  position: relative;
  width: 80vw;
  left: calc(-50vw + 50%);
`;

export const Form = styled('form')`
  margin: 20px 0;
  height: 50px;
  width: 70%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 14px;

  input {
    margin-bottom: 8px;
  }

  select {
    border: 1px solid ${p => p.theme.colors.blue};
    box-shadow: none;
    background-color: rgba(81, 132, 249, 0.15);
    color: ${p => p.theme.colors.blue};
    height: 30px;
    border-radius: 5px;
    padding: 5px;
  }
`;
