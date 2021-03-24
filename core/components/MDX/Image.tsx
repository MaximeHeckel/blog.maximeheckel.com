import NextImage from 'next/image';

const Image = (props: any) => {
  return (
    <figure>
      <NextImage {...props} quality={50} />
      <figcaption>{props.alt}</figcaption>
    </figure>
  );
};

export default Image;
