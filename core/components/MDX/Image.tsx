import NextImage from 'next/image';

const Image = (props: any) => {
  return (
    <figure>
      <NextImage {...props} />
      <figcaption>{props.alt}</figcaption>
    </figure>
  );
};

export default Image;
