import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Image from 'next/image';
import React from 'react';
interface HeroImgProps {
  src: string;
  className: string;
}

const HeroImg: React.FC<HeroImgProps> = (props) => (
  <div
    css={css`
      border-radius: var(--border-radius-2);
      width: 100%;
      height: 375px;
      max-width: 100%;
      max-height: 375px;
      overflow: hidden;
      margin: 32px auto;
      position: relative;
    `}
  >
    <Image
      className={props.className}
      src={props.src}
      alt="cover"
      layout="fill"
    />
  </div>
);

const HeroInfo = styled.div`
  margin-bottom: 30px;
  p {
    color: var(--maximeheckel-colors-typeface-2);
    font-size: 14px;
    font-weight: 500;
  }
`;

const HeroSubtitle = styled.h3`
  color: var(--maximeheckel-colors-typeface-2);
`;

const HeroTitle = styled.h1``;

const HeroWrapper = styled.div`
  @media (max-width: 700px) {
    padding: 150px 0px 30px 0px;
  }

  margin: 0 auto;
  max-width: 700px;
  align-items: center;
  color: var(--maximeheckel-colors-typeface-0);
  padding-top: 248px;
`;

class Hero extends React.Component<{ id?: string; style?: object }> {
  public static Img = HeroImg;
  public static Info = HeroInfo;
  public static Subtitle = HeroSubtitle;
  public static Title = HeroTitle;

  render() {
    const { id, children, style } = this.props;
    return (
      <HeroWrapper data-testid="hero" id={id} style={style}>
        {children}
      </HeroWrapper>
    );
  }
}

export { Hero };
