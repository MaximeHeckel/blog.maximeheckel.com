import styled from '@emotion/styled';
import React from 'react';
import Plyr from 'plyr-react';
import { useTheme } from '@theme/context/ThemeContext';
import 'plyr-react/dist/plyr.css';

interface Props {
  poster?: string;
  controls?: string[];
  loop?: boolean;
  width?: number;
  src: string;
}

const Wrapper = styled('div')<{ width?: number }>`
  height: 720px;
  margin-bottom: 32px;

  .plyr {
    margin: 0 auto;
    border-radius: var(--border-radius-2);
    background: unset;
    width: ${(p) => `${p.width}px` || '100%'};
  }

  .plyr__video-wrapper {
    background: var(--maximeheckel-colors-emphasis);
  }
`;

const getDisplayedPoster = (poster: string, dark: boolean) => {
  if (dark) {
    return `/static/posters/${poster}_dark.png`;
  }

  return `/static/posters/${poster}_light.png`;
};

const VideoPlayer = (props: Props) => {
  const { controls, loop, width, poster, src } = props;
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

  const config = {
    controls: controls || [],
    loop: { active: loop || false },
  };

  return (
    <Wrapper width={width}>
      <Plyr
        source={{
          type: 'video',
          sources: [{ src }],
          poster: currentPoster,
        }}
        options={config}
      />
    </Wrapper>
  );
};

export { VideoPlayer };
