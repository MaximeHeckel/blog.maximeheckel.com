export const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 100;
  return x - Math.floor(x);
};
