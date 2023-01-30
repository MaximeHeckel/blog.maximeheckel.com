import { ImageLoaderProps } from 'next/legacy/image';

export const loader = ({ src, width, quality }: ImageLoaderProps) => {
  if (src.endsWith('.gif')) {
    return `https://res.cloudinary.com/dg5nsedzw/image/upload/${src}`;
  }

  return `https://res.cloudinary.com/dg5nsedzw/image/upload/f_auto,w_${width},q_${
    quality || 75
  }/${src}`;
};
