import { styled, Text } from '@maximeheckel/design-system';
import { loader } from 'lib/next-image-loader';
import NextImage, { ImageProps } from 'next/image';

const StyledFigure = styled('figure', {
  marginBottom: '2.25rem',
  marginLeft: 0,
  marginRight: 0,
});

const Image = (props: ImageProps) => {
  return (
    <StyledFigure>
      <NextImage {...props} loader={loader} quality={50} />
      <Text
        as="figcaption"
        css={{
          lineHeight: '1.5',
          paddingTop: '10px',
        }}
        size="1"
        variant="tertiary"
        weight="3"
      >
        {props.alt}
      </Text>
    </StyledFigure>
  );
};

export default Image;
