import { loader } from 'lib/next-image-loader';
import NextImage, { ImageProps } from 'next/image';

const Image = (props: ImageProps) => {
  return (
    <figure>
      <NextImage {...props} loader={loader} quality={50} />
      <figcaption>{props.alt}</figcaption>
    </figure>
  );
};

export default Image;
