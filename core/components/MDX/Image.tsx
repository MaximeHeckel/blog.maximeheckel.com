import { styled, Text } from '@maximeheckel/design-system';
import { loader } from 'lib/next-image-loader';
import NextImage, { ImageProps } from 'next/image';

const StyledFigure = styled('figure', {
  margin: 0,
});

const Image = (props: ImageProps) => {
  return (
    <StyledFigure>
      <NextImage
        loader={loader}
        {...props}
        quality={90}
        sizes="100vw"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
        }}
      />
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
