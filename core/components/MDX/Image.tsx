import { styled, Text } from '@maximeheckel/design-system';
import { loader } from 'lib/next-image-loader';
import NextImage, { ImageProps } from 'next/legacy/image';

const StyledFigure = styled('figure', {
  margin: 0,
});

const Image = (props: ImageProps) => {
  return (
    <StyledFigure>
      <NextImage {...props} loader={loader} quality={75} />
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
