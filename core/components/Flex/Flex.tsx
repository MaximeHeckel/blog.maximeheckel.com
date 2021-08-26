import styled from '@emotion/styled';

const Flex = styled.div<{
  alignItems?: string;
  justifyContent?: string;
  direction?: string;
  wrap?: string;
  gap?: number;
}>`
  display: flex;
  flex-wrap: wrap;
  align-items: ${(p) => p.alignItems || 'center'};
  flex-wrap: ${(p) => p.wrap || 'nowrap'};
  flex-direction: ${(p) => p.direction || 'row'};
  justify-content: ${(p) => p.justifyContent || 'flex-start'};
  gap: ${(p) => p.gap || 4}px;
`;

export { Flex };
