import styled from '@emotion/styled';
import React from 'react';
import { useTheme } from '@theme/context/ThemeContext';

interface Props {
  poster?: string;
  controls?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  src: string;
}

const Wrapper = styled('div')`
  margin-bottom: 32px;
  display: flex;

  video {
    margin: 0 auto;
    background: var(--maximeheckel-colors-emphasis);
    max-width: 100%;
    height: auto;
  }
`;

const getDisplayedPoster = (poster: string, dark: boolean) => {
  if (dark) {
    return `/static/posters/${poster}_dark.png`;
  }

  return `/static/posters/${poster}_light.png`;
};

const VideoPlayer = (props: Props) => {
  const { controls, loop, width, height, poster, src } = props;
  const { dark } = useTheme();
  const [currentPoster, setCurrentPoster] = React.useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (poster) {
      if (!poster.includes('.png')) {
        setCurrentPoster(getDisplayedPoster(poster, dark));
      } else {
        setCurrentPoster(poster);
      }
    }
  }, [dark, poster]);

  return (
    <Wrapper>
      <video
        poster={currentPoster}
        width={width}
        height={height}
        controls={controls}
        loop={loop || false}
      >
        <source src={src} type="video/mp4" />
      </video>
    </Wrapper>
  );
};

export { VideoPlayer };
