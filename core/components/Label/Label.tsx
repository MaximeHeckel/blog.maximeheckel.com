import { styled } from 'lib/stitches.config';

const StyledLabel = styled('label', {
  fontSize: '14px',
  fontWeight: 500,
  display: 'inline-block',
  cursor: 'pointer',
  color: 'var(--maximeheckel-colors-typeface-secondary)',
  userSelect: 'none',
  marginRight: '8px',
  verticalAlign: 'top',
});

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (
  props
) => {
  const { children, ...rest } = props;
  return <StyledLabel {...rest}>{children}</StyledLabel>;
};

export default Label;
