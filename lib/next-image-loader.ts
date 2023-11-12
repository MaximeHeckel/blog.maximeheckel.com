import { ImageLoaderProps } from 'next/legacy/image';

export const loader = ({ src, quality }: ImageLoaderProps) => {
  return `https://res.cloudinary.com/dg5nsedzw/image/upload/q_${quality}/${src}`;
};
