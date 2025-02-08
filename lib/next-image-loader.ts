import { ImageLoaderProps } from 'next/legacy/image';

export const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=webp'];
  return `https://images.maximeheckel.com/cdn-cgi/image/${params.join(',')}/https://cdn.maximeheckel.com/images/${src}`;
};
