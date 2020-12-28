import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'gatsby-theme-maximeheckel/src/context/ThemeContext';

interface Props {
  poster?: string;
  controls?: string[];
  loop?: boolean;
  width?: number;
  src: string;
}

const Wrapper = styled('div')<{ width?: number }>`
  .plyr {
    margin: 0 auto;
    border-radius: var(--border-radius-2);
    background: unset;
    width: ${p => `${p.width}px` || '100%'};
  }

  .plyr__video-wrapper {
    background: var(--maximeheckel-colors-emphasis);
  }
`;

const getDisplayedPoster = (poster: string, dark: boolean) => {
  if (dark) {
    return `/posters/${poster}_dark.png`;
  }

  return `/posters/${poster}_light.png`;
};

const VideoPlayer = (props: Props) => {
  const { controls, loop, width, poster, src } = props;
  const { dark } = useTheme();
  const [currentPoster, setCurrentPoster] = React.useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (poster) {
      setCurrentPoster(getDisplayedPoster(poster, dark));
    }
  }, [dark]);

  const config = JSON.stringify({
    controls: controls || [],
    loop: { active: loop || false },
  });

  return (
    <Wrapper width={width}>
      <video
        id="videoplayer-maximeheckel"
        data-poster={currentPoster}
        data-plyr-config={config}
        poster={currentPoster}
        style={{ margin: '0 auto', width }}
      >
        <source src={src} type="video/mp4" />
        <p>
          Your browser doesn&rsquo;t support HTML5 video. Here is a{' '}
          <a href={src}>link to the video</a> instead.
        </p>
      </video>
    </Wrapper>
  );
};

export { VideoPlayer };
