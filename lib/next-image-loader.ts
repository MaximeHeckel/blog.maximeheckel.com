import { ImageLoaderProps } from 'next/legacy/image';

export const loader = ({ src }: ImageLoaderProps) => {
  return `https://res.cloudinary.com/dg5nsedzw/image/upload/fl_lossy,f_auto,q_auto/${src}`;
};

export const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=webp'];
  return `https://images.maximeheckel.com/cdn-cgi/image/${params.join(',')}/https://cdn.maximeheckel.com/images/${src}`;
};
