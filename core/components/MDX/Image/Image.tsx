import { Box, Flex, Text } from '@maximeheckel/design-system';
import { loader } from 'lib/next-image-loader';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { Content, Overlay, Trigger } from './Lightbox';

interface ImageProps extends NextImageProps {
  border?: boolean;
}

const Image = (props: ImageProps) => {
  const { border = false, ...rest } = props;

  return (
    <Dialog.Root>
      <Flex
        as="figure"
        direction="column"
        css={{ margin: '0', width: '100%' }}
        alignItems="start"
      >
        <Trigger tabIndex={0}>
          <Box
            as={NextImage}
            css={{
              borderRadius: 'var(--border-radius-3)',
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
            }}
            loader={loader}
            {...rest}
            quality={90}
            sizes="100vw"
            style={{
              border: border
                ? '3px solid oklch(from var(--gray-500) l c h / 70%)'
                : 'none',
            }}
          />
        </Trigger>
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
      </Flex>
      <Dialog.Portal>
        <Overlay>
          <Content>
            <Dialog.Close asChild>
              <Box
                as={NextImage}
                css={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  borderRadius: 'var(--border-radius-3)',
                }}
                loader={loader}
                {...props}
                quality={90}
                sizes="100vw"
              />
            </Dialog.Close>
          </Content>
        </Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Image;
