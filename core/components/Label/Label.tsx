import styled from '@emotion/styled';

const StyledLabel = styled('label')`
  font-size: 14px;
  display: inline-block;
  cursor: pointer;
  color: var(--maximeheckel-colors-typeface-secondary);
  font-weight: 500;
  user-select: none;
  margin-right: 8px;
  vertical-align: top;
`;

const Label: React.FC<Omit<React.HTMLProps<HTMLLabelElement>, 'as'>> = (
  props
) => {
  const { children, ...rest } = props;
  return <StyledLabel {...rest}>{children}</StyledLabel>;
};

export default Label;
