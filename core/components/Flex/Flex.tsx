import styled from '@emotion/styled';

const Flex = styled.div<{
  justifyContent?: string;
  direction?: string;
  wrap?: string;
}>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-wrap: ${(p) => p.wrap || 'nowrap'};
  flex-direction: ${(p) => p.direction || 'row'};
  justify-content: ${(p) => p.justifyContent || 'flex-start'};
  gap: 5px;
`;

export { Flex };
