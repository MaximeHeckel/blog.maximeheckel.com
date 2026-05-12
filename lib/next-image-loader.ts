import { ImageLoaderProps } from 'next/legacy/image';

export const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) => {
  // @ts-ignore
  const params = [`w=${width}`, `q=${quality || 75}`];
  // return `https://images.maximeheckel.com/cdn-cgi/image/${params.join(',')}/https://cdn.maximeheckel.com/images/${src}`;
  return `https://assets.maximeheckel.com/images/${src}?${params.join('&')}`;
};
