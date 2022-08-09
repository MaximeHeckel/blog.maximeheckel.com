import { H1, styled } from '@maximeheckel/design-system';
import Image from 'next/image';
import React from 'react';
import { loader } from '../../../lib/next-image-loader';
interface HeroImgProps {
  src: string;
  className: string;
}

const HeroInfo = styled('div', {
  marginBottom: '2.25rem',
});

const HeroSubtitle = styled('h3', {
  color: 'var(--maximeheckel-colors-typeface-tertiary)',
});

const HeroTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => (
  <H1
    {...props}
    css={{
      marginBottom: '16px',
    }}
  />
);

const HeroWrapper = styled('div', {
  color: 'var(--maximeheckel-colors-typeface-primary)',
  gridColumn: '2',
  // paddingTop: '248px',

  // '@media (max-width: 700px)': {
  //   paddingTop: '150px',
  // },
});

const HeroImgWrapper = styled('div', {
  borderRadius: 'var(--border-radius-2)',
  width: '100%',
  height: '375px',
  overflow: 'hidden',
  margin: '32px auto',
  position: 'relative',

  '@media (max-width: 700px)': {
    borderRadius: '0px',
    width: '100vw',
    height: '250px',
    left: '50%',
    right: '50%',
    margin: '32px -50vw',
  },
});

const HeroImg = (props: HeroImgProps) => (
  <HeroImgWrapper>
    <Image
      className={props.className}
      src={props.src}
      alt="cover"
      layout="fill"
      objectFit="cover"
      loader={loader}
      priority
    />
  </HeroImgWrapper>
);

class Hero extends React.Component<{
  id?: string;
  className?: string;
  children: React.ReactNode;
}> {
  public static Img = HeroImg;
  public static Info = HeroInfo;
  public static Subtitle = HeroSubtitle;
  public static Title = HeroTitle;

  render() {
    const { id, children, className } = this.props;
    return (
      <HeroWrapper data-testid="hero" id={id} className={className}>
        {children}
      </HeroWrapper>
    );
  }
}

export { Hero };
