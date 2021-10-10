import { loader } from 'lib/next-image-loader';
import { styled } from 'lib/stitches.config';
import NextImage, { ImageProps } from 'next/image';

const StyledFigure = styled('figure', {
  marginBottom: '2.25rem',
});

const StyledFigCaption = styled('figcaption', {
  fontSize: '14px',
  textAlign: 'left',
  lineHeight: '1.5',
  fontWeight: '500',
  color: 'var(--maximeheckel-colors-typeface-tertiary)',
  paddingTop: '10px',
});

const Image = (props: ImageProps) => {
  return (
    <StyledFigure>
      <NextImage {...props} loader={loader} quality={50} />
      <StyledFigCaption>{props.alt}</StyledFigCaption>
    </StyledFigure>
  );
};

export default Image;
