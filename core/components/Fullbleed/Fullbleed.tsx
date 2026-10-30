import { Box } from '@maximeheckel/design-system';

import { ImageSizesContext } from './ImageSizesContext';

const Fullbleed = (props: {
  children: React.ReactNode;
  maxWidth?: number;
  widthPercent?: number;
}) => {
  const { children, widthPercent = 80, maxWidth = 1000 } = props;
  const imageSizes = `(max-width: 850px) min(663px, calc(100vw - 32px)), max(700px, min(${widthPercent}vw, ${maxWidth}px))`;

  return (
    <Box
      css={{
        position: 'relative',
        margin: `0 -50vw 0 -50vw`,
        left: '50%',
        right: '50%',
        width: `100vw`,

        '@media(max-width: 850px)': {
          padding: 0,
          margin: 0,
          left: 0,
          right: 0,
          width: '100%',
        },
      }}
      data-fullbleed
    >
      <Box
        css={{
          margin: '0 auto',
          maxWidth: `${maxWidth}px`,
          width: `${widthPercent}%`,
          minWidth: 700,
          '@media(max-width: 850px)': {
            width: '100%',
            maxWidth: 700,
            minWidth: 0,
          },
        }}
      >
        <ImageSizesContext.Provider value={imageSizes}>
          {children}
        </ImageSizesContext.Provider>
      </Box>
    </Box>
  );
};

export default Fullbleed;
