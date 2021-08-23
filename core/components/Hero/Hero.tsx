import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Image from 'next/image';
import React from 'react';
import { loader } from '../../../lib/next-image-loader';
interface HeroImgProps {
  src: string;
  className: string;
}

const HeroImg = (props: HeroImgProps) => (
  <div
    css={css`
      border-radius: var(--border-radius-2);
      width: 100%;
      height: 375px;
      overflow: hidden;
      margin: 32px auto;
      position: relative;

      @media (max-width: 700px) {
        border-radius: 0px;
        width: 100vw;
        height: 250px;
        left: 50%;
        right: 50%;
        margin: 32px -50vw;
      }
    `}
  >
    <Image
      className={props.className}
      src={props.src}
      alt="cover"
      layout="fill"
      objectFit="cover"
      loader={loader}
      priority
    />
  </div>
);

const HeroInfo = styled.div`
  margin-bottom: 2.25rem;
  p {
    color: var(--maximeheckel-colors-typeface-tertiary);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 0px;
  }
`;

const HeroSubtitle = styled.h3`
  color: var(--maximeheckel-colors-typeface-tertiary);
`;

const HeroTitle = styled.h1``;

const HeroWrapper = styled.div`
  align-items: center;
  color: var(--maximeheckel-colors-typeface-primary);
  grid-column: 2;
  padding-top: 248px;

  @media (max-width: 700px) {
    padding-top: 150px;
  }
`;

class Hero extends React.Component<{
  id?: string;
  className?: string;
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
