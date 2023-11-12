import { Box } from '@maximeheckel/design-system';

const Fullbleed = (props: {
  children: React.ReactNode;
  maxWidth?: number;
  widthPercent?: number;
}) => {
  const { children, widthPercent = 80, maxWidth = 1000 } = props;

  return (
    <Box
      css={{
        margin: `0 -50vw 0 -50vw`,
        position: 'relative',
        left: '50%',
        right: '50%',
        width: `100vw`,
        background: 'transparent',
        backdropFilter: 'blur(6px)',

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
        {children}
      </Box>
    </Box>
  );
};

export default Fullbleed;
